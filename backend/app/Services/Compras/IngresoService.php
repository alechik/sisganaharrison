<?php

namespace App\Services\Compras;

use App\Models\AnimalEvento;
use App\Models\Cuarentena;
use App\Models\CuarentenaDetalle;
use App\Models\DetalleIngreso;
use App\Models\Ingreso;
use App\Models\Lote;
use App\Models\Pesaje;
use App\Services\Animales\AnimalService;
use App\Services\Documentos\PdfGenerator;
use App\Services\Pesajes\PesajeService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

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
        'lote:id,nombre,codigo',
        'cuarentena:id,cod_compra,estado,origen,proveedor_id,fecha_inicio,fecha_fin',
        'detalles.animal:id,codigo,sexo,categoria_id,arete,nombre,edad_inicial,edad_actual,precio_kilo,lote_id',
        'detalles.animal.categoria:id,codigo,nombre',
    ];

    public function __construct(
        private readonly PdfGenerator $pdfGenerator,
        private readonly AnimalService $animalService,
        private readonly PesajeService $pesajeService
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
     * Cuarentenas COMPLETADO con animales aún no registrados en detalle_ingresos.
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
            'detalles.animal.lote:id,nombre',
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
                        'lote_id' => $animal->lote_id,
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

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Ingreso
    {
        $cuarentena = Cuarentena::query()->with(['detalles.animal', 'detalles.categoria'])->findOrFail((int) $data['cuarentena_id']);
        $this->assertCompletada($cuarentena);

        if (! Lote::query()->whereKey((int) $data['lote_id'])->where('activo', true)->whereNull('deleted_at')->exists()) {
            throw ValidationException::withMessages([
                'lote_id' => 'El lote seleccionado no existe o no está activo.',
            ]);
        }

        $seleccion = $this->normalizeDetalles($cuarentena, $data['detalles'] ?? []);

        return DB::transaction(function () use ($data, $cuarentena, $seleccion) {
            $ingreso = Ingreso::query()->create([
                'codigo' => $this->nextCodigo(),
                'proveedor_id' => $cuarentena->proveedor_id,
                'user_id' => Auth::id(),
                'cuarentena_id' => $cuarentena->id,
                'lote_id' => (int) $data['lote_id'],
                'fecha_ingreso' => $data['fecha_ingreso'],
                'estado' => Ingreso::ESTADO_REGISTRADO,
                'observaciones' => $data['observaciones'] ?? null,
                'descuento' => (float) ($data['descuento'] ?? 0),
                'total_peso' => 0,
                'monto_total' => 0,
            ]);

            foreach ($seleccion as $linea) {
                $detalleCuarentena = $linea['detalle'];
                $animal = $detalleCuarentena->animal;
                $payload = $linea['payload'];

                $ingreso->detalles()->create([
                    'animal_id' => $animal->id,
                    'observaciones' => $payload['observaciones'] ?? null,
                    'peso_oc' => (float) $detalleCuarentena->peso,
                    'peso_ingreso' => (float) $payload['peso_ingreso'],
                    'precio_compra' => (float) $detalleCuarentena->precio,
                    'edad' => $detalleCuarentena->edad ?? $animal->edad_inicial,
                ]);

                $precioKilo = $this->calcularPrecioKilo(
                    (float) $detalleCuarentena->precio,
                    (float) $payload['peso_ingreso']
                );

                $this->animalService->completarDesdeIngreso(
                    $animal,
                    $payload['animal'] ?? [],
                    (int) $data['lote_id'],
                    (string) $data['fecha_ingreso'],
                    $precioKilo
                );

                $this->pesajeService->registrarHistorico(
                    $animal,
                    $cuarentena->fecha_inicio?->format('Y-m-d') ?? $cuarentena->created_at?->toDateString() ?? (string) $data['fecha_ingreso'],
                    (float) $detalleCuarentena->peso,
                    Pesaje::OBSERVACION_CUARENTENA
                );

                AnimalEvento::query()->create([
                    'animal_id' => $animal->id,
                    'tipo' => AnimalEvento::TIPO_INGRESO,
                    'fecha' => $data['fecha_ingreso'],
                    'descripcion' => 'Ingreso al inventario desde cuarentena '.$cuarentena->cod_compra,
                    'metadata' => [
                        'ingreso_id' => $ingreso->id,
                        'ingreso_codigo' => $ingreso->codigo,
                        'cuarentena_id' => $cuarentena->id,
                        'lote_id' => (int) $data['lote_id'],
                        'peso_oc' => (float) $detalleCuarentena->peso,
                        'peso_ingreso' => (float) $payload['peso_ingreso'],
                        'precio_kilo' => $precioKilo,
                    ],
                ]);
            }

            $this->recalculateTotals($ingreso);
            $this->pesajeService->registrarDeIngreso($ingreso->load('detalles'));

            return $ingreso->fresh(self::RELATIONS);
        });
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

        if (! empty($filters['cuarentena_id'])) {
            $query->where('cuarentena_id', (int) $filters['cuarentena_id']);
        }

        if (! empty($filters['lote_id'])) {
            $query->where('lote_id', (int) $filters['lote_id']);
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

    private function nextCodigo(): string
    {
        $year = now()->year;
        $prefix = "ING-{$year}-";

        $ultimo = Ingreso::query()
            ->where('codigo', 'like', $prefix.'%')
            ->lockForUpdate()
            ->orderByDesc('codigo')
            ->value('codigo');

        $secuencia = 1;
        if ($ultimo && preg_match('/ING-\d{4}-(\d+)/', $ultimo, $matches)) {
            $secuencia = ((int) $matches[1]) + 1;
        }

        return $prefix.str_pad((string) $secuencia, 4, '0', STR_PAD_LEFT);
    }

    private function assertCompletada(Cuarentena $cuarentena): void
    {
        if (! $cuarentena->estaCompletada()) {
            throw ValidationException::withMessages([
                'cuarentena_id' => 'Solo se puede generar un ingreso desde una cuarentena completada.',
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
     * @return list<array{detalle: CuarentenaDetalle, payload: array<string, mixed>}>
     */
    private function normalizeDetalles(Cuarentena $cuarentena, array $detalles): array
    {
        if ($detalles === []) {
            throw ValidationException::withMessages([
                'detalles' => 'Debe seleccionar al menos un animal para el ingreso.',
            ]);
        }

        $ingresados = $this->animalIdsIngresados($cuarentena->id);
        $porAnimal = $cuarentena->detalles->keyBy('animal_id');
        $vistos = [];
        $normalizados = [];

        foreach ($detalles as $index => $payload) {
            $animalId = (int) ($payload['animal_id'] ?? 0);

            if ($animalId < 1) {
                throw ValidationException::withMessages([
                    "detalles.$index.animal_id" => 'Debe indicar el animal a ingresar.',
                ]);
            }

            if (in_array($animalId, $vistos, true)) {
                throw ValidationException::withMessages([
                    "detalles.$index.animal_id" => 'El mismo animal no puede repetirse en el ingreso.',
                ]);
            }

            if (in_array($animalId, $ingresados, true)) {
                throw ValidationException::withMessages([
                    "detalles.$index.animal_id" => 'Este animal ya fue ingresado desde esta cuarentena.',
                ]);
            }

            /** @var CuarentenaDetalle|null $detalle */
            $detalle = $porAnimal->get($animalId);

            if (! $detalle || ! $detalle->animal) {
                throw ValidationException::withMessages([
                    "detalles.$index.animal_id" => 'El animal no pertenece a la cuarentena seleccionada.',
                ]);
            }

            $pesoIngreso = round((float) ($payload['peso_ingreso'] ?? 0), 2);
            if ($pesoIngreso < 0.01) {
                throw ValidationException::withMessages([
                    "detalles.$index.peso_ingreso" => 'El peso de ingreso debe ser mayor a cero.',
                ]);
            }

            $vistos[] = $animalId;
            $normalizados[] = [
                'detalle' => $detalle,
                'payload' => [
                    'observaciones' => $payload['observaciones'] ?? null,
                    'peso_ingreso' => $pesoIngreso,
                    'animal' => is_array($payload['animal'] ?? null) ? $payload['animal'] : [],
                ],
            ];
        }

        return $normalizados;
    }

    private function recalculateTotals(Ingreso $ingreso): void
    {
        $ingreso->load('detalles');
        $ingreso->total_peso = round((float) $ingreso->detalles->sum('peso_ingreso'), 2);
        $ingreso->monto_total = round(max((float) $ingreso->detalles->sum('precio_compra') - (float) $ingreso->descuento, 0), 2);
        $ingreso->save();
    }

    private function calcularPrecioKilo(float $precioCompra, float $pesoKg): float
    {
        return round($precioCompra / $pesoKg, 2);
    }
}
