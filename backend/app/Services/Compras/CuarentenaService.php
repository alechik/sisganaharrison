<?php

namespace App\Services\Compras;

use App\Models\CategoriaAnimal;
use App\Models\Cuarentena;
use App\Models\OrdenCompra;
use App\Models\Persona;
use App\Models\TipoPersona;
use App\Services\Animales\AnimalService;
use App\Services\Documentos\PdfGenerator;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CuarentenaService
{
    private const SORTABLE_COLUMNS = [
        'cod_compra',
        'fecha_inicio',
        'fecha_fin',
        'estado',
        'origen',
        'monto_total',
        'created_at',
    ];

    private const RELATIONS = [
        'proveedor:id,razon_social,nit,email',
        'creador:id,nombre,apellido',
        'ordenCompra:id,cod_compra,estado,fecha',
        'detalles.categoria:id,codigo,nombre',
        'detalles.animal:id,codigo,sexo,categoria_id',
    ];

    public function __construct(
        private readonly PdfGenerator $pdfGenerator,
        private readonly AnimalService $animalService
    ) {}

    /**
     * @param  array<string, mixed>  $filters
     */
    public function paginate(array $filters = []): LengthAwarePaginator
    {
        return $this->buildQuery($filters)->paginate((int) ($filters['per_page'] ?? 10));
    }

    public function find(int $id): Cuarentena
    {
        return Cuarentena::query()
            ->with(self::RELATIONS)
            ->findOrFail($id);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function createDirecta(array $data): Cuarentena
    {
        $this->assertProveedor((int) $data['proveedor_id']);
        $detalles = $this->normalizeDetalles($data['detalles'] ?? []);

        return DB::transaction(function () use ($data, $detalles) {
            $cuarentena = Cuarentena::query()->create([
                'proveedor_id' => $data['proveedor_id'],
                'user_id' => Auth::id(),
                'orden_compra_id' => null,
                'cod_compra' => $this->nextCodigoDirecta(),
                'origen' => Cuarentena::ORIGEN_DIRECTA,
                'fecha_inicio' => $data['fecha_inicio'] ?? now()->toDateString(),
                'fecha_fin' => null,
                'estado' => Cuarentena::ESTADO_PROCESADO,
                'descuento' => (float) ($data['descuento'] ?? 0),
                'total_peso' => 0,
                'monto_total' => 0,
            ]);

            $this->syncDetalles($cuarentena, $this->animalService->identificarEnDetalles($detalles));
            $this->recalculateTotals($cuarentena);

            return $cuarentena->fresh(self::RELATIONS);
        });
    }

    public function generarDesdeOrden(OrdenCompra $orden): Cuarentena
    {
        if ($orden->estado !== OrdenCompra::ESTADO_AUTORIZADA) {
            throw ValidationException::withMessages([
                'orden_compra_id' => 'Solo se puede generar cuarentena desde una orden autorizada.',
            ]);
        }

        if ($orden->cuarentena()->exists()) {
            throw ValidationException::withMessages([
                'orden_compra_id' => 'Esta orden de compra ya tiene una cuarentena generada.',
            ]);
        }

        $orden->loadMissing(['detalles.animal:id,codigo,sexo,categoria_id']);

        if ($orden->detalles->contains(fn ($detalle) => ! $detalle->animal_id)) {
            throw ValidationException::withMessages([
                'orden_compra_id' => 'La orden no tiene todos los animales identificados. Edítela antes de generar la cuarentena.',
            ]);
        }

        $detalles = $orden->detalles->map(fn ($detalle) => [
            'categoria_animal_id' => $detalle->categoria_animal_id,
            'cantidad' => $detalle->cantidad,
            'peso' => (float) $detalle->peso,
            'edad' => $detalle->edad,
            'precio' => (float) $detalle->precio,
            'descuento' => (float) $detalle->descuento,
            'animal_id' => $detalle->animal_id,
            'sexo' => $detalle->animal?->sexo,
        ])->all();

        $normalizados = $this->normalizeDetalles($detalles);

        return DB::transaction(function () use ($orden, $normalizados) {
            $cuarentena = Cuarentena::query()->create([
                'proveedor_id' => $orden->proveedor_id,
                'user_id' => Auth::id(),
                'orden_compra_id' => $orden->id,
                'cod_compra' => $orden->cod_compra,
                'origen' => Cuarentena::ORIGEN_ORDEN_COMPRA,
                'fecha_inicio' => now()->toDateString(),
                'fecha_fin' => null,
                'estado' => Cuarentena::ESTADO_PROCESADO,
                'descuento' => (float) $orden->descuento,
                'total_peso' => 0,
                'monto_total' => 0,
            ]);

            $this->syncDetalles($cuarentena, $this->animalService->identificarEnDetalles($normalizados));
            $this->recalculateTotals($cuarentena);

            return $cuarentena->fresh(self::RELATIONS);
        });
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Cuarentena $cuarentena, array $data): Cuarentena
    {
        $this->assertModificable($cuarentena);
        $this->assertProveedor((int) $data['proveedor_id']);
        $detalles = $this->normalizeDetalles($data['detalles'] ?? []);

        return DB::transaction(function () use ($cuarentena, $data, $detalles) {
            $cuarentena->update([
                'proveedor_id' => $data['proveedor_id'],
                'fecha_inicio' => $data['fecha_inicio'] ?? $cuarentena->fecha_inicio,
                'descuento' => (float) ($data['descuento'] ?? 0),
            ]);

            $cuarentena->detalles()->delete();
            $this->syncDetalles($cuarentena, $this->animalService->identificarEnDetalles($detalles));
            $this->recalculateTotals($cuarentena);

            return $cuarentena->fresh(self::RELATIONS);
        });
    }

    public function completar(Cuarentena $cuarentena): Cuarentena
    {
        $this->assertModificable($cuarentena);

        $cuarentena->update([
            'estado' => Cuarentena::ESTADO_COMPLETADO,
            'fecha_fin' => now()->toDateString(),
        ]);

        $cuarentena->detalles()->update([
            'estado' => Cuarentena::ESTADO_COMPLETADO,
        ]);

        return $cuarentena->fresh(self::RELATIONS);
    }

    public function pdf(Cuarentena $cuarentena): Response
    {
        $cuarentena->load(self::RELATIONS);

        $labels = [
            Cuarentena::ESTADO_PROCESADO => 'Procesado',
            Cuarentena::ESTADO_COMPLETADO => 'Completado',
        ];

        $origenLabels = [
            Cuarentena::ORIGEN_ORDEN_COMPRA => 'Orden de Compra',
            Cuarentena::ORIGEN_DIRECTA => 'Directa por excepción',
        ];

        return $this->pdfGenerator->download(
            'documentos.cuarentena',
            [
                'titulo' => 'Cuarentena',
                'cuarentena' => $cuarentena,
                'estado_label' => $labels[$cuarentena->estado] ?? $cuarentena->estado,
                'origen_label' => $origenLabels[$cuarentena->origen] ?? $cuarentena->origen,
            ],
            'CQ-'.$cuarentena->cod_compra.'.pdf'
        );
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return Builder<Cuarentena>
     */
    private function buildQuery(array $filters): Builder
    {
        $query = Cuarentena::query()->with(self::RELATIONS);

        if (! empty($filters['cod_compra'])) {
            $query->where('cod_compra', 'like', '%'.$filters['cod_compra'].'%');
        }

        if (! empty($filters['proveedor_id'])) {
            $query->where('proveedor_id', (int) $filters['proveedor_id']);
        }

        if (! empty($filters['estado'])) {
            $query->where('estado', strtoupper((string) $filters['estado']));
        }

        if (! empty($filters['origen'])) {
            $query->where('origen', strtoupper((string) $filters['origen']));
        }

        if (! empty($filters['fecha'])) {
            $query->whereDate('fecha_inicio', $filters['fecha']);
        }

        if (! empty($filters['fecha_desde'])) {
            $query->whereDate('fecha_inicio', '>=', $filters['fecha_desde']);
        }

        if (! empty($filters['fecha_hasta'])) {
            $query->whereDate('fecha_inicio', '<=', $filters['fecha_hasta']);
        }

        $sortBy = in_array($filters['sort_by'] ?? '', self::SORTABLE_COLUMNS, true)
            ? $filters['sort_by']
            : 'created_at';

        $sortDir = strtolower((string) ($filters['sort_dir'] ?? 'desc')) === 'asc' ? 'asc' : 'desc';

        return $query->orderBy($sortBy, $sortDir);
    }

    private function nextCodigoDirecta(): string
    {
        $year = now()->year;
        $prefix = "CQ-{$year}-";

        $ultimo = Cuarentena::query()
            ->where('origen', Cuarentena::ORIGEN_DIRECTA)
            ->where('cod_compra', 'like', $prefix.'%')
            ->orderByDesc('cod_compra')
            ->value('cod_compra');

        $secuencia = 1;
        if ($ultimo && preg_match('/CQ-\d{4}-(\d+)/', $ultimo, $matches)) {
            $secuencia = ((int) $matches[1]) + 1;
        }

        return $prefix.str_pad((string) $secuencia, 4, '0', STR_PAD_LEFT);
    }

    private function assertProveedor(int $proveedorId): void
    {
        $existe = Persona::query()
            ->whereKey($proveedorId)
            ->whereHas('tipos', fn (Builder $builder) => $builder->where('tipo.nombre', TipoPersona::PROVEEDOR))
            ->exists();

        if (! $existe) {
            throw ValidationException::withMessages([
                'proveedor_id' => 'El socio seleccionado no es un proveedor.',
            ]);
        }
    }

    private function assertModificable(Cuarentena $cuarentena): void
    {
        if (! $cuarentena->esModificable()) {
            throw ValidationException::withMessages([
                'estado' => 'Una cuarentena completada no puede modificarse.',
            ]);
        }
    }

    /**
     * @param  array<int, array<string, mixed>>  $detalles
     * @return list<array<string, mixed>>
     */
    private function normalizeDetalles(array $detalles): array
    {
        if ($detalles === []) {
            throw ValidationException::withMessages([
                'detalles' => 'La cuarentena debe tener al menos un detalle.',
            ]);
        }

        $normalizados = [];

        foreach ($detalles as $index => $detalle) {
            $categoriaId = (int) ($detalle['categoria_animal_id'] ?? 0);
            $cantidad = (int) ($detalle['cantidad'] ?? 0);
            $peso = round((float) ($detalle['peso'] ?? 0), 2);
            $precio = (float) ($detalle['precio'] ?? 0);
            $descuento = (float) ($detalle['descuento'] ?? 0);

            if (! CategoriaAnimal::query()->whereKey($categoriaId)->exists()) {
                throw ValidationException::withMessages([
                    "detalles.$index.categoria_animal_id" => 'La categoría seleccionada no existe.',
                ]);
            }

            if ($cantidad < 1) {
                throw ValidationException::withMessages([
                    "detalles.$index.cantidad" => 'La cantidad debe ser mayor a cero.',
                ]);
            }

            if ($peso < 0.01) {
                throw ValidationException::withMessages([
                    "detalles.$index.peso" => 'El peso del ejemplar debe ser mayor a cero.',
                ]);
            }

            $subtotal = round(($cantidad * $precio) - $descuento, 2);

            if ($subtotal < 0) {
                throw ValidationException::withMessages([
                    "detalles.$index.descuento" => 'El descuento no puede superar el importe de la línea.',
                ]);
            }

            $normalizados[] = [
                'animal_id' => ! empty($detalle['animal_id']) ? (int) $detalle['animal_id'] : null,
                'categoria_animal_id' => $categoriaId,
                'sexo' => strtoupper((string) ($detalle['sexo'] ?? '')),
                'cantidad' => $cantidad,
                'peso' => $peso,
                'edad' => isset($detalle['edad']) && $detalle['edad'] !== '' && $detalle['edad'] !== null
                    ? (int) $detalle['edad']
                    : null,
                'precio' => $precio,
                'descuento' => $descuento,
                'estado' => Cuarentena::ESTADO_PROCESADO,
                'subtotal' => $subtotal,
            ];
        }

        return $normalizados;
    }

    /**
     * @param  list<array<string, mixed>>  $detalles
     */
    private function syncDetalles(Cuarentena $cuarentena, array $detalles): void
    {
        $cuarentena->detalles()->createMany(
            array_map(fn (array $detalle) => [
                'animal_id' => $detalle['animal_id'],
                'categoria_animal_id' => $detalle['categoria_animal_id'],
                'cantidad' => $detalle['cantidad'],
                'peso' => $detalle['peso'],
                'edad' => $detalle['edad'] ?? null,
                'precio' => $detalle['precio'],
                'descuento' => $detalle['descuento'],
                'estado' => $detalle['estado'] ?? Cuarentena::ESTADO_PROCESADO,
                'subtotal' => $detalle['subtotal'],
            ], $detalles)
        );
    }

    private function recalculateTotals(Cuarentena $cuarentena): void
    {
        $cuarentena->load('detalles');
        $suma = (float) $cuarentena->detalles->sum('subtotal');
        $totalPeso = $cuarentena->detalles->sum(
            fn ($detalle) => (float) $detalle->cantidad * (float) $detalle->peso
        );
        $descuento = (float) $cuarentena->descuento;
        $cuarentena->monto_total = round(max($suma - $descuento, 0), 2);
        $cuarentena->total_peso = round($totalPeso, 2);
        $cuarentena->save();
    }
}
