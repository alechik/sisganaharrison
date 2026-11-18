<?php

namespace App\Http\Controllers\Api\ComprasProductos;

use App\Http\Controllers\Controller;
use App\Http\Requests\ComprasProductos\PreviewIngresoProductoExcelRequest;
use App\Http\Requests\ComprasProductos\StoreIngresoProductoRequest;
use App\Http\Resources\Almacenes\AlmacenResource;
use App\Http\Resources\ComprasProductos\IngresoProductoResource;
use App\Http\Resources\ComprasProductos\OrdenCompraProductoResource;
use App\Http\Resources\Productos\ProductoResource;
use App\Models\IngresoProducto;
use App\Services\ComprasProductos\IngresoProductoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\StreamedResponse;

class IngresoProductoController extends Controller
{
    public function __construct(private readonly IngresoProductoService $service) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', IngresoProducto::class);

        return IngresoProductoResource::collection($this->service->paginate($request->all()));
    }

    public function show(IngresoProducto $ingresoProducto): IngresoProductoResource
    {
        $this->authorize('view', $ingresoProducto);

        return new IngresoProductoResource($this->service->find($ingresoProducto->id));
    }

    public function productosDisponibles(Request $request): AnonymousResourceCollection
    {
        $this->authorize('create', IngresoProducto::class);

        return ProductoResource::collection($this->service->productosDisponibles($request->all()));
    }

    public function proveedoresDisponibles(Request $request): JsonResponse
    {
        $this->authorize('viewAny', IngresoProducto::class);

        $proveedores = $this->service->proveedoresDisponibles($request->all())->map(fn ($persona) => [
            'id' => $persona->id,
            'codigo' => $persona->nit ?: (string) $persona->id,
            'razon_social' => $persona->razon_social,
            'nit' => $persona->nit,
        ])->values();

        return response()->json(['data' => $proveedores]);
    }

    public function almacenesDisponibles(): AnonymousResourceCollection
    {
        $this->authorize('viewAny', IngresoProducto::class);

        return AlmacenResource::collection($this->service->almacenesDisponibles());
    }

    public function plantillaExcel(): StreamedResponse
    {
        $this->authorize('create', IngresoProducto::class);

        return $this->service->descargarPlantilla();
    }

    public function previewExcel(PreviewIngresoProductoExcelRequest $request): JsonResponse
    {
        $this->authorize('create', IngresoProducto::class);

        try {
            $preview = $this->service->previewExcel($request->file('archivo'));
        } catch (ValidationException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
                'errors' => $exception->errors(),
            ], 422);
        }

        return response()->json(['data' => $preview]);
    }

    public function traer(Request $request): JsonResponse
    {
        $this->authorize('create', IngresoProducto::class);
        $ordenId = (int) $request->query('orden_compra_id', 0);
        if ($ordenId < 1) {
            return response()->json([
                'message' => 'Debe seleccionar una orden de compra de productos autorizada.',
                'errors' => ['orden_compra_id' => ['Debe seleccionar una orden de compra de productos autorizada.']],
            ], 422);
        }
        try {
            $orden = $this->service->previewOrden($ordenId);
        } catch (ValidationException $exception) {
            return response()->json(['message' => $exception->getMessage(), 'errors' => $exception->errors()], 422);
        }

        return response()->json(['data' => new OrdenCompraProductoResource($orden)]);
    }

    public function store(StoreIngresoProductoRequest $request): JsonResponse
    {
        $this->authorize('create', IngresoProducto::class);
        try {
            $ingreso = $this->service->create($request->validated());
        } catch (ValidationException $exception) {
            return response()->json(['message' => $exception->getMessage(), 'errors' => $exception->errors()], 422);
        }

        return response()->json(['message' => 'Ingreso de productos registrado correctamente', 'data' => new IngresoProductoResource($ingreso)], 201);
    }

    public function pdf(IngresoProducto $ingresoProducto): Response
    {
        $this->authorize('view', $ingresoProducto);

        return $this->service->pdf($ingresoProducto);
    }
}
