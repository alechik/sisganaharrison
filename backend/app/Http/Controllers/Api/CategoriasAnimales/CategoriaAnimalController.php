<?php

namespace App\Http\Controllers\Api\CategoriasAnimales;

use App\Http\Controllers\Controller;
use App\Http\Requests\CategoriasAnimales\StoreCategoriaAnimalRequest;
use App\Http\Requests\CategoriasAnimales\UpdateCategoriaAnimalRequest;
use App\Http\Resources\CategoriasAnimales\CategoriaAnimalResource;
use App\Models\CategoriaAnimal;
use App\Services\CategoriasAnimales\CategoriaAnimalService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CategoriaAnimalController extends Controller
{
    public function __construct(
        private readonly CategoriaAnimalService $categoriaAnimalService
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', CategoriaAnimal::class);

        $categorias = $this->categoriaAnimalService->paginate($request->all());

        return CategoriaAnimalResource::collection($categorias);
    }

    public function deleted(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', CategoriaAnimal::class);

        $categorias = $this->categoriaAnimalService->paginateDeleted($request->all());

        return CategoriaAnimalResource::collection($categorias);
    }

    public function show(CategoriaAnimal $categoria): CategoriaAnimalResource
    {
        $this->authorize('view', $categoria);

        return new CategoriaAnimalResource($categoria);
    }

    public function store(StoreCategoriaAnimalRequest $request): JsonResponse
    {
        $this->authorize('create', CategoriaAnimal::class);

        $categoria = $this->categoriaAnimalService->create($request->validated());

        return response()->json([
            'message' => 'Categoría creada correctamente',
            'data' => new CategoriaAnimalResource($categoria),
        ], 201);
    }

    public function update(UpdateCategoriaAnimalRequest $request, CategoriaAnimal $categoria): JsonResponse
    {
        $this->authorize('update', $categoria);

        $categoria = $this->categoriaAnimalService->update($categoria, $request->validated());

        return response()->json([
            'message' => 'Categoría actualizada correctamente',
            'data' => new CategoriaAnimalResource($categoria),
        ]);
    }

    public function destroy(CategoriaAnimal $categoria): JsonResponse
    {
        $this->authorize('delete', $categoria);

        $this->categoriaAnimalService->delete($categoria);

        return response()->json([
            'message' => 'Categoría eliminada correctamente',
        ]);
    }

    public function restore(int $id): JsonResponse
    {
        $categoria = CategoriaAnimal::onlyTrashed()->findOrFail($id);

        $this->authorize('restore', $categoria);

        $categoria = $this->categoriaAnimalService->restore($id);

        return response()->json([
            'message' => 'Categoría restaurada correctamente',
            'data' => new CategoriaAnimalResource($categoria),
        ]);
    }

    public function changeStatus(CategoriaAnimal $categoria): JsonResponse
    {
        $this->authorize('activate', $categoria);

        $categoria = $this->categoriaAnimalService->toggleStatus($categoria);

        return response()->json([
            'message' => 'Estado actualizado',
            'data' => new CategoriaAnimalResource($categoria),
        ]);
    }
}
