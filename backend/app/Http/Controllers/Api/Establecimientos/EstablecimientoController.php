<?php

namespace App\Http\Controllers\Api\Establecimientos;

use App\Http\Controllers\Controller;
use App\Http\Requests\Establecimientos\StoreEstablecimientoRequest;
use App\Http\Requests\Establecimientos\UpdateEstablecimientoRequest;
use App\Http\Resources\Establecimientos\EstablecimientoResource;
use App\Models\Establecimiento;
use App\Services\Establecimientos\EstablecimientoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\ValidationException;

class EstablecimientoController extends Controller
{
    public function __construct(
        private readonly EstablecimientoService $establecimientoService
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Establecimiento::class);

        $establecimientos = $this->establecimientoService->paginate($request->all());

        return EstablecimientoResource::collection($establecimientos);
    }

    public function deleted(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Establecimiento::class);

        $establecimientos = $this->establecimientoService->paginateDeleted($request->all());

        return EstablecimientoResource::collection($establecimientos);
    }

    public function show(Establecimiento $establecimiento): EstablecimientoResource
    {
        $this->authorize('view', $establecimiento);

        return new EstablecimientoResource($establecimiento);
    }

    public function store(StoreEstablecimientoRequest $request): JsonResponse
    {
        $this->authorize('create', Establecimiento::class);

        $establecimiento = $this->establecimientoService->create($request->validated());

        return response()->json([
            'message' => 'Establecimiento creado correctamente',
            'data' => new EstablecimientoResource($establecimiento),
        ], 201);
    }

    public function update(UpdateEstablecimientoRequest $request, Establecimiento $establecimiento): JsonResponse
    {
        $this->authorize('update', $establecimiento);

        $establecimiento = $this->establecimientoService->update($establecimiento, $request->validated());

        return response()->json([
            'message' => 'Establecimiento actualizado correctamente',
            'data' => new EstablecimientoResource($establecimiento),
        ]);
    }

    public function destroy(Establecimiento $establecimiento): JsonResponse
    {
        $this->authorize('delete', $establecimiento);

        try {
            $this->establecimientoService->delete($establecimiento);
        } catch (ValidationException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
                'errors' => $exception->errors(),
            ], 422);
        }

        return response()->json([
            'message' => 'Establecimiento eliminado correctamente',
        ]);
    }

    public function restore(int $id): JsonResponse
    {
        $establecimiento = Establecimiento::onlyTrashed()->findOrFail($id);

        $this->authorize('restore', $establecimiento);

        $establecimiento = $this->establecimientoService->restore($id);

        return response()->json([
            'message' => 'Establecimiento restaurado correctamente',
            'data' => new EstablecimientoResource($establecimiento),
        ]);
    }

    public function changeStatus(Establecimiento $establecimiento): JsonResponse
    {
        $this->authorize('activate', $establecimiento);

        $establecimiento = $this->establecimientoService->toggleStatus($establecimiento);

        return response()->json([
            'message' => 'Estado actualizado',
            'data' => new EstablecimientoResource($establecimiento),
        ]);
    }
}
