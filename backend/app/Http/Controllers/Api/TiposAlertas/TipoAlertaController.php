<?php

namespace App\Http\Controllers\Api\TiposAlertas;

use App\Http\Controllers\Controller;
use App\Http\Requests\TiposAlertas\StoreTipoAlertaRequest;
use App\Http\Requests\TiposAlertas\UpdateTipoAlertaRequest;
use App\Http\Resources\TiposAlertas\TipoAlertaResource;
use App\Models\TipoAlerta;
use App\Services\TiposAlertas\TipoAlertaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class TipoAlertaController extends Controller
{
    public function __construct(
        private readonly TipoAlertaService $tipoAlertaService
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', TipoAlerta::class);

        $tipos = $this->tipoAlertaService->paginate($request->all());

        return TipoAlertaResource::collection($tipos);
    }

    public function deleted(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', TipoAlerta::class);

        $tipos = $this->tipoAlertaService->paginateDeleted($request->all());

        return TipoAlertaResource::collection($tipos);
    }

    public function show(TipoAlerta $tipo_alerta): TipoAlertaResource
    {
        $this->authorize('view', $tipo_alerta);

        return new TipoAlertaResource($tipo_alerta);
    }

    public function store(StoreTipoAlertaRequest $request): JsonResponse
    {
        $this->authorize('create', TipoAlerta::class);

        $tipo = $this->tipoAlertaService->create($request->validated());

        return response()->json([
            'message' => 'Tipo de alerta creado correctamente',
            'data' => new TipoAlertaResource($tipo),
        ], 201);
    }

    public function update(UpdateTipoAlertaRequest $request, TipoAlerta $tipo_alerta): JsonResponse
    {
        $this->authorize('update', $tipo_alerta);

        $tipo = $this->tipoAlertaService->update($tipo_alerta, $request->validated());

        return response()->json([
            'message' => 'Tipo de alerta actualizado correctamente',
            'data' => new TipoAlertaResource($tipo),
        ]);
    }

    public function destroy(TipoAlerta $tipo_alerta): JsonResponse
    {
        $this->authorize('delete', $tipo_alerta);

        $this->tipoAlertaService->delete($tipo_alerta);

        return response()->json([
            'message' => 'Tipo de alerta eliminado correctamente',
        ]);
    }

    public function restore(int $id): JsonResponse
    {
        $tipo = TipoAlerta::onlyTrashed()->findOrFail($id);

        $this->authorize('restore', $tipo);

        $tipo = $this->tipoAlertaService->restore($id);

        return response()->json([
            'message' => 'Tipo de alerta restaurado correctamente',
            'data' => new TipoAlertaResource($tipo),
        ]);
    }

    public function changeStatus(TipoAlerta $tipo_alerta): JsonResponse
    {
        $this->authorize('activate', $tipo_alerta);

        $tipo = $this->tipoAlertaService->toggleStatus($tipo_alerta);

        return response()->json([
            'message' => 'Estado actualizado',
            'data' => new TipoAlertaResource($tipo),
        ]);
    }
}
