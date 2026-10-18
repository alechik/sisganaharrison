<?php

namespace App\Services\ComprasProductos;

use App\Models\Almacen;
use App\Models\DetalleIngresoProducto;
use App\Models\IngresoProducto;
use App\Models\MovimientoInventario;
use App\Models\OrdenCompraProducto;
use App\Services\Documentos\PdfGenerator;
use App\Services\Inventario\InventarioService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class IngresoProductoService
{
    private const SORTABLE_COLUMNS = ['cod_ingreso', 'fecha', 'monto_total', 'created_at'];

    private const RELATIONS = [
        'orden:id,cod_compra,estado,proveedor_id',
        'proveedor:id,razon_social,nit',
        'almacen:id,nombre,establecimiento_id',
        'creador:id,nombre,apellido',
        'detalles.medicamento:id,codigo,nombre,precio',
    ];

    public function __construct(
        private readonly PdfGenerator $pdfGenerator,
        private readonly InventarioService $inventarioService
    ) {}

    /**
     * @param  array<string, mixed>  $filters
     */
    public function paginate(array $filters = []): LengthAwarePaginator
    {
        return $this->buildQuery($filters)->paginate((int) ($filters['per_page'] ?? 10));
    }

    public function find(int $id): IngresoProducto
    {
        return IngresoProducto::query()->with(self::RELATIONS)->findOrFail($id);
    }

    public function previewOrden(int $ordenId): OrdenCompraProducto
    {
        $orden = OrdenCompraProducto::query()
            ->with(['proveedor:id,razon_social,nit', 'detalles.medicamento:id,codigo,nombre,precio'])
            ->findOrFail($ordenId);

        if (! $orden->estaAutorizada()) {
            throw ValidationException::withMessages([
                'orden_compra_id' => 'Solo se pueden ingresar productos de una orden autorizada.',
            ]);
        }

        return $orden;
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): IngresoProducto
    {
        return DB::transaction(function () use ($data) {
            $orden = OrdenCompraProducto::query()
                ->with('detalles')
                ->lockForUpdate()
                ->findOrFail((int) $data['orden_compra_id']);

            if (! $orden->estaAutorizada()) {
                throw ValidationException::withMessages([
                    'orden_compra_id' => 'Solo se pueden ingresar productos de una orden autorizada.',
                ]);
            }

            $almacen = Almacen::query()
                ->whereKey((int) $data['almacen_id'])
                ->where('activo', true)
                ->whereNull('deleted_at')
                ->first();
            if (! $almacen) {
                throw ValidationException::withMessages([
                    'almacen_id' => 'El almacén seleccionado no existe o no está activo.',
                ]);
            }

            $detalles = $this->normalizeDetalles($orden, $data['detalles'] ?? []);

            $ingreso = IngresoProducto::query()->create([
                'orden_compra_id' => $orden->id,
                'proveedor_id' => $orden->proveedor_id,
                'almacen_id' => $almacen->id,
                'user_id' => Auth::id(),
                'cod_ingreso' => $this->nextCodigo(),
                'fecha' => $data['fecha'] ?? now()->toDateString(),
                'descuento' => (float) ($data['descuento'] ?? 0),
                'monto_total' => 0,
                'observaciones' => $data['observaciones'] ?? null,
            ]);

            $total = 0;
            foreach ($detalles as $linea) {
                $detalle = $ingreso->detalles()->create($linea);
                $total += $linea['subtotal'];
                $this->inventarioService->registrar([
                    'almacen_id' => $almacen->id,
                    'medicamento_id' => $linea['medicamento_id'],
                    'tipo' => MovimientoInventario::TIPO_INGRESO_COMPRA,
                    'cantidad' => $linea['cantidad'],
                    'precio_unitario' => $linea['precio'],
                    'origen_type' => 'ingreso_producto',
                    'origen_id' => $detalle->id,
                    'observaciones' => 'Ingreso '.$ingreso->cod_ingreso,
                ]);
            }

            $ingreso->monto_total = round(max(0, $total - (float) $ingreso->descuento), 2);
            $ingreso->save();

            return $ingreso->fresh(self::RELATIONS);
        });
    }

    public function pdf(IngresoProducto $ingreso): Response
    {
        $ingreso->load(self::RELATIONS);

        return $this->pdfGenerator->download(
            'documentos.ingreso-producto',
            [
                'titulo' => 'Ingreso de Productos',
                'ingreso' => $ingreso,
            ],
            $ingreso->cod_ingreso.'.pdf'
        );
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return Builder<IngresoProducto>
     */
    private function buildQuery(array $filters): Builder
    {
        $query = IngresoProducto::query()->with(self::RELATIONS);
        if (! empty($filters['search'])) {
            $search = (string) $filters['search'];
            $query->where(function (Builder $builder) use ($search) {
                $builder->where('cod_ingreso', 'ilike', '%'.$search.'%')
                    ->orWhereHas('orden', fn (Builder $q) => $q->where('cod_compra', 'ilike', '%'.$search.'%'));
            });
        }
        if (! empty($filters['orden_compra_id'])) {
            $query->where('orden_compra_id', (int) $filters['orden_compra_id']);
        }
        if (! empty($filters['almacen_id'])) {
            $query->where('almacen_id', (int) $filters['almacen_id']);
        }
        $sortBy = in_array($filters['sort_by'] ?? '', self::SORTABLE_COLUMNS, true) ? $filters['sort_by'] : 'created_at';
        $sortDir = strtolower((string) ($filters['sort_dir'] ?? 'desc')) === 'asc' ? 'asc' : 'desc';

        return $query->orderBy($sortBy, $sortDir);
    }

    /**
     * @param  array<int, array<string, mixed>>  $detalles
     * @return list<array{medicamento_id:int, cantidad:int, precio:float, descuento:float, subtotal:float}>
     */
    private function normalizeDetalles(OrdenCompraProducto $orden, array $detalles): array
    {
        if ($detalles === []) {
            throw ValidationException::withMessages(['detalles' => 'Debe ingresar al menos un producto.']);
        }

        $autorizados = $orden->detalles->keyBy('medicamento_id');
        $yaIngresado = DetalleIngresoProducto::query()
            ->whereHas('ingreso', fn (Builder $q) => $q->where('orden_compra_id', $orden->id))
            ->selectRaw('medicamento_id, sum(cantidad) as total')
            ->groupBy('medicamento_id')
            ->pluck('total', 'medicamento_id');

        $normalizados = [];
        $vistos = [];
        foreach ($detalles as $index => $linea) {
            $productoId = (int) ($linea['medicamento_id'] ?? 0);
            $cantidad = (int) ($linea['cantidad'] ?? 0);
            if ($productoId < 1 || in_array($productoId, $vistos, true)) {
                throw ValidationException::withMessages([
                    "detalles.$index.medicamento_id" => 'El producto es obligatorio y no puede repetirse.',
                ]);
            }
            $autorizado = $autorizados->get($productoId);
            if (! $autorizado) {
                throw ValidationException::withMessages([
                    "detalles.$index.medicamento_id" => 'El producto no figura en la orden autorizada.',
                ]);
            }
            $pendiente = (int) $autorizado->cantidad - (int) ($yaIngresado[$productoId] ?? 0);
            if ($cantidad < 1 || $cantidad > $pendiente) {
                throw ValidationException::withMessages([
                    "detalles.$index.cantidad" => "La cantidad supera lo pendiente de ingresar ({$pendiente}).",
                ]);
            }
            $precio = round((float) ($linea['precio'] ?? $autorizado->precio), 2);
            $descuento = round((float) ($linea['descuento'] ?? 0), 2);
            $subtotal = round(($cantidad * $precio) - $descuento, 2);
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

    private function nextCodigo(): string
    {
        $ultimo = IngresoProducto::query()->lockForUpdate()->orderByDesc('id')->value('cod_ingreso');
        $n = 1;
        if (is_string($ultimo) && preg_match('/(\d+)$/', $ultimo, $m)) {
            $n = (int) $m[1] + 1;
        }

        return 'IP-'.str_pad((string) $n, 6, '0', STR_PAD_LEFT);
    }
}
