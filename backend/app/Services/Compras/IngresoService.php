<?php

namespace App\Services\Compras;

use App\Models\Animal;
use App\Models\AnimalEvento;
use App\Models\CategoriaAnimal;
use App\Models\Cuarentena;
use App\Models\CuarentenaDetalle;
use App\Models\DetalleIngreso;
use App\Models\Grupo;
use App\Models\Ingreso;
use App\Models\Potrero;
use App\Models\Persona;
use App\Models\Pesaje;
use App\Models\Raza;
use App\Models\TipoIngreso;
use App\Support\CategoriaAnimalReglas;
use App\Services\Animales\AnimalService;
use App\Services\Documentos\PdfGenerator;
use App\Services\Pesajes\PesajeService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Response;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\StreamedResponse;

class IngresoService
{
    private const SORTABLE_COLUMNS = [
        'codigo',
        'fecha_ingreso',
        'estado',
        'monto_total',
        'created_at',
    ];

    private const RELATIONS = [
        'proveedor:id,razon_social,nit,email',
        'creador:id,nombre,apellido',
        'potrero:id,nombre,codigo',
        'grupo:id,nombre,potrero_id',
        'tipoIngreso:id,nombre,codigo,iniciales,requiere_proveedor',
        'cuarentena:id,cod_compra,estado,origen,proveedor_id,fecha_inicio,fecha_fin',
        'detalles.animal:id,codigo,sexo,categoria_id,raza_id,arete,nombre,edad_inicial,edad_actual,precio_kilo,potrero_id,color',
        'detalles.animal.categoria:id,codigo,nombre',
        'detalles.animal.raza:id,codigo,nombre',
    ];

    public function __construct(
        private readonly PdfGenerator $pdfGenerator,
        private readonly AnimalService $animalService,
        private readonly PesajeService $pesajeService,
        private readonly IngresoExcelService $excelService
    ) {}

    /**
     * @param  array<string, mixed>  $filters
     */
    public function paginate(array $filters = []): LengthAwarePaginator
    {
        return $this->buildQuery($filters)->paginate((int) ($filters['per_page'] ?? 10));
    }

    public function find(int $id): Ingreso
    {
        return Ingreso::query()
            ->with(self::RELATIONS)
            ->findOrFail($id);
    }

