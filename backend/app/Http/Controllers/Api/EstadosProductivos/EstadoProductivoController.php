<?php

namespace App\Http\Controllers\Api\EstadosProductivos;

use App\Http\Controllers\Controller;
use App\Http\Requests\EstadosProductivos\StoreEstadoProductivoRequest;
use App\Http\Requests\EstadosProductivos\UpdateEstadoProductivoRequest;
use App\Http\Resources\EstadosProductivos\EstadoProductivoResource;
use App\Models\EstadoProductivo;
use App\Services\EstadosProductivos\EstadoProductivoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class EstadoProductivoController extends Controller
{
    public function __construct(
        private readonly EstadoProductivoService $estadoProductivoService
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', EstadoProductivo::class);

        $estados = $this->estadoProductivoService->paginate($request->all());

        return EstadoProductivoResource::collection($estados);
    }

    public function deleted(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', EstadoProductivo::class);

        $estados = $this->estadoProductivoService->paginateDeleted($request->all());

        return EstadoProductivoResource::collection($estados);
    }

    public function show(EstadoProductivo $estado_productivo): EstadoProductivoResource
    {
        $this->authorize('view', $estado_productivo);

        return new EstadoProductivoResource($estado_productivo);
    }

    public function store(StoreEstadoProductivoRequest $request): JsonResponse
    {
        $this->authorize('create', EstadoProductivo::class);

        $estado = $this->estadoProductivoService->create($request->validated());

        return response()->json([
            'message' => 'Estado productivo creado correctamente',
            'data' => new EstadoProductivoResource($estado),
        ], 201);
    }

    public function update(UpdateEstadoProductivoRequest $request, EstadoProductivo $estado_productivo): JsonResponse
    {
        $this->authorize('update', $estado_productivo);

        $estado = $this->estadoProductivoService->update($estado_productivo, $request->validated());

        return response()->json([
            'message' => 'Estado productivo actualizado correctamente',
            'data' => new EstadoProductivoResource($estado),
        ]);
    }

    public function destroy(EstadoProductivo $estado_productivo): JsonResponse
    {
        $this->authorize('delete', $estado_productivo);

        $this->estadoProductivoService->delete($estado_productivo);

        return response()->json([
            'message' => 'Estado productivo eliminado correctamente',
        ]);
    }

    public function restore(int $id): JsonResponse
    {
        $estado = EstadoProductivo::onlyTrashed()->findOrFail($id);

        $this->authorize('restore', $estado);

        $estado = $this->estadoProductivoService->restore($id);

        return response()->json([
            'message' => 'Estado productivo restaurado correctamente',
            'data' => new EstadoProductivoResource($estado),
        ]);
    }

    public function changeStatus(EstadoProductivo $estado_productivo): JsonResponse
    {
        $this->authorize('activate', $estado_productivo);

        $estado = $this->estadoProductivoService->toggleStatus($estado_productivo);

        return response()->json([
            'message' => 'Estado actualizado',
            'data' => new EstadoProductivoResource($estado),
        ]);
    }
}
