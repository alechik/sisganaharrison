<?php

namespace App\Http\Controllers\Api\Productos;

use App\Http\Controllers\Controller;
use App\Http\Requests\Productos\StoreProductoRequest;
use App\Http\Requests\Productos\UpdateProductoRequest;
use App\Http\Resources\Productos\ProductoResource;
use App\Models\Producto;
use App\Services\Productos\ProductoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\ValidationException;

class ProductoController extends Controller
{
    public function __construct(
        private readonly ProductoService $productoService
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Producto::class);

        return ProductoResource::collection(
            $this->productoService->paginate($request->all())
        );
    }

    public function deleted(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Producto::class);

        return ProductoResource::collection(
            $this->productoService->paginateDeleted($request->all())
        );
    }

    public function show(Producto $producto): ProductoResource
    {
        $this->authorize('view', $producto);

        $producto->load(['presentacion:id,nombre', 'subcategoria:id,nombre,categoria_producto_id', 'subcategoria.categoria:id,nombre']);

        return new ProductoResource($producto);
    }

    public function store(StoreProductoRequest $request): JsonResponse
    {
        $this->authorize('create', Producto::class);

        $producto = $this->productoService->create($request->validated());

        return response()->json([
            'message' => 'Producto creado correctamente',
            'data' => new ProductoResource($producto),
        ], 201);
    }

    public function update(UpdateProductoRequest $request, Producto $producto): JsonResponse
    {
        $this->authorize('update', $producto);

        $producto = $this->productoService->update($producto, $request->validated());

        return response()->json([
            'message' => 'Producto actualizado correctamente',
            'data' => new ProductoResource($producto),
        ]);
    }

    public function destroy(Producto $producto): JsonResponse
    {
        $this->authorize('delete', $producto);

        try {
            $this->productoService->delete($producto);
        } catch (ValidationException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
                'errors' => $exception->errors(),
            ], 422);
        }

        return response()->json([
            'message' => 'Producto eliminado correctamente',
        ]);
    }

    public function restore(int $id): JsonResponse
    {
        $producto = Producto::onlyTrashed()->findOrFail($id);

        $this->authorize('restore', $producto);

        $producto = $this->productoService->restore($id);

        return response()->json([
            'message' => 'Producto restaurado correctamente',
            'data' => new ProductoResource($producto),
        ]);
    }

    public function changeStatus(Producto $producto): JsonResponse
    {
        $this->authorize('activate', $producto);

        $producto = $this->productoService->toggleStatus($producto);

        return response()->json([
            'message' => 'Estado actualizado',
            'data' => new ProductoResource($producto),
        ]);
    }
}
