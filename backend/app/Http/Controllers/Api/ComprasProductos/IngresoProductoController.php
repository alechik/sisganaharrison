<?php

namespace App\Http\Controllers\Api\ComprasProductos;

use App\Http\Controllers\Controller;
use App\Http\Requests\ComprasProductos\StoreIngresoProductoRequest;
use App\Http\Resources\ComprasProductos\IngresoProductoResource;
use App\Http\Resources\ComprasProductos\OrdenCompraProductoResource;
use App\Models\IngresoProducto;
use App\Services\ComprasProductos\IngresoProductoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Validation\ValidationException;

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
