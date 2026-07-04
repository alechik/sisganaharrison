<?php

namespace App\Http\Controllers\Api\TiposEventosSanitarios;

use App\Http\Controllers\Controller;
use App\Http\Requests\TiposEventosSanitarios\StoreTipoEventoSanitarioRequest;
use App\Http\Requests\TiposEventosSanitarios\UpdateTipoEventoSanitarioRequest;
use App\Http\Resources\TiposEventosSanitarios\TipoEventoSanitarioResource;
use App\Models\TipoEventoSanitario;
use App\Services\TiposEventosSanitarios\TipoEventoSanitarioService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class TipoEventoSanitarioController extends Controller
{
    public function __construct(
        private readonly TipoEventoSanitarioService $tipoEventoSanitarioService
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', TipoEventoSanitario::class);

        $tipos = $this->tipoEventoSanitarioService->paginate($request->all());

        return TipoEventoSanitarioResource::collection($tipos);
    }

    public function deleted(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', TipoEventoSanitario::class);

        $tipos = $this->tipoEventoSanitarioService->paginateDeleted($request->all());

        return TipoEventoSanitarioResource::collection($tipos);
    }

    public function show(TipoEventoSanitario $tipo_evento_sanitario): TipoEventoSanitarioResource
    {
        $this->authorize('view', $tipo_evento_sanitario);

        return new TipoEventoSanitarioResource($tipo_evento_sanitario);
    }

    public function store(StoreTipoEventoSanitarioRequest $request): JsonResponse
    {
        $this->authorize('create', TipoEventoSanitario::class);

        $tipo = $this->tipoEventoSanitarioService->create($request->validated());

        return response()->json([
            'message' => 'Tipo de evento sanitario creado correctamente',
            'data' => new TipoEventoSanitarioResource($tipo),
        ], 201);
    }

    public function update(UpdateTipoEventoSanitarioRequest $request, TipoEventoSanitario $tipo_evento_sanitario): JsonResponse
    {
        $this->authorize('update', $tipo_evento_sanitario);

        $tipo = $this->tipoEventoSanitarioService->update($tipo_evento_sanitario, $request->validated());

        return response()->json([
            'message' => 'Tipo de evento sanitario actualizado correctamente',
            'data' => new TipoEventoSanitarioResource($tipo),
        ]);
    }

    public function destroy(TipoEventoSanitario $tipo_evento_sanitario): JsonResponse
    {
        $this->authorize('delete', $tipo_evento_sanitario);

        $this->tipoEventoSanitarioService->delete($tipo_evento_sanitario);

        return response()->json([
            'message' => 'Tipo de evento sanitario eliminado correctamente',
        ]);
    }

    public function restore(int $id): JsonResponse
    {
        $tipo = TipoEventoSanitario::onlyTrashed()->findOrFail($id);

        $this->authorize('restore', $tipo);

        $tipo = $this->tipoEventoSanitarioService->restore($id);

        return response()->json([
            'message' => 'Tipo de evento sanitario restaurado correctamente',
            'data' => new TipoEventoSanitarioResource($tipo),
        ]);
    }

    public function changeStatus(TipoEventoSanitario $tipo_evento_sanitario): JsonResponse
    {
        $this->authorize('activate', $tipo_evento_sanitario);

        $tipo = $this->tipoEventoSanitarioService->toggleStatus($tipo_evento_sanitario);

        return response()->json([
            'message' => 'Estado actualizado',
            'data' => new TipoEventoSanitarioResource($tipo),
        ]);
    }
}
