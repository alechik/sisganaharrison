<?php

namespace App\Http\Controllers\Api\TiposMovimientos;

use App\Http\Controllers\Controller;
use App\Http\Requests\TiposMovimientos\StoreTipoMovimientoRequest;
use App\Http\Requests\TiposMovimientos\UpdateTipoMovimientoRequest;
use App\Http\Resources\TiposMovimientos\TipoMovimientoResource;
use App\Models\TipoMovimiento;
use App\Services\TiposMovimientos\TipoMovimientoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class TipoMovimientoController extends Controller
{
    public function __construct(
        private readonly TipoMovimientoService $tipoMovimientoService
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', TipoMovimiento::class);

        $tipos = $this->tipoMovimientoService->paginate($request->all());

        return TipoMovimientoResource::collection($tipos);
    }

    public function deleted(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', TipoMovimiento::class);

        $tipos = $this->tipoMovimientoService->paginateDeleted($request->all());

        return TipoMovimientoResource::collection($tipos);
    }

    public function show(TipoMovimiento $tipo_movimiento): TipoMovimientoResource
    {
        $this->authorize('view', $tipo_movimiento);

        return new TipoMovimientoResource($tipo_movimiento);
    }

    public function store(StoreTipoMovimientoRequest $request): JsonResponse
    {
        $this->authorize('create', TipoMovimiento::class);

        $tipo = $this->tipoMovimientoService->create($request->validated());

        return response()->json([
            'message' => 'Tipo de movimiento creado correctamente',
            'data' => new TipoMovimientoResource($tipo),
        ], 201);
    }

    public function update(UpdateTipoMovimientoRequest $request, TipoMovimiento $tipo_movimiento): JsonResponse
    {
        $this->authorize('update', $tipo_movimiento);

        $tipo = $this->tipoMovimientoService->update($tipo_movimiento, $request->validated());

        return response()->json([
            'message' => 'Tipo de movimiento actualizado correctamente',
            'data' => new TipoMovimientoResource($tipo),
        ]);
    }

    public function destroy(TipoMovimiento $tipo_movimiento): JsonResponse
    {
        $this->authorize('delete', $tipo_movimiento);

        $this->tipoMovimientoService->delete($tipo_movimiento);

        return response()->json([
            'message' => 'Tipo de movimiento eliminado correctamente',
        ]);
    }

    public function restore(int $id): JsonResponse
    {
        $tipo = TipoMovimiento::onlyTrashed()->findOrFail($id);

        $this->authorize('restore', $tipo);

        $tipo = $this->tipoMovimientoService->restore($id);

        return response()->json([
            'message' => 'Tipo de movimiento restaurado correctamente',
            'data' => new TipoMovimientoResource($tipo),
        ]);
    }

    public function changeStatus(TipoMovimiento $tipo_movimiento): JsonResponse
    {
        $this->authorize('activate', $tipo_movimiento);

        $tipo = $this->tipoMovimientoService->toggleStatus($tipo_movimiento);

        return response()->json([
            'message' => 'Estado actualizado',
            'data' => new TipoMovimientoResource($tipo),
        ]);
    }
}
