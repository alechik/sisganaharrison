<?php

namespace App\Http\Controllers\Api\Potreros;

use App\Http\Controllers\Controller;
use App\Http\Requests\Potreros\StorePotreroRequest;
use App\Http\Requests\Potreros\UpdatePotreroRequest;
use App\Http\Resources\Potreros\PotreroResource;
use App\Models\Potrero;
use App\Services\Potreros\PotreroService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\ValidationException;

class PotreroController extends Controller
{
    public function __construct(
        private readonly PotreroService $potreroService
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Potrero::class);

        $potreros = $this->potreroService->paginate($request->all());

        return PotreroResource::collection($potreros);
    }

    public function deleted(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Potrero::class);

        $potreros = $this->potreroService->paginateDeleted($request->all());

        return PotreroResource::collection($potreros);
    }

    public function show(Potrero $potrero): PotreroResource
    {
        $this->authorize('view', $potrero);

        $potrero->load('establecimiento:id,nombre');

        return new PotreroResource($potrero);
    }

    public function store(StorePotreroRequest $request): JsonResponse
    {
        $this->authorize('create', Potrero::class);

        $potrero = $this->potreroService->create($request->validated());

        return response()->json([
            'message' => 'Potrero creado correctamente',
            'data' => new PotreroResource($potrero),
        ], 201);
    }

    public function update(UpdatePotreroRequest $request, Potrero $potrero): JsonResponse
    {
        $this->authorize('update', $potrero);

        $potrero = $this->potreroService->update($potrero, $request->validated());

        return response()->json([
            'message' => 'Potrero actualizado correctamente',
            'data' => new PotreroResource($potrero),
        ]);
    }

    public function destroy(Potrero $potrero): JsonResponse
    {
        $this->authorize('delete', $potrero);

        try {
            $this->potreroService->delete($potrero);
        } catch (ValidationException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
                'errors' => $exception->errors(),
            ], 422);
        }

        return response()->json([
            'message' => 'Potrero eliminado correctamente',
        ]);
    }

    public function restore(int $id): JsonResponse
    {
        $potrero = Potrero::onlyTrashed()->findOrFail($id);

        $this->authorize('restore', $potrero);

        $potrero = $this->potreroService->restore($id);

        return response()->json([
            'message' => 'Potrero restaurado correctamente',
            'data' => new PotreroResource($potrero),
        ]);
    }

    public function changeStatus(Potrero $potrero): JsonResponse
    {
        $this->authorize('activate', $potrero);

        $potrero = $this->potreroService->toggleStatus($potrero);

        return response()->json([
            'message' => 'Estado actualizado',
            'data' => new PotreroResource($potrero),
        ]);
    }
}
