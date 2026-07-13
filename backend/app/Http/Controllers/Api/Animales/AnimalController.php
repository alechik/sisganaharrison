<?php

namespace App\Http\Controllers\Api\Animales;

use App\Http\Controllers\Controller;
use App\Http\Requests\Animales\StoreAnimalRequest;
use App\Http\Requests\Animales\UpdateAnimalRequest;
use App\Http\Resources\Animales\AnimalResource;
use App\Models\Animal;
use App\Services\Animales\AnimalService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\ValidationException;

class AnimalController extends Controller
{
    public function __construct(
        private readonly AnimalService $animalService
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Animal::class);

        $animales = $this->animalService->paginate($request->all());

        return AnimalResource::collection($animales);
    }

    public function deleted(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Animal::class);

        $animales = $this->animalService->paginateDeleted($request->all());

        return AnimalResource::collection($animales);
    }

    public function show(Animal $animal): AnimalResource
    {
        $this->authorize('view', $animal);

        $animal->load([
            'raza:id,nombre',
            'categoria:id,nombre',
            'estadoProductivo:id,nombre',
            'lote:id,nombre',
            'madre:id,nombre,codigo',
            'padre:id,nombre,codigo',
        ]);

        return new AnimalResource($animal);
    }

    public function store(StoreAnimalRequest $request): JsonResponse
    {
        $this->authorize('create', Animal::class);

        try {
            $animal = $this->animalService->create($request->validated());
        } catch (ValidationException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
                'errors' => $exception->errors(),
            ], 422);
        }

        return response()->json([
            'message' => 'Animal creado correctamente',
            'data' => new AnimalResource($animal),
        ], 201);
    }

    public function update(UpdateAnimalRequest $request, Animal $animal): JsonResponse
    {
        $this->authorize('update', $animal);

        try {
            $animal = $this->animalService->update($animal, $request->validated());
        } catch (ValidationException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
                'errors' => $exception->errors(),
            ], 422);
        }

        return response()->json([
            'message' => 'Animal actualizado correctamente',
            'data' => new AnimalResource($animal),
        ]);
    }

    public function destroy(Animal $animal): JsonResponse
    {
        $this->authorize('delete', $animal);

        $this->animalService->delete($animal);

        return response()->json([
            'message' => 'Animal eliminado correctamente',
        ]);
    }

    public function restore(int $id): JsonResponse
    {
        $animal = Animal::onlyTrashed()->findOrFail($id);

        $this->authorize('restore', $animal);

        $animal = $this->animalService->restore($id);

        return response()->json([
            'message' => 'Animal restaurado correctamente',
            'data' => new AnimalResource($animal),
        ]);
    }

    public function changeStatus(Animal $animal): JsonResponse
    {
        $this->authorize('activate', $animal);

        $animal = $this->animalService->toggleStatus($animal);

        return response()->json([
            'message' => 'Estado actualizado',
            'data' => new AnimalResource($animal),
        ]);
    }
}
