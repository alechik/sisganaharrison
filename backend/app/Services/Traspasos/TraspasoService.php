<?php

namespace App\Services\Traspasos;

use App\Models\Animal;
use App\Models\DetallePesaje;
use App\Models\DetalleTraspaso;
use App\Models\Potrero;
use App\Models\Traspaso;
use App\Services\Documentos\PdfGenerator;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Response;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class TraspasoService
{
    private const SORTABLE_COLUMNS = ['fecha_traspaso', 'total_peso', 'monto_total', 'created_at', 'id'];

    private const RELATIONS = [
        'usuario:id,nombre,apellido',
        'potreroSalida:id,codigo,nombre',
        'potreroIngreso:id,codigo,nombre',
        'detalles.animal:id,codigo,arete,sexo,categoria_id',
        'detalles.animal.categoria:id,codigo,nombre',
    ];

    public function __construct(
        private readonly PdfGenerator $pdfGenerator
    ) {}

    /**
     * @param  array<string, mixed>  $filters
     */
    public function paginate(array $filters = []): LengthAwarePaginator
    {
        return $this->buildQuery($filters)
            ->paginate((int) ($filters['per_page'] ?? 10));
    }

    public function find(int $id): Traspaso
    {
        return Traspaso::query()
            ->with(self::RELATIONS)
            ->findOrFail($id);
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return Collection<int, Animal>
     */
    public function animalesDisponibles(array $filters = []): Collection
    {
        $potreroId = (int) ($filters['potrero_id'] ?? 0);
        $traspasoId = (int) ($filters['traspaso_id'] ?? 0);
        if ($potreroId < 1) {
            return collect();
        }

        $incluidos = $traspasoId > 0
            ? DetalleTraspaso::query()->where('traspaso_id', $traspasoId)->pluck('animal_id')->all()
            : [];

        return Animal::query()
            ->with([
                'categoria:id,codigo,nombre',
                'potrero:id,nombre,codigo,parcela_id',
                'potrero.parcela:id,nombre',
                'detallesPesaje' => fn ($builder) => $builder->latest('id')->limit(1),
            ])
            ->whereNull('deleted_at')
            ->where('estado', Animal::ESTADO_ACTIVO)
            ->where(function (Builder $builder) use ($potreroId, $incluidos) {
                $builder->where('potrero_id', $potreroId);
                if ($incluidos !== []) {
                    $builder->orWhereIn('id', $incluidos);
                }
            })
            ->orderBy('codigo')
            ->get();
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Traspaso
    {
        return DB::transaction(function () use ($data) {
            $potreroSalidaId = (int) $data['potrero_salida_id'];
            $potreroIngresoId = (int) $data['potrero_ingreso_id'];

            $this->assertPotrerosDistintosYActivos($potreroSalidaId, $potreroIngresoId);
            $lineas = $this->normalizeDetalles($data['detalles'] ?? [], $potreroSalidaId);

            $traspaso = Traspaso::query()->create([
                'user_id' => Auth::id(),
                'potrero_salida_id' => $potreroSalidaId,
                'potrero_ingreso_id' => $potreroIngresoId,
                'fecha_traspaso' => $data['fecha_traspaso'],
                'observacion' => $data['observacion'] ?? null,
                'total_peso' => 0,
                'monto_total' => 0,
            ]);

            $totalPeso = 0;
            $montoTotal = 0;
            $animalIds = [];

            foreach ($lineas as $linea) {
                $traspaso->detalles()->create($linea);
                $totalPeso += $linea['peso'];
                $montoTotal += $linea['subtotal'];
                $animalIds[] = $linea['animal_id'];
            }

            Animal::query()
                ->whereIn('id', $animalIds)
                ->update(['potrero_id' => $potreroIngresoId, 'grupo_id' => null]);

            $traspaso->total_peso = round($totalPeso, 2);
            $traspaso->monto_total = round($montoTotal, 2);
            $traspaso->save();

            return $traspaso->fresh(self::RELATIONS);
        });
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Traspaso $traspaso, array $data): Traspaso
    {
        return DB::transaction(function () use ($traspaso, $data) {
            $traspaso = Traspaso::query()->lockForUpdate()->findOrFail($traspaso->id);
            $traspaso->load('detalles');

            $potreroSalidaAnterior = (int) $traspaso->potrero_salida_id;
            $potreroIngresoAnterior = (int) $traspaso->potrero_ingreso_id;
            $idsAnteriores = $traspaso->detalles->pluck('animal_id')->map(fn ($id) => (int) $id)->all();

            $potreroSalidaId = (int) $data['potrero_salida_id'];
            $potreroIngresoId = (int) $data['potrero_ingreso_id'];
            $this->assertPotrerosDistintosYActivos($potreroSalidaId, $potreroIngresoId);

            $lineas = $this->normalizeDetalles(
                $data['detalles'] ?? [],
                $potreroSalidaId,
                $idsAnteriores,
                $potreroIngresoAnterior
            );
            $idsNuevos = array_column($lineas, 'animal_id');

            $removidos = array_values(array_diff($idsAnteriores, $idsNuevos));
            $agregados = array_values(array_diff($idsNuevos, $idsAnteriores));
            $conservados = array_values(array_intersect($idsAnteriores, $idsNuevos));

            if ($removidos !== []) {
                Animal::query()->whereIn('id', $removidos)->lockForUpdate()->get();
            }

            $this->assertAnimalesEnPotrero($removidos, $potreroIngresoAnterior, 'El animal ya no está en el potrero de ingreso del traspaso y no puede revertirse.');
            $this->assertAnimalesEnPotrero($conservados, $potreroIngresoAnterior, 'El animal del traspaso ya no está en el potrero de ingreso registrado.');
            $this->assertAnimalesEnPotrero($agregados, $potreroSalidaId, 'El animal no pertenece actualmente al potrero de salida.');

            if ($removidos !== []) {
                Animal::query()->whereIn('id', $removidos)->update(['potrero_id' => $potreroSalidaAnterior, 'grupo_id' => null]);
            }

            if ($agregados !== []) {
                Animal::query()->whereIn('id', $agregados)->update(['potrero_id' => $potreroIngresoId, 'grupo_id' => null]);
            }

            if ($conservados !== [] && $potreroIngresoAnterior !== $potreroIngresoId) {
                Animal::query()->whereIn('id', $conservados)->update(['potrero_id' => $potreroIngresoId, 'grupo_id' => null]);
            }

            $traspaso->detalles()->delete();

            $totalPeso = 0;
            $montoTotal = 0;
            foreach ($lineas as $linea) {
                $traspaso->detalles()->create($linea);
                $totalPeso += $linea['peso'];
                $montoTotal += $linea['subtotal'];
            }

            $traspaso->fill([
                'potrero_salida_id' => $potreroSalidaId,
                'potrero_ingreso_id' => $potreroIngresoId,
                'fecha_traspaso' => $data['fecha_traspaso'],
                'observacion' => $data['observacion'] ?? null,
                'total_peso' => round($totalPeso, 2),
                'monto_total' => round($montoTotal, 2),
            ]);
            $traspaso->save();

            return $traspaso->fresh(self::RELATIONS);
        });
    }

    public function pdf(Traspaso $traspaso, bool $inline = false): Response
    {
        $traspaso->load(self::RELATIONS);

        $payload = [
            'titulo' => 'Traspaso',
            'traspaso' => $traspaso,
        ];

        $filename = 'TRASPASO-'.$traspaso->id.'.pdf';

        return $inline
            ? $this->pdfGenerator->stream('documentos.traspaso', $payload, $filename)
            : $this->pdfGenerator->download('documentos.traspaso', $payload, $filename);
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return Builder<Traspaso>
     */
    private function buildQuery(array $filters): Builder
    {
        $query = Traspaso::query()->with(self::RELATIONS);

        if (! empty($filters['search'])) {
            $search = (string) $filters['search'];
            $query->where(function (Builder $builder) use ($search) {
                $builder->where('observacion', 'ilike', '%'.$search.'%')
                    ->orWhereHas('potreroSalida', function (Builder $potreroQuery) use ($search) {
                        $potreroQuery->where('nombre', 'ilike', '%'.$search.'%')
                            ->orWhere('codigo', 'ilike', '%'.$search.'%');
                    })
                    ->orWhereHas('potreroIngreso', function (Builder $potreroQuery) use ($search) {
                        $potreroQuery->where('nombre', 'ilike', '%'.$search.'%')
                            ->orWhere('codigo', 'ilike', '%'.$search.'%');
                    })
                    ->orWhereHas('detalles.animal', function (Builder $animalQuery) use ($search) {
                        $animalQuery->where('codigo', 'ilike', '%'.$search.'%')
                            ->orWhere('arete', 'ilike', '%'.$search.'%');
                    });
            });
        }

        if (! empty($filters['potrero_salida_id'])) {
            $query->where('potrero_salida_id', (int) $filters['potrero_salida_id']);
        }

        if (! empty($filters['potrero_ingreso_id'])) {
            $query->where('potrero_ingreso_id', (int) $filters['potrero_ingreso_id']);
        }

        if (! empty($filters['fecha_desde'])) {
            $query->whereDate('fecha_traspaso', '>=', $filters['fecha_desde']);
        }

        if (! empty($filters['fecha_hasta'])) {
            $query->whereDate('fecha_traspaso', '<=', $filters['fecha_hasta']);
        }

        $sortBy = in_array($filters['sort_by'] ?? '', self::SORTABLE_COLUMNS, true)
            ? $filters['sort_by']
            : 'fecha_traspaso';

        $sortDir = strtolower((string) ($filters['sort_dir'] ?? 'desc')) === 'asc' ? 'asc' : 'desc';

        return $query->orderBy($sortBy, $sortDir)->orderByDesc('id');
    }

    private function assertPotrerosDistintosYActivos(int $potreroSalidaId, int $potreroIngresoId): void
    {
        if ($potreroSalidaId === $potreroIngresoId) {
            throw ValidationException::withMessages([
                'potrero_ingreso_id' => 'El potrero de salida y el de ingreso deben ser distintos.',
            ]);
        }

        $potreros = Potrero::query()
            ->whereIn('id', [$potreroSalidaId, $potreroIngresoId])
            ->where('activo', true)
            ->whereNull('deleted_at')
            ->lockForUpdate()
            ->get()
            ->keyBy('id');

        if (! $potreros->has($potreroSalidaId)) {
            throw ValidationException::withMessages([
                'potrero_salida_id' => 'El potrero de salida no está activo o no existe.',
            ]);
        }

        if (! $potreros->has($potreroIngresoId)) {
            throw ValidationException::withMessages([
                'potrero_ingreso_id' => 'El potrero de ingreso no está activo o no existe.',
            ]);
        }
    }

    /**
     * @param  array<int, array<string, mixed>>  $detalles
     * @param  list<int>  $existentesEnTraspaso
     * @return list<array{animal_id: int, cantidad: int, peso: float, precio: float, subtotal: float}>
     */
    private function normalizeDetalles(
        array $detalles,
        int $potreroSalidaId,
        array $existentesEnTraspaso = [],
        ?int $potreroIngresoActual = null
    ): array
    {
        if ($detalles === []) {
            throw ValidationException::withMessages([
                'detalles' => 'Debe seleccionar al menos un animal.',
            ]);
        }

        $ids = [];
        foreach ($detalles as $index => $linea) {
            $animalId = (int) ($linea['animal_id'] ?? 0);
            if ($animalId < 1) {
                throw ValidationException::withMessages([
                    "detalles.$index.animal_id" => 'Debe seleccionar un animal.',
                ]);
            }
            if (in_array($animalId, $ids, true)) {
                throw ValidationException::withMessages([
                    "detalles.$index.animal_id" => 'El mismo animal no puede repetirse en el traspaso.',
                ]);
            }
            $ids[] = $animalId;
        }

        sort($ids);

        $animales = Animal::query()
            ->whereIn('id', $ids)
            ->whereNull('deleted_at')
            ->lockForUpdate()
            ->get()
            ->keyBy('id');

        $pesos = DetallePesaje::query()
            ->whereIn('animal_id', $ids)
            ->orderByDesc('id')
            ->get()
            ->unique('animal_id')
            ->keyBy('animal_id');

        $normalizados = [];

        foreach ($ids as $index => $animalId) {
            $animal = $animales->get($animalId);
            if (! $animal || $animal->estado !== Animal::ESTADO_ACTIVO) {
                throw ValidationException::withMessages([
                    "detalles.$index.animal_id" => 'El animal seleccionado no está activo o no existe.',
                ]);
            }

            if (in_array($animalId, $existentesEnTraspaso, true)) {
                if ($potreroIngresoActual === null || (int) $animal->potrero_id !== $potreroIngresoActual) {
                    throw ValidationException::withMessages([
                        "detalles.$index.animal_id" => "El animal {$animal->codigo} ya no está en el potrero de ingreso del traspaso.",
                    ]);
                }
            } elseif ((int) $animal->potrero_id !== $potreroSalidaId) {
                throw ValidationException::withMessages([
                    "detalles.$index.animal_id" => 'El animal no pertenece actualmente al potrero de salida.',
                ]);
            }

            $peso = $pesos->get($animalId)?->peso;
            if ($peso === null || (float) $peso <= 0) {
                throw ValidationException::withMessages([
                    "detalles.$index.animal_id" => "El animal {$animal->codigo} no tiene un peso válido registrado.",
                ]);
            }

            $precio = $animal->precio_kilo;
            if ($precio === null || (float) $precio < 0) {
                throw ValidationException::withMessages([
                    "detalles.$index.animal_id" => "El animal {$animal->codigo} no tiene un precio por kilo válido.",
                ]);
            }

            $peso = round((float) $peso, 2);
            $precio = round((float) $precio, 2);

            $normalizados[] = [
                'animal_id' => $animal->id,
                'cantidad' => 1,
                'peso' => $peso,
                'precio' => $precio,
                'subtotal' => round($peso * $precio, 2),
            ];
        }

        return $normalizados;
    }

    /**
     * @param  list<int>  $animalIds
     */
    private function assertAnimalesEnPotrero(array $animalIds, int $potreroId, string $mensaje): void
    {
        if ($animalIds === []) {
            return;
        }

        $fuera = Animal::query()
            ->whereIn('id', $animalIds)
            ->where(function (Builder $builder) use ($potreroId) {
                $builder->where('potrero_id', '!=', $potreroId)
                    ->orWhereNull('potrero_id');
            })
            ->pluck('codigo');

        if ($fuera->isNotEmpty()) {
            throw ValidationException::withMessages([
                'detalles' => $mensaje.' Animales: '.$fuera->implode(', ').'.',
            ]);
        }
    }
}
