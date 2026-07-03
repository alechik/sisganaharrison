<?php

namespace App\Http\Controllers\Api\Vacunas;

use App\Http\Controllers\Controller;
use App\Http\Requests\Vacunas\StoreVacunaRequest;
use App\Http\Requests\Vacunas\UpdateVacunaRequest;
use App\Http\Resources\Vacunas\VacunaResource;
use App\Models\Vacuna;
use App\Services\Vacunas\VacunaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class VacunaController extends Controller
{
    public function __construct(
        private readonly VacunaService $vacunaService
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Vacuna::class);

        $vacunas = $this->vacunaService->paginate($request->all());

        return VacunaResource::collection($vacunas);
    }

    public function deleted(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Vacuna::class);

        $vacunas = $this->vacunaService->paginateDeleted($request->all());

        return VacunaResource::collection($vacunas);
    }

    public function show(Vacuna $vacuna): VacunaResource
    {
        $this->authorize('view', $vacuna);

        return new VacunaResource($vacuna);
    }

    public function store(StoreVacunaRequest $request): JsonResponse
    {
        $this->authorize('create', Vacuna::class);

        $vacuna = $this->vacunaService->create($request->validated());

        return response()->json([
            'message' => 'Vacuna creada correctamente',
            'data' => new VacunaResource($vacuna),
        ], 201);
    }

    public function update(UpdateVacunaRequest $request, Vacuna $vacuna): JsonResponse
    {
        $this->authorize('update', $vacuna);

        $vacuna = $this->vacunaService->update($vacuna, $request->validated());

        return response()->json([
            'message' => 'Vacuna actualizada correctamente',
            'data' => new VacunaResource($vacuna),
        ]);
    }

    public function destroy(Vacuna $vacuna): JsonResponse
    {
        $this->authorize('delete', $vacuna);

        $this->vacunaService->delete($vacuna);

        return response()->json([
            'message' => 'Vacuna eliminada correctamente',
        ]);
    }

    public function restore(int $id): JsonResponse
    {
        $vacuna = Vacuna::onlyTrashed()->findOrFail($id);

        $this->authorize('restore', $vacuna);

        $vacuna = $this->vacunaService->restore($id);

        return response()->json([
            'message' => 'Vacuna restaurada correctamente',
            'data' => new VacunaResource($vacuna),
        ]);
    }

    public function changeStatus(Vacuna $vacuna): JsonResponse
    {
        $this->authorize('activate', $vacuna);

        $vacuna = $this->vacunaService->toggleStatus($vacuna);

        return response()->json([
            'message' => 'Estado actualizado',
            'data' => new VacunaResource($vacuna),
        ]);
    }
}
