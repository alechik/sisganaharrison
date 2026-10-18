<?php

namespace App\Http\Controllers\Api\ComprasProductos;

use App\Http\Controllers\Controller;
use App\Http\Requests\ComprasProductos\DecidirOrdenCompraProductoRequest;
use App\Http\Requests\ComprasProductos\StoreOrdenCompraProductoRequest;
use App\Http\Requests\ComprasProductos\UpdateOrdenCompraProductoRequest;
use App\Http\Resources\ComprasProductos\OrdenCompraProductoResource;
use App\Models\OrdenCompraProducto;
use App\Services\ComprasProductos\OrdenCompraProductoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Validation\ValidationException;

class OrdenCompraProductoController extends Controller
{
    public function __construct(private readonly OrdenCompraProductoService $service) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', OrdenCompraProducto::class);

        return OrdenCompraProductoResource::collection($this->service->paginate($request->all()));
    }

    public function show(OrdenCompraProducto $ordenCompraProducto): OrdenCompraProductoResource
    {
        $this->authorize('view', $ordenCompraProducto);

        return new OrdenCompraProductoResource($this->service->find($ordenCompraProducto->id));
    }

    public function store(StoreOrdenCompraProductoRequest $request): JsonResponse
    {
        $this->authorize('create', OrdenCompraProducto::class);
        try {
            $orden = $this->service->create($request->validated());
        } catch (ValidationException $exception) {
            return response()->json(['message' => $exception->getMessage(), 'errors' => $exception->errors()], 422);
        }

        return response()->json(['message' => 'Orden de compra de productos registrada correctamente', 'data' => new OrdenCompraProductoResource($orden)], 201);
    }

    public function update(UpdateOrdenCompraProductoRequest $request, OrdenCompraProducto $ordenCompraProducto): JsonResponse
    {
        $this->authorize('update', $ordenCompraProducto);
        try {
            $orden = $this->service->update($ordenCompraProducto, $request->validated());
        } catch (ValidationException $exception) {
            return response()->json(['message' => $exception->getMessage(), 'errors' => $exception->errors()], 422);
        }

        return response()->json(['message' => 'Orden de compra de productos actualizada correctamente', 'data' => new OrdenCompraProductoResource($orden)]);
    }

    public function autorizar(DecidirOrdenCompraProductoRequest $request, OrdenCompraProducto $ordenCompraProducto): JsonResponse
    {
        $this->authorize('authorize', $ordenCompraProducto);
        try {
            $orden = $this->service->autorizar($ordenCompraProducto, $request->validated('observacion') ?? null);
        } catch (ValidationException $exception) {
            return response()->json(['message' => $exception->getMessage(), 'errors' => $exception->errors()], 422);
        }

        return response()->json(['message' => 'Orden autorizada correctamente', 'data' => new OrdenCompraProductoResource($orden)]);
    }

    public function cancelar(DecidirOrdenCompraProductoRequest $request, OrdenCompraProducto $ordenCompraProducto): JsonResponse
    {
        $this->authorize('authorize', $ordenCompraProducto);
        try {
            $orden = $this->service->cancelar($ordenCompraProducto, $request->validated('observacion') ?? null);
        } catch (ValidationException $exception) {
            return response()->json(['message' => $exception->getMessage(), 'errors' => $exception->errors()], 422);
        }

        return response()->json(['message' => 'Orden cancelada correctamente', 'data' => new OrdenCompraProductoResource($orden)]);
    }

    public function pdf(OrdenCompraProducto $ordenCompraProducto): Response
    {
        $this->authorize('view', $ordenCompraProducto);

        return $this->service->pdf($ordenCompraProducto);
    }
}
