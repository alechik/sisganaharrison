<?php

namespace App\Services\Traspasos;

use App\Models\Animal;
use App\Models\DetallePesaje;
use App\Models\DetalleTraspaso;
use App\Models\Lote;
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
        'loteSalida:id,codigo,nombre',
        'loteIngreso:id,codigo,nombre',
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
        $loteId = (int) ($filters['lote_id'] ?? 0);
        $traspasoId = (int) ($filters['traspaso_id'] ?? 0);
        if ($loteId < 1) {
            return collect();
        }

        $incluidos = $traspasoId > 0
            ? DetalleTraspaso::query()->where('traspaso_id', $traspasoId)->pluck('animal_id')->all()
            : [];

        return Animal::query()
            ->with([
                'categoria:id,codigo,nombre',
                'lote:id,nombre,codigo,potrero_id',
                'lote.potrero:id,nombre',
                'detallesPesaje' => fn ($builder) => $builder->latest('id')->limit(1),
            ])
            ->whereNull('deleted_at')
            ->where('estado', Animal::ESTADO_ACTIVO)
            ->where(function (Builder $builder) use ($loteId, $incluidos) {
                $builder->where('lote_id', $loteId);
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
            $loteSalidaId = (int) $data['lote_salida_id'];
            $loteIngresoId = (int) $data['lote_ingreso_id'];

            $this->assertLotesDistintosYActivos($loteSalidaId, $loteIngresoId);
            $lineas = $this->normalizeDetalles($data['detalles'] ?? [], $loteSalidaId);

            $traspaso = Traspaso::query()->create([
                'user_id' => Auth::id(),
                'lote_salida_id' => $loteSalidaId,
                'lote_ingreso_id' => $loteIngresoId,
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
                ->update(['lote_id' => $loteIngresoId]);

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

            $loteSalidaAnterior = (int) $traspaso->lote_salida_id;
            $loteIngresoAnterior = (int) $traspaso->lote_ingreso_id;
            $idsAnteriores = $traspaso->detalles->pluck('animal_id')->map(fn ($id) => (int) $id)->all();

            $loteSalidaId = (int) $data['lote_salida_id'];
            $loteIngresoId = (int) $data['lote_ingreso_id'];
            $this->assertLotesDistintosYActivos($loteSalidaId, $loteIngresoId);

            $lineas = $this->normalizeDetalles(
                $data['detalles'] ?? [],
                $loteSalidaId,
                $idsAnteriores,
                $loteIngresoAnterior
            );
            $idsNuevos = array_column($lineas, 'animal_id');

            $removidos = array_values(array_diff($idsAnteriores, $idsNuevos));
            $agregados = array_values(array_diff($idsNuevos, $idsAnteriores));
            $conservados = array_values(array_intersect($idsAnteriores, $idsNuevos));

            if ($removidos !== []) {
                Animal::query()->whereIn('id', $removidos)->lockForUpdate()->get();
            }

            $this->assertAnimalesEnLote($removidos, $loteIngresoAnterior, 'El animal ya no está en el lote de ingreso del traspaso y no puede revertirse.');
            $this->assertAnimalesEnLote($conservados, $loteIngresoAnterior, 'El animal del traspaso ya no está en el lote de ingreso registrado.');
            $this->assertAnimalesEnLote($agregados, $loteSalidaId, 'El animal no pertenece actualmente al lote de salida.');

            if ($removidos !== []) {
                Animal::query()->whereIn('id', $removidos)->update(['lote_id' => $loteSalidaAnterior]);
            }

            if ($agregados !== []) {
                Animal::query()->whereIn('id', $agregados)->update(['lote_id' => $loteIngresoId]);
            }

            if ($conservados !== [] && $loteIngresoAnterior !== $loteIngresoId) {
                Animal::query()->whereIn('id', $conservados)->update(['lote_id' => $loteIngresoId]);
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
                'lote_salida_id' => $loteSalidaId,
                'lote_ingreso_id' => $loteIngresoId,
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
                    ->orWhereHas('loteSalida', function (Builder $loteQuery) use ($search) {
                        $loteQuery->where('nombre', 'ilike', '%'.$search.'%')
                            ->orWhere('codigo', 'ilike', '%'.$search.'%');
                    })
                    ->orWhereHas('loteIngreso', function (Builder $loteQuery) use ($search) {
                        $loteQuery->where('nombre', 'ilike', '%'.$search.'%')
                            ->orWhere('codigo', 'ilike', '%'.$search.'%');
                    })
                    ->orWhereHas('detalles.animal', function (Builder $animalQuery) use ($search) {
                        $animalQuery->where('codigo', 'ilike', '%'.$search.'%')
                            ->orWhere('arete', 'ilike', '%'.$search.'%');
                    });
            });
        }

        if (! empty($filters['lote_salida_id'])) {
            $query->where('lote_salida_id', (int) $filters['lote_salida_id']);
        }

        if (! empty($filters['lote_ingreso_id'])) {
            $query->where('lote_ingreso_id', (int) $filters['lote_ingreso_id']);
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

    private function assertLotesDistintosYActivos(int $loteSalidaId, int $loteIngresoId): void
    {
        if ($loteSalidaId === $loteIngresoId) {
            throw ValidationException::withMessages([
                'lote_ingreso_id' => 'El lote de salida y el de ingreso deben ser distintos.',
            ]);
        }

        $lotes = Lote::query()
            ->whereIn('id', [$loteSalidaId, $loteIngresoId])
            ->where('activo', true)
            ->whereNull('deleted_at')
            ->lockForUpdate()
            ->get()
            ->keyBy('id');

        if (! $lotes->has($loteSalidaId)) {
            throw ValidationException::withMessages([
                'lote_salida_id' => 'El lote de salida no está activo o no existe.',
            ]);
        }

        if (! $lotes->has($loteIngresoId)) {
            throw ValidationException::withMessages([
                'lote_ingreso_id' => 'El lote de ingreso no está activo o no existe.',
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
        int $loteSalidaId,
        array $existentesEnTraspaso = [],
        ?int $loteIngresoActual = null
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
                if ($loteIngresoActual === null || (int) $animal->lote_id !== $loteIngresoActual) {
                    throw ValidationException::withMessages([
                        "detalles.$index.animal_id" => "El animal {$animal->codigo} ya no está en el lote de ingreso del traspaso.",
                    ]);
                }
            } elseif ((int) $animal->lote_id !== $loteSalidaId) {
                throw ValidationException::withMessages([
                    "detalles.$index.animal_id" => 'El animal no pertenece actualmente al lote de salida.',
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
    private function assertAnimalesEnLote(array $animalIds, int $loteId, string $mensaje): void
    {
        if ($animalIds === []) {
            return;
        }

        $fuera = Animal::query()
            ->whereIn('id', $animalIds)
            ->where(function (Builder $builder) use ($loteId) {
                $builder->where('lote_id', '!=', $loteId)
                    ->orWhereNull('lote_id');
            })
            ->pluck('codigo');

        if ($fuera->isNotEmpty()) {
            throw ValidationException::withMessages([
                'detalles' => $mensaje.' Animales: '.$fuera->implode(', ').'.',
            ]);
        }
    }
}
