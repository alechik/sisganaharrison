<?php

namespace App\Http\Controllers\Api\SubcategoriasProductos;

use App\Http\Controllers\Controller;
use App\Http\Requests\SubcategoriasProductos\StoreSubcategoriaProductoRequest;
use App\Http\Requests\SubcategoriasProductos\UpdateSubcategoriaProductoRequest;
use App\Http\Resources\SubcategoriasProductos\SubcategoriaProductoResource;
use App\Models\SubcategoriaProducto;
use App\Services\SubcategoriasProductos\SubcategoriaProductoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\ValidationException;

class SubcategoriaProductoController extends Controller
{
    public function __construct(private readonly SubcategoriaProductoService $service) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', SubcategoriaProducto::class);

        return SubcategoriaProductoResource::collection($this->service->paginate($request->all()));
    }

    public function deleted(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', SubcategoriaProducto::class);

        return SubcategoriaProductoResource::collection($this->service->paginateDeleted($request->all()));
    }

    public function show(SubcategoriaProducto $subcategoriaProducto): SubcategoriaProductoResource
    {
        $this->authorize('view', $subcategoriaProducto);
        $subcategoriaProducto->load('categoria:id,nombre');

        return new SubcategoriaProductoResource($subcategoriaProducto);
    }

    public function store(StoreSubcategoriaProductoRequest $request): JsonResponse
    {
        $this->authorize('create', SubcategoriaProducto::class);
        $item = $this->service->create($request->validated());

        return response()->json(['message' => 'Subcategoría creada correctamente', 'data' => new SubcategoriaProductoResource($item)], 201);
    }

    public function update(UpdateSubcategoriaProductoRequest $request, SubcategoriaProducto $subcategoriaProducto): JsonResponse
    {
        $this->authorize('update', $subcategoriaProducto);
        $item = $this->service->update($subcategoriaProducto, $request->validated());

        return response()->json(['message' => 'Subcategoría actualizada correctamente', 'data' => new SubcategoriaProductoResource($item)]);
    }

    public function destroy(SubcategoriaProducto $subcategoriaProducto): JsonResponse
    {
        $this->authorize('delete', $subcategoriaProducto);
        try {
            $this->service->delete($subcategoriaProducto);
        } catch (ValidationException $exception) {
            return response()->json(['message' => $exception->getMessage(), 'errors' => $exception->errors()], 422);
        }

        return response()->json(['message' => 'Subcategoría eliminada correctamente']);
    }

    public function restore(int $id): JsonResponse
    {
        $item = SubcategoriaProducto::onlyTrashed()->findOrFail($id);
        $this->authorize('restore', $item);
        $item = $this->service->restore($id);

        return response()->json(['message' => 'Subcategoría restaurada correctamente', 'data' => new SubcategoriaProductoResource($item)]);
    }

    public function changeStatus(SubcategoriaProducto $subcategoriaProducto): JsonResponse
    {
        $this->authorize('activate', $subcategoriaProducto);
        $item = $this->service->toggleStatus($subcategoriaProducto);

        return response()->json(['message' => 'Estado actualizado', 'data' => new SubcategoriaProductoResource($item)]);
    }
}
