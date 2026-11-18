<?php

namespace App\Services\Pesajes;

use App\Models\Animal;
use App\Models\Ingreso;
use App\Models\Pesaje;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PesajeService
{
    private const SORTABLE_COLUMNS = ['codigo_pesaje', 'fecha_pesaje', 'total_peso', 'created_at'];

    public function __construct(
        private readonly PesajeExcelService $excelService
    ) {}

    private const RELATIONS = [
        'usuario:id,nombre,apellido',
        'detalles.animal:id,codigo,arete,potrero_id,estado',
        'detalles.potrero:id,nombre,codigo,parcela_id',
        'detalles.potrero.parcela:id,nombre',
        'detalles.animal.potrero:id,nombre,codigo,parcela_id',
        'detalles.animal.potrero.parcela:id,nombre',
    ];

    /**
     * @param  array<string, mixed>  $filters
     */
    public function paginate(array $filters = []): LengthAwarePaginator
    {
        return $this->buildQuery($filters)
            ->paginate((int) ($filters['per_page'] ?? 10));
    }

    public function find(int $id): Pesaje
    {
        return Pesaje::query()
            ->with(self::RELATIONS)
            ->findOrFail($id);
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return Collection<int, Animal>
     */
    public function animalesDisponibles(array $filters = []): Collection
    {
        $search = trim((string) ($filters['search'] ?? ''));
        if (mb_strlen($search) < 1) {
            return collect();
        }

        return Animal::query()
            ->with([
                'categoria:id,codigo,nombre',
                'potrero:id,nombre,codigo,parcela_id',
                'potrero.parcela:id,nombre',
                'detallesPesaje' => fn ($builder) => $builder->latest('id')->limit(1),
            ])
            ->whereNull('deleted_at')
            ->where('estado', Animal::ESTADO_ACTIVO)
            ->where(function (Builder $builder) use ($search) {
                $builder->where('arete', 'ilike', "%{$search}%")
                    ->orWhere('codigo', 'ilike', "%{$search}%");
            })
            ->orderBy('arete')
            ->limit(20)
            ->get();
    }

    /**
     * @return array{filename: string, content: string, mime: string}
     */
    public function plantillaExcel(): array
    {
        return $this->excelService->plantilla();
    }

    public function descargarPlantilla(): StreamedResponse
    {
        $plantilla = $this->plantillaExcel();

        return response()->streamDownload(function () use ($plantilla) {
            echo $plantilla['content'];
        }, $plantilla['filename'], [
            'Content-Type' => $plantilla['mime'],
        ]);
    }

    /**
     * @return array{filas: list<array<string, mixed>>, validas: int, con_errores: int}
     */
    public function previewExcel(UploadedFile $file): array
    {
        $crudas = $this->excelService->parse($file);
        $filas = [];
        $aretes = [];
        $validas = 0;
        $conErrores = 0;

        foreach ($crudas as $cruda) {
            $normalizada = $this->normalizarFilaExcel($cruda, $aretes);
            if (($normalizada['errores'] ?? []) === []) {
                $validas++;
            } else {
                $conErrores++;
            }
            $filas[] = $normalizada;
        }

        return [
            'filas' => $filas,
            'validas' => $validas,
            'con_errores' => $conErrores,
        ];
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Pesaje
    {
        return DB::transaction(function () use ($data) {
            $detalles = $this->normalizeDetalles($data['detalles'] ?? [], requirePotrero: true);

            return $this->persistirSesion(
                (string) $data['fecha_pesaje'],
                $data['observacion'] ?? null,
                $detalles,
                Auth::id()
            );
        });
    }

    /**
     * Un ingreso confirmado genera un único pesaje con todos sus animales.
     */
    public function registrarDeIngreso(Ingreso $ingreso): ?Pesaje
    {
        $observacion = Pesaje::observacionDeIngreso($ingreso->codigo);
        $existente = Pesaje::query()->where('observacion', $observacion)->lockForUpdate()->first();
        if ($existente) {
            return $existente->load(self::RELATIONS);
        }

        $ingreso->loadMissing('detalles');
        $detalles = [];
        foreach ($ingreso->detalles as $linea) {
            $detalles[] = [
                'animal_id' => (int) $linea->animal_id,
                'potrero_id' => $ingreso->potrero_id,
                'peso' => round((float) $linea->peso_ingreso, 2),
            ];
        }

        if ($detalles === []) {
            return null;
        }

        return $this->persistirSesion(
            $ingreso->fecha_ingreso?->format('Y-m-d') ?? now()->toDateString(),
            $observacion,
            $detalles,
            $ingreso->user_id ?? Auth::id()
        );
    }

    /**
     * Primer pesaje de una cría viva. No duplica si ya existe el de ese nacimiento/parto.
     */
    public function registrarDeNacimiento(
        Animal $animal,
        string $fecha,
        float $peso,
        string $codigoParto,
        ?int $userId = null
    ): Pesaje {
        $observacion = Pesaje::observacionDeNacimiento($codigoParto);

        $existente = Pesaje::query()
            ->where('observacion', $observacion)
            ->whereHas('detalles', fn (Builder $builder) => $builder->where('animal_id', $animal->id))
            ->lockForUpdate()
            ->first();

        if ($existente) {
            return $existente->load(self::RELATIONS);
        }

        $animal->refresh();

        return $this->persistirSesion(
            $fecha,
            $observacion,
            [[
                'animal_id' => $animal->id,
                'potrero_id' => $animal->potrero_id,
                'peso' => round($peso, 2),
            ]],
            $userId ?? Auth::id()
        );
    }

    /**
     * Pesaje histórico de un animal (p. ej. cuarentena). Un registro por animal y observación.
     */
    public function registrarHistorico(Animal $animal, string $fecha, float $peso, string $observacion): Pesaje
    {
        $existente = Pesaje::query()
            ->where('observacion', $observacion)
            ->whereHas('detalles', fn (Builder $builder) => $builder->where('animal_id', $animal->id))
            ->lockForUpdate()
            ->first();

        if ($existente) {
            return $existente->load(self::RELATIONS);
        }

        $animal->refresh();

        return $this->persistirSesion(
            $fecha,
            $observacion,
            [[
                'animal_id' => $animal->id,
                'potrero_id' => $animal->potrero_id,
                'peso' => round($peso, 2),
            ]],
            Auth::id() ?? $animal->user_id
        );
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return Builder<Pesaje>
     */
    private function buildQuery(array $filters): Builder
    {
        $query = Pesaje::query()->with(self::RELATIONS);

        if (! empty($filters['search'])) {
            $search = (string) $filters['search'];

            $query->where(function (Builder $builder) use ($search) {
                $builder->where('codigo_pesaje', 'ilike', '%'.$search.'%')
                    ->orWhere('observacion', 'ilike', '%'.$search.'%')
                    ->orWhereHas('detalles.animal', function (Builder $animalQuery) use ($search) {
                        $animalQuery->where('codigo', 'ilike', '%'.$search.'%')
                            ->orWhere('arete', 'ilike', '%'.$search.'%');
                    });
            });
        }

        if (! empty($filters['animal_id'])) {
            $query->whereHas(
                'detalles',
                fn (Builder $builder) => $builder->where('animal_id', (int) $filters['animal_id'])
            );
        }

        if (! empty($filters['fecha_desde'])) {
            $query->whereDate('fecha_pesaje', '>=', $filters['fecha_desde']);
        }

        if (! empty($filters['fecha_hasta'])) {
            $query->whereDate('fecha_pesaje', '<=', $filters['fecha_hasta']);
        }

        $sortBy = in_array($filters['sort_by'] ?? '', self::SORTABLE_COLUMNS, true)
            ? $filters['sort_by']
            : 'fecha_pesaje';

        $sortDir = strtolower((string) ($filters['sort_dir'] ?? 'desc')) === 'asc' ? 'asc' : 'desc';

        return $query->orderBy($sortBy, $sortDir);
    }

    /**
     * @param  array<int, array<string, mixed>>  $detalles
     * @return list<array{animal_id: int, potrero_id: int|null, peso: float}>
     */
    private function normalizeDetalles(array $detalles, bool $requirePotrero = false): array
    {
        if ($detalles === []) {
            throw ValidationException::withMessages([
                'detalles' => 'Debe agregar al menos un animal al pesaje.',
            ]);
        }

        $vistos = [];
        $normalizados = [];
        $ids = [];

        foreach ($detalles as $index => $linea) {
            $animalId = (int) ($linea['animal_id'] ?? 0);
            if ($animalId < 1) {
                throw ValidationException::withMessages([
                    "detalles.$index.animal_id" => 'Debe seleccionar un animal.',
                ]);
            }

            if (in_array($animalId, $vistos, true)) {
                throw ValidationException::withMessages([
                    "detalles.$index.animal_id" => 'El mismo animal no puede repetirse en el pesaje.',
                ]);
            }

            $peso = round((float) ($linea['peso'] ?? 0), 2);
            if ($peso < 0.01) {
                throw ValidationException::withMessages([
                    "detalles.$index.peso" => 'El peso debe ser mayor a cero.',
                ]);
            }

            $vistos[] = $animalId;
            $ids[] = $animalId;
            $normalizados[] = [
                'animal_id' => $animalId,
                'potrero_id' => isset($linea['potrero_id']) ? (int) $linea['potrero_id'] : null,
                'peso' => $peso,
            ];
        }

        $animales = Animal::query()
            ->whereIn('id', $ids)
            ->whereNull('deleted_at')
            ->get()
            ->keyBy('id');

        foreach ($normalizados as $index => $linea) {
            /** @var Animal|null $animal */
            $animal = $animales->get($linea['animal_id']);
            if (! $animal) {
                throw ValidationException::withMessages([
                    "detalles.$index.animal_id" => 'El animal seleccionado no existe.',
                ]);
            }

            if ($requirePotrero && $animal->estado !== Animal::ESTADO_ACTIVO) {
                throw ValidationException::withMessages([
                    "detalles.$index.animal_id" => 'El animal seleccionado no está activo.',
                ]);
            }

            $potreroId = $animal->potrero_id;
            if ($requirePotrero && ! $potreroId) {
                throw ValidationException::withMessages([
                    "detalles.$index.animal_id" => 'El animal no tiene un potrero asignado.',
                ]);
            }

            $normalizados[$index]['potrero_id'] = $potreroId;
        }

        return $normalizados;
    }

    /**
     * @param  list<array{animal_id: int, potrero_id: int|null, peso: float}>  $detalles
     */
    private function persistirSesion(
        string $fecha,
        ?string $observacion,
        array $detalles,
        ?int $userId
    ): Pesaje {
        return DB::transaction(function () use ($fecha, $observacion, $detalles, $userId) {
            if ($userId === null) {
                throw ValidationException::withMessages([
                    'user_id' => 'No se pudo determinar el usuario del pesaje.',
                ]);
            }

            $total = round(array_sum(array_map(fn (array $linea) => $linea['peso'], $detalles)), 2);

            $pesaje = Pesaje::query()->create([
                'codigo_pesaje' => $this->nextCodigo(),
                'fecha_pesaje' => $fecha,
                'total_peso' => $total,
                'observacion' => $observacion,
                'user_id' => $userId,
            ]);

            foreach ($detalles as $linea) {
                $pesaje->detalles()->create([
                    'animal_id' => $linea['animal_id'],
                    'potrero_id' => $linea['potrero_id'],
                    'peso' => $linea['peso'],
                ]);
            }

            return $pesaje->fresh(self::RELATIONS);
        });
    }

    private function nextCodigo(): string
    {
        $year = now()->year;
        $prefix = "PES-{$year}-";

        $ultimo = Pesaje::query()
            ->where('codigo_pesaje', 'like', $prefix.'%')
            ->lockForUpdate()
            ->orderByDesc('codigo_pesaje')
            ->value('codigo_pesaje');

        $secuencia = 1;
        if ($ultimo && preg_match('/PES-\d{4}-(\d+)/', $ultimo, $matches)) {
            $secuencia = ((int) $matches[1]) + 1;
        }

        return $prefix.str_pad((string) $secuencia, 4, '0', STR_PAD_LEFT);
    }

    /**
     * @param  array<string, mixed>  $cruda
     * @param  array<string, int>  $aretes
     * @return array<string, mixed>
     */
    private function normalizarFilaExcel(array $cruda, array &$aretes): array
    {
        $linea = (int) ($cruda['linea'] ?? 0);
        $arete = strtoupper(trim((string) ($cruda['codigo_arete'] ?? $cruda['arete'] ?? '')));
        $pesoRaw = trim((string) ($cruda['peso_kg'] ?? $cruda['peso'] ?? ''));
        $errores = [];
        $peso = null;

        if ($arete === '') {
            $errores[] = 'El código de arete es obligatorio.';
        } elseif (isset($aretes[$arete])) {
            $errores[] = 'El arete está duplicado en el archivo (línea '.$aretes[$arete].').';
        } else {
            $aretes[$arete] = $linea;
        }

        if ($pesoRaw === '' || ! is_numeric(str_replace(',', '.', $pesoRaw))) {
            $errores[] = 'El peso debe ser numérico y positivo.';
        } else {
            $peso = round((float) str_replace(',', '.', $pesoRaw), 2);
            if ($peso < 0.01) {
                $errores[] = 'El peso debe ser mayor a cero.';
            }
        }

        $animal = $arete !== ''
            ? Animal::query()
                ->with([
                    'potrero:id,nombre,codigo,parcela_id',
                    'potrero.parcela:id,nombre',
                ])
                ->whereNull('deleted_at')
                ->whereRaw('UPPER(BTRIM(arete)) = ?', [$arete])
                ->first()
            : null;

        if ($arete !== '' && ! $animal) {
            $errores[] = 'No existe un animal con ese arete.';
        }

        if ($animal && $animal->estado !== Animal::ESTADO_ACTIVO) {
            $errores[] = 'El animal no está activo.';
        }

        if ($animal && ! $animal->potrero_id) {
            $errores[] = 'El animal no tiene un potrero asignado.';
        }

        return [
            'linea' => $linea,
            'codigo_arete' => $arete,
            'peso_kg' => $peso,
            'animal_id' => $animal?->id,
            'animal_codigo' => $animal?->codigo,
            'potrero_id' => $animal?->potrero_id,
            'potrero_nombre' => $animal?->potrero?->nombre,
            'parcela_nombre' => $animal?->potrero?->parcela?->nombre,
            'errores' => $errores,
            'valida' => $errores === [],
        ];
    }
}
