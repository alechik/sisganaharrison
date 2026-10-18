<?php

namespace App\Services\ComprasProductos;

use App\Models\Medicamento;
use App\Models\OrdenCompraProducto;
use App\Models\Persona;
use App\Models\TipoPersona;
use App\Services\Documentos\PdfGenerator;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrdenCompraProductoService
{
    private const SORTABLE_COLUMNS = ['cod_compra', 'fecha', 'estado', 'monto_total', 'created_at'];

    private const RELATIONS = [
        'proveedor:id,razon_social,nit,email',
        'creador:id,nombre,apellido',
        'autorizador:id,nombre,apellido',
        'detalles.medicamento:id,codigo,nombre,precio',
    ];

    public function __construct(
        private readonly PdfGenerator $pdfGenerator
    ) {}

    /**
     * @param  array<string, mixed>  $filters
     */
    public function paginate(array $filters = []): LengthAwarePaginator
    {
        return $this->buildQuery($filters)->paginate((int) ($filters['per_page'] ?? 10));
    }

    public function find(int $id): OrdenCompraProducto
    {
        return OrdenCompraProducto::query()->with(self::RELATIONS)->findOrFail($id);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): OrdenCompraProducto
    {
        $this->assertProveedor((int) $data['proveedor_id']);
        $detalles = $this->normalizeDetalles($data['detalles'] ?? []);

        return DB::transaction(function () use ($data, $detalles) {
            $orden = OrdenCompraProducto::query()->create([
                'proveedor_id' => $data['proveedor_id'],
                'user_id' => Auth::id(),
                'cod_compra' => $this->nextCodigo(),
                'fecha' => $data['fecha'] ?? now()->toDateString(),
                'estado' => OrdenCompraProducto::ESTADO_PENDIENTE,
                'descuento' => (float) ($data['descuento'] ?? 0),
                'monto_total' => 0,
            ]);
            $this->syncDetalles($orden, $detalles);
            $this->recalculate($orden);

            return $orden->fresh(self::RELATIONS);
        });
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(OrdenCompraProducto $orden, array $data): OrdenCompraProducto
    {
        if (! $orden->esModificable()) {
            throw ValidationException::withMessages([
                'estado' => 'Solo una orden pendiente puede modificarse.',
            ]);
        }
        $this->assertProveedor((int) $data['proveedor_id']);
        $detalles = $this->normalizeDetalles($data['detalles'] ?? []);

        return DB::transaction(function () use ($orden, $data, $detalles) {
            $orden->update([
                'proveedor_id' => $data['proveedor_id'],
                'fecha' => $data['fecha'] ?? $orden->fecha,
                'descuento' => (float) ($data['descuento'] ?? 0),
            ]);
            $orden->detalles()->delete();
            $this->syncDetalles($orden, $detalles);
            $this->recalculate($orden);

            return $orden->fresh(self::RELATIONS);
        });
    }

    public function autorizar(OrdenCompraProducto $orden, ?string $observacion = null): OrdenCompraProducto
    {
        $this->assertPendiente($orden);
        $orden->update([
            'estado' => OrdenCompraProducto::ESTADO_AUTORIZADO,
            'autorizado_por' => Auth::id(),
            'fecha_decision' => now(),
            'observacion_estado' => $observacion,
        ]);

        return $orden->fresh(self::RELATIONS);
    }

    public function cancelar(OrdenCompraProducto $orden, ?string $observacion = null): OrdenCompraProducto
    {
        $this->assertPendiente($orden);
        $orden->update([
            'estado' => OrdenCompraProducto::ESTADO_CANCELADO,
            'autorizado_por' => Auth::id(),
            'fecha_decision' => now(),
            'observacion_estado' => $observacion,
        ]);

        return $orden->fresh(self::RELATIONS);
    }

    public function pdf(OrdenCompraProducto $orden): Response
    {
        $orden->load(self::RELATIONS);
        $labels = [
            OrdenCompraProducto::ESTADO_PENDIENTE => 'Pendiente',
            OrdenCompraProducto::ESTADO_AUTORIZADO => 'Autorizado',
            OrdenCompraProducto::ESTADO_CANCELADO => 'Cancelado',
        ];

        return $this->pdfGenerator->download(
            'documentos.orden-compra-producto',
            [
                'titulo' => 'Orden de Compra de Productos',
                'orden' => $orden,
                'estado_label' => $labels[$orden->estado] ?? $orden->estado,
            ],
            $orden->cod_compra.'.pdf'
        );
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return Builder<OrdenCompraProducto>
     */
    private function buildQuery(array $filters): Builder
    {
        $query = OrdenCompraProducto::query()->with(self::RELATIONS);
        if (! empty($filters['search'])) {
            $search = (string) $filters['search'];
            $query->where(function (Builder $builder) use ($search) {
                $builder->where('cod_compra', 'ilike', '%'.$search.'%')
                    ->orWhereHas('proveedor', fn (Builder $q) => $q->where('razon_social', 'ilike', '%'.$search.'%'));
            });
        }
        if (! empty($filters['estado'])) {
            $query->where('estado', $filters['estado']);
        }
        if (! empty($filters['proveedor_id'])) {
            $query->where('proveedor_id', (int) $filters['proveedor_id']);
        }
        $sortBy = in_array($filters['sort_by'] ?? '', self::SORTABLE_COLUMNS, true) ? $filters['sort_by'] : 'created_at';
        $sortDir = strtolower((string) ($filters['sort_dir'] ?? 'desc')) === 'asc' ? 'asc' : 'desc';

        return $query->orderBy($sortBy, $sortDir);
    }

    private function assertProveedor(int $id): void
    {
        $ok = Persona::query()
            ->whereKey($id)
            ->whereHas('tipos', fn ($q) => $q->where('tipo.nombre', TipoPersona::PROVEEDOR))
            ->exists();
        if (! $ok) {
            throw ValidationException::withMessages([
                'proveedor_id' => 'Debe seleccionar un proveedor válido.',
            ]);
        }
    }

    private function assertPendiente(OrdenCompraProducto $orden): void
    {
        if (! $orden->estaPendiente()) {
            throw ValidationException::withMessages([
                'estado' => 'Solo una orden pendiente puede autorizarse o cancelarse.',
            ]);
        }
    }

    /**
     * @param  array<int, array<string, mixed>>  $detalles
     * @return list<array{medicamento_id:int, cantidad:int, precio:float, descuento:float, subtotal:float}>
     */
    private function normalizeDetalles(array $detalles): array
    {
        if ($detalles === []) {
            throw ValidationException::withMessages(['detalles' => 'Debe agregar al menos un producto.']);
        }
        $normalizados = [];
        $vistos = [];
        foreach ($detalles as $index => $linea) {
            $productoId = (int) ($linea['medicamento_id'] ?? 0);
            $cantidad = (int) ($linea['cantidad'] ?? 0);
            $precio = round((float) ($linea['precio'] ?? 0), 2);
            $descuento = round((float) ($linea['descuento'] ?? 0), 2);
            if ($productoId < 1 || in_array($productoId, $vistos, true)) {
                throw ValidationException::withMessages([
                    "detalles.$index.medicamento_id" => 'El producto es obligatorio y no puede repetirse.',
                ]);
            }
            if ($cantidad < 1 || $precio < 0 || $descuento < 0) {
                throw ValidationException::withMessages([
                    "detalles.$index.cantidad" => 'Cantidad, precio y descuento no son válidos.',
                ]);
            }
            $producto = Medicamento::query()->whereKey($productoId)->where('activo', true)->whereNull('deleted_at')->first();
            if (! $producto) {
                throw ValidationException::withMessages([
                    "detalles.$index.medicamento_id" => 'El producto no existe o no está activo.',
                ]);
            }
            $subtotal = round(($cantidad * $precio) - $descuento, 2);
            if ($subtotal < 0) {
                throw ValidationException::withMessages([
                    "detalles.$index.descuento" => 'El descuento no puede superar el subtotal.',
                ]);
            }
            $vistos[] = $productoId;
            $normalizados[] = [
                'medicamento_id' => $productoId,
                'cantidad' => $cantidad,
                'precio' => $precio,
                'descuento' => $descuento,
                'subtotal' => $subtotal,
            ];
        }

        return $normalizados;
    }

    /**
     * @param  list<array{medicamento_id:int, cantidad:int, precio:float, descuento:float, subtotal:float}>  $detalles
     */
    private function syncDetalles(OrdenCompraProducto $orden, array $detalles): void
    {
        foreach ($detalles as $linea) {
            $orden->detalles()->create($linea);
        }
    }

    private function recalculate(OrdenCompraProducto $orden): void
    {
        $suma = (float) $orden->detalles()->sum('subtotal');
        $orden->monto_total = round(max(0, $suma - (float) $orden->descuento), 2);
        $orden->save();
    }

    private function nextCodigo(): string
    {
        $ultimo = OrdenCompraProducto::query()->lockForUpdate()->orderByDesc('id')->value('cod_compra');
        $n = 1;
        if (is_string($ultimo) && preg_match('/(\d+)$/', $ultimo, $m)) {
            $n = (int) $m[1] + 1;
        }

        return 'OCP-'.str_pad((string) $n, 6, '0', STR_PAD_LEFT);
    }
}
