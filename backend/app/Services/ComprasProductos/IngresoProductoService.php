<?php

namespace App\Services\ComprasProductos;

use App\Models\Almacen;
use App\Models\DetalleIngresoProducto;
use App\Models\IngresoProducto;
use App\Models\Producto;
use App\Models\MovimientoInventario;
use App\Models\OrdenCompraProducto;
use App\Models\Persona;
use App\Models\TipoPersona;
use App\Services\Documentos\PdfGenerator;
use App\Services\Inventario\InventarioService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Response;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\StreamedResponse;

class IngresoProductoService
{
    public const PREFIJO_COMPRA = 'INCO';

    private const SORTABLE_COLUMNS = ['cod_ingreso', 'fecha', 'monto_total', 'created_at'];

    private const RELATIONS = [
        'orden:id,cod_compra,estado,proveedor_id',
        'proveedor:id,razon_social,nit',
        'almacen:id,nombre,estancia_id',
        'creador:id,nombre,apellido',
        'detalles.producto:id,codigo,nombre,precio,presentacion_id',
        'detalles.producto.presentacion:id,nombre',
    ];

    public function __construct(
        private readonly PdfGenerator $pdfGenerator,
        private readonly InventarioService $inventarioService,
        private readonly IngresoProductoExcelService $excelService
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

    /**
     * @param  array<string, mixed>  $filters
     * @return Collection<int, Producto>
     */
    public function productosDisponibles(array $filters = []): Collection
    {
        $search = trim((string) ($filters['search'] ?? ''));
        if (mb_strlen($search) < 1) {
            return collect();
        }

        return Producto::query()
            ->with('presentacion:id,nombre')
            ->where('activo', true)
            ->whereNull('deleted_at')
            ->where(function (Builder $builder) use ($search) {
                $builder->where('codigo', 'ilike', '%'.$search.'%')
                    ->orWhere('nombre', 'ilike', '%'.$search.'%');
            })
            ->orderBy('codigo')
            ->limit(20)
            ->get();
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return Collection<int, Persona>
     */
    public function proveedoresDisponibles(array $filters = []): Collection
    {
        $search = trim((string) ($filters['search'] ?? ''));

        $query = Persona::query()
            ->where('estado', Persona::ESTADO_ACTIVO)
            ->whereNull('deleted_at')
            ->whereHas('tipos', fn (Builder $builder) => $builder->where('tipo.nombre', TipoPersona::PROVEEDOR));

        if ($search !== '') {
            $query->where(function (Builder $builder) use ($search) {
                $builder->where('razon_social', 'ilike', '%'.$search.'%')
                    ->orWhere('nit', 'ilike', '%'.$search.'%')
                    ->orWhere('responsable', 'ilike', '%'.$search.'%');

                if (is_numeric($search)) {
                    $builder->orWhere('id', (int) $search)
                        ->orWhere('ci', (int) $search);
                }
            });
        }

        return $query->orderBy('razon_social')->limit(20)->get();
    }

    /**
     * @return Collection<int, Almacen>
     */
    public function almacenesDisponibles(): Collection
    {
        return Almacen::query()
            ->with('estancia:id,codigo,nombre')
            ->activos()
            ->whereNull('deleted_at')
            ->orderBy('nombre')
            ->get();
    }

    public function previewOrden(int $ordenId): OrdenCompraProducto
    {
        $orden = OrdenCompraProducto::query()
            ->with(['proveedor:id,razon_social,nit', 'detalles.producto:id,codigo,nombre,precio,presentacion_id', 'detalles.producto.presentacion:id,nombre'])
            ->findOrFail($ordenId);

        if (! $orden->estaAutorizada()) {
            throw ValidationException::withMessages([
                'orden_compra_id' => 'Solo se pueden ingresar productos de una orden autorizada.',
            ]);
        }

        $yaIngresado = $this->cantidadesIngresadas($orden->id);
        foreach ($orden->detalles as $detalle) {
            $detalle->cantidad_pendiente = max(
                0,
                (int) $detalle->cantidad - (int) ($yaIngresado[$detalle->producto_id] ?? 0)
            );
        }

        return $orden;
    }

    public function descargarPlantilla(): StreamedResponse
    {
        $plantilla = $this->excelService->plantilla();

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
        $codigos = [];
        $validas = 0;
        $conErrores = 0;

        foreach ($crudas as $cruda) {
            $normalizada = $this->normalizarFilaExcel($cruda, $codigos);
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
    public function create(array $data): IngresoProducto
    {
        return DB::transaction(function () use ($data) {
            $orden = $this->resolverOrden($data['orden_compra_id'] ?? null);
            $almacen = $this->assertAlmacen((int) $data['almacen_id']);
            $proveedorId = (int) ($data['proveedor_id'] ?? $orden?->proveedor_id ?? 0);
            $this->assertProveedor($proveedorId, $orden);

            $detalles = $this->normalizeDetalles($data['detalles'] ?? [], $orden);
            $descuento = round((float) ($data['descuento'] ?? 0), 2);
            if ($descuento < 0) {
                throw ValidationException::withMessages([
                    'descuento' => 'El descuento no puede ser negativo.',
                ]);
            }

            $suma = round(array_sum(array_column($detalles, 'subtotal')), 2);
            if ($descuento > $suma) {
                throw ValidationException::withMessages([
                    'descuento' => 'El descuento no puede superar el subtotal del ingreso.',
                ]);
            }

            $ingreso = IngresoProducto::query()->create([
                'orden_compra_id' => $orden?->id,
                'proveedor_id' => $proveedorId,
                'almacen_id' => $almacen->id,
                'user_id' => Auth::id(),
                'cod_ingreso' => $this->nextCodigo(),
                'fecha' => $data['fecha'] ?? now()->toDateString(),
                'descuento' => $descuento,
                'monto_total' => 0,
                'observaciones' => $data['observaciones'] ?? null,
            ]);

            foreach ($detalles as $linea) {
                $detalle = $ingreso->detalles()->create($linea);
                $this->inventarioService->registrar([
                    'almacen_id' => $almacen->id,
                    'producto_id' => $linea['producto_id'],
                    'tipo' => MovimientoInventario::TIPO_INGRESO_COMPRA,
                    'cantidad' => $linea['cantidad'],
                    'precio_unitario' => $linea['precio'],
                    'origen_type' => 'ingreso_producto',
                    'origen_id' => $detalle->id,
                    'observaciones' => 'Ingreso '.$ingreso->cod_ingreso,
                ]);
            }

            $ingreso->monto_total = round(max(0, $suma - $descuento), 2);
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
                    ->orWhereHas('orden', fn (Builder $q) => $q->where('cod_compra', 'ilike', '%'.$search.'%'))
                    ->orWhereHas('proveedor', fn (Builder $q) => $q->where('razon_social', 'ilike', '%'.$search.'%')
                        ->orWhere('nit', 'ilike', '%'.$search.'%'));
            });
        }
        if (! empty($filters['orden_compra_id'])) {
            $query->where('orden_compra_id', (int) $filters['orden_compra_id']);
        }
        if (! empty($filters['almacen_id'])) {
            $query->where('almacen_id', (int) $filters['almacen_id']);
        }
        if (! empty($filters['proveedor_id'])) {
            $query->where('proveedor_id', (int) $filters['proveedor_id']);
        }
        if (! empty($filters['cod_ingreso'])) {
            $query->where('cod_ingreso', 'ilike', '%'.$filters['cod_ingreso'].'%');
        }
        if (! empty($filters['fecha'])) {
            $query->whereDate('fecha', $filters['fecha']);
        }
        $sortBy = in_array($filters['sort_by'] ?? '', self::SORTABLE_COLUMNS, true) ? $filters['sort_by'] : 'created_at';
        $sortDir = strtolower((string) ($filters['sort_dir'] ?? 'desc')) === 'asc' ? 'asc' : 'desc';

        return $query->orderBy($sortBy, $sortDir);
    }

    private function resolverOrden(mixed $ordenId): ?OrdenCompraProducto
    {
        if ($ordenId === null || $ordenId === '' || (int) $ordenId < 1) {
            return null;
        }

        $orden = OrdenCompraProducto::query()
            ->with('detalles')
            ->lockForUpdate()
            ->find((int) $ordenId);

        if (! $orden) {
            throw ValidationException::withMessages([
                'orden_compra_id' => 'La orden de compra no existe.',
            ]);
        }

        if (! $orden->estaAutorizada()) {
            throw ValidationException::withMessages([
                'orden_compra_id' => 'Solo se pueden ingresar productos de una orden autorizada.',
            ]);
        }

        return $orden;
    }

    private function assertAlmacen(int $almacenId): Almacen
    {
        $almacen = Almacen::query()
            ->whereKey($almacenId)
            ->where('activo', true)
            ->whereNull('deleted_at')
            ->first();

        if (! $almacen) {
            throw ValidationException::withMessages([
                'almacen_id' => 'El almacén seleccionado no existe o no está activo.',
            ]);
        }

        return $almacen;
    }

    private function assertProveedor(int $proveedorId, ?OrdenCompraProducto $orden): void
    {
        if ($proveedorId < 1) {
            throw ValidationException::withMessages([
                'proveedor_id' => 'Debe seleccionar un proveedor.',
            ]);
        }

        $ok = Persona::query()
            ->whereKey($proveedorId)
            ->where('estado', Persona::ESTADO_ACTIVO)
            ->whereNull('deleted_at')
            ->whereHas('tipos', fn ($q) => $q->where('tipo.nombre', TipoPersona::PROVEEDOR))
            ->exists();

        if (! $ok) {
            throw ValidationException::withMessages([
                'proveedor_id' => 'Debe seleccionar un proveedor válido.',
            ]);
        }

        if ($orden && (int) $orden->proveedor_id !== $proveedorId) {
            throw ValidationException::withMessages([
                'proveedor_id' => 'El proveedor no coincide con la orden de compra asociada.',
            ]);
        }
    }

    /**
     * @param  array<int, array<string, mixed>>  $detalles
     * @return list<array{producto_id:int, cantidad:int, precio:float, descuento:float, subtotal:float}>
     */
    private function normalizeDetalles(array $detalles, ?OrdenCompraProducto $orden): array
    {
        if ($detalles === []) {
            throw ValidationException::withMessages(['detalles' => 'Debe ingresar al menos un producto.']);
        }

        $autorizados = $orden?->detalles->keyBy('producto_id');
        $yaIngresado = $orden ? $this->cantidadesIngresadas($orden->id) : collect();

        $normalizados = [];
        $vistos = [];
        foreach ($detalles as $index => $linea) {
            $productoId = (int) ($linea['producto_id'] ?? 0);
            $cantidad = (int) ($linea['cantidad'] ?? 0);
            if ($productoId < 1 || in_array($productoId, $vistos, true)) {
                throw ValidationException::withMessages([
                    "detalles.$index.producto_id" => 'El producto es obligatorio y no puede repetirse.',
                ]);
            }

            $producto = Producto::query()
                ->whereKey($productoId)
                ->where('activo', true)
                ->whereNull('deleted_at')
                ->first();
            if (! $producto) {
                throw ValidationException::withMessages([
                    "detalles.$index.producto_id" => 'El producto no existe o no está activo.',
                ]);
            }

            if ($autorizados) {
                $autorizado = $autorizados->get($productoId);
                if (! $autorizado) {
                    throw ValidationException::withMessages([
                        "detalles.$index.producto_id" => 'El producto no figura en la orden autorizada.',
                    ]);
                }
                $pendiente = (int) $autorizado->cantidad - (int) ($yaIngresado[$productoId] ?? 0);
                if ($cantidad < 1 || $cantidad > $pendiente) {
                    throw ValidationException::withMessages([
                        "detalles.$index.cantidad" => "La cantidad supera lo pendiente de ingresar ({$pendiente}).",
                    ]);
                }
            } elseif ($cantidad < 1) {
                throw ValidationException::withMessages([
                    "detalles.$index.cantidad" => 'La cantidad debe ser mayor a cero.',
                ]);
            }

            $precio = round((float) ($linea['precio'] ?? 0), 2);
            if ($precio < 0) {
                throw ValidationException::withMessages([
                    "detalles.$index.precio" => 'El precio no puede ser negativo.',
                ]);
            }

            $descuento = 0.0;
            $subtotal = round($cantidad * $precio, 2);
            $vistos[] = $productoId;
            $normalizados[] = [
                'producto_id' => $productoId,
                'cantidad' => $cantidad,
                'precio' => $precio,
                'descuento' => $descuento,
                'subtotal' => $subtotal,
            ];
        }

        return $normalizados;
    }

    /**
     * @param  array<string, mixed>  $cruda
     * @param  array<string, int>  $codigos
     * @return array<string, mixed>
     */
    private function normalizarFilaExcel(array $cruda, array &$codigos): array
    {
        $linea = (int) ($cruda['linea'] ?? 0);
        $codigo = strtoupper(trim((string) ($cruda['codigo_producto'] ?? '')));
        $cantidadRaw = str_replace(',', '.', (string) ($cruda['cantidad'] ?? ''));
        $precioRaw = str_replace(',', '.', (string) ($cruda['precio'] ?? ''));
        $errores = [];

        $cantidad = is_numeric($cantidadRaw) ? (int) $cantidadRaw : 0;
        $precio = is_numeric($precioRaw) ? round((float) $precioRaw, 2) : null;

        if ($codigo === '') {
            $errores[] = 'El código de producto es obligatorio.';
        }
        if ($cantidad < 1) {
            $errores[] = 'La cantidad debe ser un entero mayor a cero.';
        }
        if ($precio === null || $precio < 0) {
            $errores[] = 'El precio no es válido.';
        }
        if ($codigo !== '' && isset($codigos[$codigo])) {
            $errores[] = 'El producto está duplicado en el archivo (línea '.$codigos[$codigo].').';
        }

        $producto = null;
        if ($codigo !== '') {
            $producto = Producto::query()
                ->with('presentacion:id,nombre')
                ->whereNull('deleted_at')
                ->whereRaw('upper(codigo) = ?', [$codigo])
                ->first();

            if (! $producto) {
                $errores[] = 'El producto no existe.';
            } elseif (! $producto->activo) {
                $errores[] = 'El producto está inactivo.';
            }
        }

        if ($codigo !== '') {
            $codigos[$codigo] = $linea;
        }

        $valida = $errores === [];
        $subtotal = $valida ? round($cantidad * (float) $precio, 2) : 0;

        return [
            'linea' => $linea,
            'codigo_producto' => $codigo,
            'producto_id' => $producto?->id,
            'producto_codigo' => $producto?->codigo,
            'producto_nombre' => $producto?->nombre,
            'unidad' => $producto?->presentacion?->nombre,
            'cantidad' => $cantidad > 0 ? $cantidad : (is_numeric($cantidadRaw) ? $cantidad : null),
            'precio' => $precio,
            'subtotal' => $subtotal,
            'errores' => $errores,
            'valida' => $valida,
        ];
    }

    /**
     * @return \Illuminate\Support\Collection<int|string, mixed>
     */
    private function cantidadesIngresadas(int $ordenId)
    {
        return DetalleIngresoProducto::query()
            ->whereHas('ingreso', fn (Builder $q) => $q->where('orden_compra_id', $ordenId))
            ->selectRaw('producto_id, sum(cantidad) as total')
            ->groupBy('producto_id')
            ->pluck('total', 'producto_id');
    }

    private function nextCodigo(): string
    {
        $prefix = self::PREFIJO_COMPRA;
        $ultimo = IngresoProducto::query()
            ->where('cod_ingreso', 'like', $prefix.'%')
            ->lockForUpdate()
            ->orderByDesc('cod_ingreso')
            ->value('cod_ingreso');

        $secuencia = 1;
        if (is_string($ultimo) && preg_match('/^'.preg_quote($prefix, '/').'(\d+)$/', $ultimo, $matches)) {
            $secuencia = ((int) $matches[1]) + 1;
        }

        return $prefix.str_pad((string) $secuencia, 6, '0', STR_PAD_LEFT);
    }
}