    /**
     * @return array{filename: string, content: string, mime: string}
     */
    public function plantillaExcel(): array
    {
        return $this->excelService->plantilla();
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
    public function create(array $data): Ingreso
    {
        $tipo = TipoIngreso::query()
            ->where('estado', true)
            ->whereNull('deleted_at')
            ->findOrFail((int) $data['tipo_ingreso_id']);

        $this->assertProveedor($tipo, $data['proveedor_id'] ?? null);

        if (! Potrero::query()->whereKey((int) $data['potrero_id'])->where('activo', true)->whereNull('deleted_at')->exists()) {
            throw ValidationException::withMessages([
                'potrero_id' => 'El potrero seleccionado no existe o no está activo.',
            ]);
        }

        $grupoId = isset($data['grupo_id']) && $data['grupo_id'] !== '' ? (int) $data['grupo_id'] : null;
        if ($grupoId === null) {
            throw ValidationException::withMessages([
                'grupo_id' => 'Debe seleccionar un grupo perteneciente al potrero.',
            ]);
        }
        Grupo::assertCompatibleConPotrero($grupoId, (int) $data['potrero_id']);

        $detalles = $this->normalizeDetallesFisicos($data['detalles'] ?? []);

        return DB::transaction(function () use ($data, $tipo, $detalles, $grupoId) {
            $ingreso = Ingreso::query()->create([
                'codigo' => $this->nextCodigo($tipo),
                'tipo_ingreso_id' => $tipo->id,
                'proveedor_id' => isset($data['proveedor_id']) && $data['proveedor_id'] !== ''
                    ? (int) $data['proveedor_id']
                    : null,
                'user_id' => Auth::id(),
                'cuarentena_id' => null,
                'potrero_id' => (int) $data['potrero_id'],
                'grupo_id' => $grupoId,
                'fecha_ingreso' => $data['fecha_ingreso'],
                'estado' => Ingreso::ESTADO_REGISTRADO,
                'observaciones' => $data['observaciones'] ?? null,
                'descuento' => (float) ($data['descuento'] ?? 0),
                'total_peso' => 0,
                'monto_total' => 0,
            ]);

            foreach ($detalles as $index => $linea) {
                $animal = $this->animalService->crearDesdeIngresoFisico(
                    $linea,
                    (int) $data['potrero_id'],
                    $grupoId,
                    (string) $data['fecha_ingreso'],
                    $index
                );

                $ingreso->detalles()->create([
                    'animal_id' => $animal->id,
                    'observaciones' => $linea['observaciones'] ?? null,
                    'peso_oc' => (float) $linea['peso_ingreso'],
                    'peso_ingreso' => (float) $linea['peso_ingreso'],
                    'precio_compra' => (float) ($linea['precio_compra'] ?? 0),
                    'edad' => (int) $linea['edad'],
                ]);

                AnimalEvento::query()->create([
                    'animal_id' => $animal->id,
                    'tipo' => AnimalEvento::TIPO_INGRESO,
                    'fecha' => $data['fecha_ingreso'],
                    'descripcion' => 'Ingreso físico '.$ingreso->codigo.' ('.$tipo->nombre.')',
                    'metadata' => [
                        'ingreso_id' => $ingreso->id,
                        'ingreso_codigo' => $ingreso->codigo,
                        'tipo_ingreso_id' => $tipo->id,
                        'tipo_ingreso' => $tipo->codigo,
                        'potrero_id' => (int) $data['potrero_id'],
                        'grupo_id' => $grupoId,
                        'peso_ingreso' => (float) $linea['peso_ingreso'],
                        'precio_compra' => (float) ($linea['precio_compra'] ?? 0),
                    ],
                ]);
            }

            $this->recalculateTotals($ingreso);
            $this->pesajeService->registrarDeIngreso($ingreso->load('detalles'));

            return $ingreso->fresh(self::RELATIONS);
        });
    }

    /**
     * Cuarentenas COMPLETADO con animales aún no registrados. Conservado para historial.
     *
     * @return \Illuminate\Support\Collection<int, Cuarentena>
     */
    public function cuarentenasDisponibles()
    {
        return Cuarentena::query()
            ->disponiblesParaIngreso()
            ->with([
                'proveedor:id,razon_social,nit',
                'ordenCompra:id,cod_compra',
            ])
            ->orderByDesc('created_at')
            ->get();
    }

    /**
     * @return array<string, mixed>
     */
    public function pendientesDeCuarentena(Cuarentena $cuarentena): array
    {
        $this->assertCompletada($cuarentena);

        $cuarentena->load([
            'proveedor:id,razon_social,nit',
            'ordenCompra:id,cod_compra',
            'detalles.categoria:id,codigo,nombre',
            'detalles.animal.raza:id,nombre',
            'detalles.animal.categoria:id,codigo,nombre',
            'detalles.animal.estadoProductivo:id,nombre',
            'detalles.animal.potrero:id,nombre',
            'detalles.animal.madre:id,nombre,codigo',
            'detalles.animal.padre:id,nombre,codigo',
        ]);

        $ingresados = $this->animalIdsIngresados($cuarentena->id);
        $detalles = $cuarentena->detalles
            ->filter(fn (CuarentenaDetalle $detalle) => $detalle->animal_id && ! in_array((int) $detalle->animal_id, $ingresados, true))
            ->values();

        return [
            'cuarentena_id' => $cuarentena->id,
            'cod_compra' => $cuarentena->cod_compra,
            'origen' => $cuarentena->origen,
            'estado' => $cuarentena->estado,
            'proveedor_id' => $cuarentena->proveedor_id,
            'proveedor_razon_social' => $cuarentena->proveedor?->razon_social,
            'proveedor_nit' => $cuarentena->proveedor?->nit,
            'orden_compra_id' => $cuarentena->orden_compra_id,
            'orden_compra_codigo' => $cuarentena->ordenCompra?->cod_compra,
            'fecha_inicio' => $cuarentena->fecha_inicio?->format('Y-m-d'),
            'fecha_fin' => $cuarentena->fecha_fin?->format('Y-m-d'),
            'animales_total' => $cuarentena->detalles->filter(fn (CuarentenaDetalle $detalle) => (bool) $detalle->animal_id)->count(),
            'animales_ingresados' => count($ingresados),
            'animales_pendientes' => $detalles->count(),
            'detalles' => $detalles->map(function (CuarentenaDetalle $detalle) {
                $animal = $detalle->animal;

                return [
                    'cuarentena_detalle_id' => $detalle->id,
                    'animal_id' => $detalle->animal_id,
                    'animal_codigo' => $animal?->codigo,
                    'sexo' => $animal?->sexo,
                    'categoria_id' => $detalle->categoria_animal_id,
                    'categoria_codigo' => $detalle->categoria?->codigo,
                    'categoria_nombre' => $detalle->categoria?->nombre,
                    'edad' => $detalle->edad ?? $animal?->edad_inicial,
                    'peso_oc' => (float) $detalle->peso,
                    'precio_compra' => (float) $detalle->precio,
                    'animal' => $animal ? [
                        'id' => $animal->id,
                        'codigo' => $animal->codigo,
                        'arete' => $animal->arete,
                        'nombre' => $animal->nombre,
                        'sexo' => $animal->sexo,
                        'fecha_nacimiento' => $animal->fecha_nacimiento?->format('Y-m-d'),
                        'raza_id' => $animal->raza_id,
                        'categoria_id' => $animal->categoria_id,
                        'estado_productivo_id' => $animal->estado_productivo_id,
                        'potrero_id' => $animal->potrero_id,
                        'madre_id' => $animal->madre_id,
                        'padre_id' => $animal->padre_id,
                        'color' => $animal->color,
                        'observaciones' => $animal->observaciones,
                        'edad_inicial' => $animal->edad_inicial,
                        'edad_actual' => $animal->edad_actual,
                    ] : null,
                ];
            })->values()->all(),
        ];
    }

    public function pdf(Ingreso $ingreso): Response
    {
        $ingreso->load(array_merge(self::RELATIONS, [
            'cuarentena.proveedor:id,razon_social,nit',
        ]));

        return $this->pdfGenerator->download(
            'documentos.ingreso',
            [
                'titulo' => 'Nota de Ingreso',
                'ingreso' => $ingreso,
            ],
            $ingreso->codigo.'.pdf'
        );
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
     * @param  array<string, mixed>  $filters
     * @return Builder<Ingreso>
     */
    private function buildQuery(array $filters): Builder
    {
        $query = Ingreso::query()->with(self::RELATIONS);

        if (! empty($filters['codigo'])) {
            $query->where('codigo', 'like', '%'.$filters['codigo'].'%');
        }

        if (! empty($filters['proveedor_id'])) {
            $query->where('proveedor_id', (int) $filters['proveedor_id']);
        }

        if (! empty($filters['tipo_ingreso_id'])) {
            $query->where('tipo_ingreso_id', (int) $filters['tipo_ingreso_id']);
        }

        if (! empty($filters['cuarentena_id'])) {
            $query->where('cuarentena_id', (int) $filters['cuarentena_id']);
        }

        if (! empty($filters['potrero_id'])) {
            $query->where('potrero_id', (int) $filters['potrero_id']);
        }

        if (! empty($filters['fecha'])) {
            $query->whereDate('fecha_ingreso', $filters['fecha']);
        }

        if (! empty($filters['fecha_desde'])) {
            $query->whereDate('fecha_ingreso', '>=', $filters['fecha_desde']);
        }

        if (! empty($filters['fecha_hasta'])) {
            $query->whereDate('fecha_ingreso', '<=', $filters['fecha_hasta']);
        }

        $sortBy = in_array($filters['sort_by'] ?? '', self::SORTABLE_COLUMNS, true)
            ? $filters['sort_by']
            : 'created_at';

        $sortDir = strtolower((string) ($filters['sort_dir'] ?? 'desc')) === 'asc' ? 'asc' : 'desc';

        return $query->orderBy($sortBy, $sortDir);
    }

    private function nextCodigo(TipoIngreso $tipo): string
    {
        TipoIngreso::query()->whereKey($tipo->id)->lockForUpdate()->first();
        $prefix = $tipo->prefijoCodigo();

        $ultimo = Ingreso::query()
            ->where('codigo', 'like', $prefix.'%')
            ->lockForUpdate()
            ->orderByDesc('codigo')
            ->value('codigo');

        $secuencia = 1;
        if ($ultimo && preg_match('/^'.preg_quote($prefix, '/').'(\d+)$/', $ultimo, $matches)) {
            $secuencia = ((int) $matches[1]) + 1;
        }

        return $prefix.str_pad((string) $secuencia, 6, '0', STR_PAD_LEFT);
    }

    private function assertProveedor(TipoIngreso $tipo, mixed $proveedorId): void
    {
        $id = $proveedorId === '' || $proveedorId === null ? null : (int) $proveedorId;

        if ($tipo->esCompra() && $id === null) {
            throw ValidationException::withMessages([
                'proveedor_id' => 'Debe seleccionar el proveedor o persona relacionada para este tipo de ingreso.',
            ]);
        }

        if ($id !== null && ! Persona::query()->whereKey($id)->whereNull('deleted_at')->exists()) {
            throw ValidationException::withMessages([
                'proveedor_id' => 'La persona seleccionada no existe.',
            ]);
        }
    }

    private function assertCompletada(Cuarentena $cuarentena): void
    {
        if (! $cuarentena->estaCompletada()) {
            throw ValidationException::withMessages([
                'cuarentena_id' => 'Solo se puede consultar pendientes de una cuarentena completada.',
            ]);
        }
    }

    /**
     * @return list<int>
     */
    private function animalIdsIngresados(int $cuarentenaId): array
    {
        return DetalleIngreso::query()
            ->whereHas('ingreso', fn (Builder $query) => $query->where('cuarentena_id', $cuarentenaId))
            ->pluck('animal_id')
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->values()
            ->all();
    }

    /**
     * @param  array<int, array<string, mixed>>  $detalles
     * @return list<array<string, mixed>>
     */
    private function normalizeDetallesFisicos(array $detalles): array
    {
        if ($detalles === []) {
            throw ValidationException::withMessages([
                'detalles' => 'Debe registrar al menos un animal para el ingreso.',
            ]);
        }

        $vistos = [];
        $normalizados = [];

        foreach ($detalles as $index => $payload) {
            $arete = Str::upper(trim((string) ($payload['arete'] ?? '')));
            if ($arete === '') {
                throw ValidationException::withMessages([
                    "detalles.$index.arete" => 'El arete es obligatorio.',
                ]);
            }

            if (in_array($arete, $vistos, true)) {
                throw ValidationException::withMessages([
                    "detalles.$index.arete" => 'El arete está duplicado en el mismo ingreso.',
                ]);
            }

            if (Animal::query()->where('arete', $arete)->exists()) {
                throw ValidationException::withMessages([
                    "detalles.$index.arete" => "El arete {$arete} ya está asignado a otro animal.",
                ]);
            }

            $sexo = strtoupper((string) ($payload['sexo'] ?? ''));
            if (! in_array($sexo, ['M', 'H'], true)) {
                throw ValidationException::withMessages([
                    "detalles.$index.sexo" => 'El sexo debe ser M o H.',
                ]);
            }

            $edad = (int) ($payload['edad'] ?? 0);
            if ($edad < 0 || $edad > 600) {
                throw ValidationException::withMessages([
                    "detalles.$index.edad" => 'La edad debe estar entre 0 y 600 meses.',
                ]);
            }

            $peso = round((float) ($payload['peso_ingreso'] ?? $payload['peso_kg'] ?? 0), 2);
            if ($peso < 0.01) {
                throw ValidationException::withMessages([
                    "detalles.$index.peso_ingreso" => 'El peso debe ser mayor a cero.',
                ]);
            }

            $categoriaId = (int) ($payload['categoria_id'] ?? 0);
            if ($categoriaId < 1 || ! CategoriaAnimal::query()->whereKey($categoriaId)->where('activo', true)->whereNull('deleted_at')->exists()) {
                throw ValidationException::withMessages([
                    "detalles.$index.categoria_id" => 'La categoría no existe o no está activa.',
                ]);
            }

            $razaId = isset($payload['raza_id']) && $payload['raza_id'] !== '' ? (int) $payload['raza_id'] : null;
            if ($razaId && ! Raza::query()->whereKey($razaId)->where('estado', true)->whereNull('deleted_at')->exists()) {
                throw ValidationException::withMessages([
                    "detalles.$index.raza_id" => 'La raza no existe o no está activa.',
                ]);
            }

            $vistos[] = $arete;
            $normalizados[] = [
                'arete' => $arete,
                'sexo' => $sexo,
                'edad' => $edad,
                'peso_ingreso' => $peso,
                'precio_compra' => round((float) ($payload['precio_compra'] ?? $payload['precio'] ?? 0), 2),
                'categoria_id' => $categoriaId,
                'raza_id' => $razaId,
                'color' => $this->nullableString($payload['color'] ?? null),
                'observaciones' => $this->nullableString($payload['observaciones'] ?? null),
                'castrado' => filter_var($payload['castrado'] ?? false, FILTER_VALIDATE_BOOLEAN),
            ];
        }

        return $normalizados;
    }

    /**
     * @param  array<string, mixed>  $cruda
     * @param  list<string>  $aretes
     * @return array<string, mixed>
     */
    private function normalizarFilaExcel(array $cruda, array &$aretes): array
    {
        $errores = [];
        $linea = (int) ($cruda['linea'] ?? 0);
        $arete = Str::upper(trim((string) ($cruda['arete'] ?? '')));
        $sexoRaw = trim((string) ($cruda['sexo'] ?? ''));
        $sexo = $this->normalizarSexo($sexoRaw);
        $edad = is_numeric($cruda['edad'] ?? null) ? (int) $cruda['edad'] : null;
        $peso = is_numeric($cruda['peso_kg'] ?? null) ? round((float) $cruda['peso_kg'], 2) : null;
        $precio = is_numeric($cruda['precio'] ?? null) ? round((float) $cruda['precio'], 2) : 0;
        $categoriaCodigo = Str::upper(trim((string) ($cruda['categoria'] ?? '')));
        $razaCodigo = Str::upper(trim((string) ($cruda['raza'] ?? '')));
        $castrado = $this->normalizarCastrado((string) ($cruda['castrado'] ?? ''));

        if ($arete === '') {
            $errores[] = 'El arete es obligatorio.';
        } elseif (in_array($arete, $aretes, true)) {
            $errores[] = 'Arete duplicado en el archivo.';
        } elseif (Animal::query()->where('arete', $arete)->exists()) {
            $errores[] = "El arete {$arete} ya existe.";
        }

        if ($sexo === null) {
            $errores[] = 'Sexo inválido. Use M/H o Macho/Hembra.';
        }

        if ($edad === null || $edad < 0 || $edad > 600) {
            $errores[] = 'La edad debe ser un número de meses entre 0 y 600.';
        }

        if ($peso === null || $peso < 0.01) {
            $errores[] = 'El peso en kg debe ser mayor a cero.';
        }

        $categoria = $this->resolverCategoriaExcel($categoriaCodigo, $sexo);
        if (! $categoria) {
            $errores[] = 'La categoría no existe o no está activa. Use el código del catálogo.';
        }

        $raza = null;
        if ($razaCodigo !== '') {
            $raza = Raza::query()->whereRaw('upper(codigo) = ?', [$razaCodigo])->where('estado', true)->whereNull('deleted_at')->first();
            if (! $raza) {
                $errores[] = 'La raza no existe o no está activa. Use el código del catálogo.';
            }
        } else {
            $errores[] = 'La raza es obligatoria.';
        }

        if ($arete !== '') {
            $aretes[] = $arete;
        }

        return [
            'linea' => $linea,
            'arete' => $arete,
            'sexo' => $sexo,
            'edad' => $edad,
            'peso_ingreso' => $peso,
            'precio_compra' => $precio,
            'categoria' => $categoriaCodigo,
            'categoria_id' => $categoria?->id,
            'categoria_nombre' => $categoria?->nombre,
            'raza' => $razaCodigo,
            'raza_id' => $raza?->id,
            'raza_nombre' => $raza?->nombre,
            'color' => $this->nullableString($cruda['color'] ?? null),
            'observaciones' => $this->nullableString($cruda['observaciones'] ?? null),
            'castrado' => $castrado,
            'errores' => $errores,
            'valida' => $errores === [],
        ];
    }

    private function resolverCategoriaExcel(string $codigo, ?string $sexo): ?CategoriaAnimal
    {
        if ($codigo === '') {
            return null;
        }

        $codigos = array_values(array_unique(array_filter([
            CategoriaAnimalReglas::codigoResuelto($codigo, $sexo),
            $codigo,
        ])));

        return CategoriaAnimal::query()
            ->where(function (Builder $builder) use ($codigos) {
                foreach ($codigos as $candidato) {
                    $builder->orWhereRaw('upper(codigo) = ?', [strtoupper((string) $candidato)]);
                }
            })
            ->where('activo', true)
            ->whereNull('deleted_at')
            ->orderByRaw('length(codigo) desc')
            ->first();
    }

    private function normalizarSexo(string $value): ?string
    {
        $value = Str::upper(trim($value));
        $value = Str::of($value)->replace(['Á', 'É', 'Í', 'Ó', 'Ú'], ['A', 'E', 'I', 'O', 'U'])->value();

        return match ($value) {
            'M', 'MACHO' => 'M',
            'H', 'HEMBRA' => 'H',
            default => null,
        };
    }

    private function normalizarCastrado(string $value): bool
    {
        $value = Str::upper(trim($value));

        return in_array($value, ['1', 'SI', 'SÍ', 'TRUE', 'YES', 'Y'], true);
    }

    private function recalculateTotals(Ingreso $ingreso): void
    {
        $ingreso->load('detalles');
        $ingreso->total_peso = round((float) $ingreso->detalles->sum('peso_ingreso'), 2);
        $ingreso->monto_total = round(max((float) $ingreso->detalles->sum('precio_compra') - (float) $ingreso->descuento, 0), 2);
        $ingreso->save();
    }

    private function nullableString(mixed $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $trimmed = trim((string) $value);

        return $trimmed === '' ? null : $trimmed;
    }
}
