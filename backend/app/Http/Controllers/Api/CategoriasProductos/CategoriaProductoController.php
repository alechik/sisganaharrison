<?php

namespace App\Http\Controllers\Api\CategoriasProductos;

use App\Http\Controllers\Controller;
use App\Http\Requests\CategoriasProductos\StoreCategoriaProductoRequest;
use App\Http\Requests\CategoriasProductos\UpdateCategoriaProductoRequest;
use App\Http\Resources\CategoriasProductos\CategoriaProductoResource;
use App\Models\CategoriaProducto;
use App\Services\CategoriasProductos\CategoriaProductoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\ValidationException;

class CategoriaProductoController extends Controller
{
    public function __construct(private readonly CategoriaProductoService $service) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', CategoriaProducto::class);

        return CategoriaProductoResource::collection($this->service->paginate($request->all()));
    }

    public function deleted(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', CategoriaProducto::class);

        return CategoriaProductoResource::collection($this->service->paginateDeleted($request->all()));
    }

    public function show(CategoriaProducto $categoriaProducto): CategoriaProductoResource
    {
        $this->authorize('view', $categoriaProducto);

        return new CategoriaProductoResource($categoriaProducto);
    }

    public function store(StoreCategoriaProductoRequest $request): JsonResponse
    {
        $this->authorize('create', CategoriaProducto::class);
        $item = $this->service->create($request->validated());

        return response()->json(['message' => 'Categoría creada correctamente', 'data' => new CategoriaProductoResource($item)], 201);
    }

    public function update(UpdateCategoriaProductoRequest $request, CategoriaProducto $categoriaProducto): JsonResponse
    {
        $this->authorize('update', $categoriaProducto);
        $item = $this->service->update($categoriaProducto, $request->validated());

        return response()->json(['message' => 'Categoría actualizada correctamente', 'data' => new CategoriaProductoResource($item)]);
    }

    public function destroy(CategoriaProducto $categoriaProducto): JsonResponse
    {
        $this->authorize('delete', $categoriaProducto);
        try {
            $this->service->delete($categoriaProducto);
        } catch (ValidationException $exception) {
            return response()->json(['message' => $exception->getMessage(), 'errors' => $exception->errors()], 422);
        }

        return response()->json(['message' => 'Categoría eliminada correctamente']);
    }

    public function restore(int $id): JsonResponse
    {
        $item = CategoriaProducto::onlyTrashed()->findOrFail($id);
        $this->authorize('restore', $item);
        $item = $this->service->restore($id);

        return response()->json(['message' => 'Categoría restaurada correctamente', 'data' => new CategoriaProductoResource($item)]);
    }

    public function changeStatus(CategoriaProducto $categoriaProducto): JsonResponse
    {
        $this->authorize('activate', $categoriaProducto);
        $item = $this->service->toggleStatus($categoriaProducto);

        return response()->json(['message' => 'Estado actualizado', 'data' => new CategoriaProductoResource($item)]);
    }
}
