<?php

namespace App\Services\Compras;

use App\Models\CategoriaAnimal;
use App\Models\OrdenCompra;
use App\Models\Persona;
use App\Models\TipoPersona;
use App\Models\User;
use App\Services\Documentos\PdfGenerator;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrdenCompraService
{
    private const SORTABLE_COLUMNS = ['cod_compra', 'fecha', 'estado', 'monto_total', 'created_at'];

    private const RELATIONS = [
        'proveedor:id,razon_social,nit,email',
        'creador:id,nombre,apellido',
        'autorizador:id,nombre,apellido',
        'detalles.categoria:id,codigo,nombre',
    ];

    public function __construct(
        private readonly PdfGenerator $pdfGenerator
    ) {}

    /**
     * @param  array<string, mixed>  $filters
     */
    public function paginate(array $filters = [], ?User $actor = null): LengthAwarePaginator
    {
        return $this->buildQuery($filters, $actor)
            ->paginate((int) ($filters['per_page'] ?? 10));
    }

    public function find(int $id): OrdenCompra
    {
        return OrdenCompra::query()
            ->with(self::RELATIONS)
            ->findOrFail($id);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): OrdenCompra
    {
        $this->assertProveedor($data['proveedor_id']);
        $detalles = $this->normalizeDetalles($data['detalles'] ?? []);

        return DB::transaction(function () use ($data, $detalles) {
            $orden = OrdenCompra::query()->create([
                'proveedor_id' => $data['proveedor_id'],
                'user_id' => Auth::id(),
                'cod_compra' => $this->nextCodigo(),
                'fecha' => $data['fecha'] ?? now()->toDateString(),
                'estado' => OrdenCompra::ESTADO_PENDIENTE,
                'descuento' => (float) ($data['descuento'] ?? 0),
                'total_peso' => 0,
            ]);

            $this->syncDetalles($orden, $detalles);
            $this->recalculateTotals($orden);

            return $orden->fresh(self::RELATIONS);
        });
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(OrdenCompra $orden, array $data): OrdenCompra
    {
        $this->assertModificable($orden);
        $this->assertProveedor($data['proveedor_id']);
        $detalles = $this->normalizeDetalles($data['detalles'] ?? []);

        return DB::transaction(function () use ($orden, $data, $detalles) {
            $orden->update([
                'proveedor_id' => $data['proveedor_id'],
                'fecha' => $data['fecha'] ?? $orden->fecha,
                'descuento' => (float) ($data['descuento'] ?? 0),
            ]);

            $orden->detalles()->delete();
            $this->syncDetalles($orden, $detalles);
            $this->recalculateTotals($orden);

            return $orden->fresh(self::RELATIONS);
        });
    }

    public function autorizar(OrdenCompra $orden, ?string $observacion = null): OrdenCompra
    {
        $this->assertPendiente($orden);

        $orden->update([
            'estado' => OrdenCompra::ESTADO_AUTORIZADA,
            'autorizado_por' => Auth::id(),
            'fecha_decision' => now(),
            'observacion_estado' => $observacion,
        ]);

        return $orden->fresh(self::RELATIONS);
    }

    public function rechazar(OrdenCompra $orden, ?string $observacion = null): OrdenCompra
    {
        $this->assertPendiente($orden);

        $orden->update([
            'estado' => OrdenCompra::ESTADO_RECHAZADA,
            'autorizado_por' => Auth::id(),
            'fecha_decision' => now(),
            'observacion_estado' => $observacion,
        ]);

        return $orden->fresh(self::RELATIONS);
    }

    public function countPendientes(): int
    {
        return OrdenCompra::query()
            ->where('estado', OrdenCompra::ESTADO_PENDIENTE)
            ->count();
    }

    /**
     * @return \Illuminate\Support\Collection<int, OrdenCompra>
     */
    public function pendientesResumen(int $limit = 8)
    {
        return OrdenCompra::query()
            ->with(['proveedor:id,razon_social', 'creador:id,nombre,apellido'])
            ->where('estado', OrdenCompra::ESTADO_PENDIENTE)
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get();
    }

    public function pdf(OrdenCompra $orden): Response
    {
        $orden->load(self::RELATIONS);

        $labels = [
            OrdenCompra::ESTADO_PENDIENTE => 'Pendiente',
            OrdenCompra::ESTADO_AUTORIZADA => 'Autorizada',
            OrdenCompra::ESTADO_RECHAZADA => 'Rechazada',
        ];

        return $this->pdfGenerator->download(
            'documentos.orden-compra',
            [
                'titulo' => 'Orden de Compra',
                'orden' => $orden,
                'estado_label' => $labels[$orden->estado] ?? $orden->estado,
            ],
            $orden->cod_compra.'.pdf'
        );
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return Builder<OrdenCompra>
     */
    private function buildQuery(array $filters, ?User $actor): Builder
    {
        $query = OrdenCompra::query()->with(self::RELATIONS);

        if ($actor && ! $actor->can('compras.authorize') && ! $actor->hasRole('super-admin')) {
            $query->where('user_id', $actor->id);
        }

        if (! empty($filters['cod_compra'])) {
            $query->where('cod_compra', 'like', '%'.$filters['cod_compra'].'%');
        }

        if (! empty($filters['proveedor_id'])) {
            $query->where('proveedor_id', (int) $filters['proveedor_id']);
        }

        if (! empty($filters['user_id'])) {
            $query->where('user_id', (int) $filters['user_id']);
        }

        if (! empty($filters['estado'])) {
            $query->where('estado', strtoupper((string) $filters['estado']));
        }

        if (! empty($filters['fecha_desde'])) {
            $query->whereDate('fecha', '>=', $filters['fecha_desde']);
        }

        if (! empty($filters['fecha_hasta'])) {
            $query->whereDate('fecha', '<=', $filters['fecha_hasta']);
        }

        if (! empty($filters['fecha'])) {
            $query->whereDate('fecha', $filters['fecha']);
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
        $prefix = "OC-{$year}-";

        $ultimo = OrdenCompra::query()
            ->where('cod_compra', 'like', $prefix.'%')
            ->orderByDesc('cod_compra')
            ->value('cod_compra');

        $secuencia = 1;
        if ($ultimo && preg_match('/OC-\d{4}-(\d+)/', $ultimo, $matches)) {
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

    private function assertModificable(OrdenCompra $orden): void
    {
        if (! $orden->esModificable()) {
            throw ValidationException::withMessages([
                'estado' => 'Una orden autorizada o rechazada no puede modificarse.',
            ]);
        }
    }

    private function assertPendiente(OrdenCompra $orden): void
    {
        if (! $orden->estaPendiente()) {
            throw ValidationException::withMessages([
                'estado' => 'Solo se pueden decidir órdenes pendientes.',
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
                'detalles' => 'La orden debe tener al menos un detalle.',
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
                'animal_id' => null,
                'categoria_animal_id' => $categoriaId,
                'cantidad' => $cantidad,
                'peso' => $peso,
                'precio' => $precio,
                'descuento' => $descuento,
                'subtotal' => $subtotal,
            ];
        }

        return $normalizados;
    }

    /**
     * @param  list<array<string, mixed>>  $detalles
     */
    private function syncDetalles(OrdenCompra $orden, array $detalles): void
    {
        $orden->detalles()->createMany($detalles);
    }

    private function recalculateTotals(OrdenCompra $orden): void
    {
        $orden->load('detalles');
        $suma = (float) $orden->detalles->sum('subtotal');
        $totalPeso = $orden->detalles->sum(
            fn ($detalle) => (float) $detalle->cantidad * (float) $detalle->peso
        );
        $descuento = (float) $orden->descuento;
        $orden->monto_total = round(max($suma - $descuento, 0), 2);
        $orden->total_peso = round($totalPeso, 2);
        $orden->save();
    }
}
