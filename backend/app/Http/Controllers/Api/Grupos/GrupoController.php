<?php

namespace App\Http\Controllers\Api\Grupos;

use App\Http\Controllers\Controller;
use App\Http\Requests\Grupos\StoreGrupoRequest;
use App\Http\Requests\Grupos\UpdateGrupoRequest;
use App\Http\Resources\Grupos\GrupoResource;
use App\Models\Grupo;
use App\Services\Grupos\GrupoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\ValidationException;

class GrupoController extends Controller
{
    public function __construct(
        private readonly GrupoService $grupoService
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Grupo::class);

        return GrupoResource::collection($this->grupoService->paginate($request->all()));
    }

    public function deleted(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Grupo::class);

        return GrupoResource::collection($this->grupoService->paginateDeleted($request->all()));
    }

    public function show(Grupo $grupo): GrupoResource
    {
        $this->authorize('view', $grupo);

        $grupo->load('lote:id,nombre,codigo');

        return new GrupoResource($grupo);
    }

    public function store(StoreGrupoRequest $request): JsonResponse
    {
        $this->authorize('create', Grupo::class);

        $grupo = $this->grupoService->create($request->validated());

        return response()->json([
            'message' => 'Grupo creado correctamente',
            'data' => new GrupoResource($grupo),
        ], 201);
    }

    public function update(UpdateGrupoRequest $request, Grupo $grupo): JsonResponse
    {
        $this->authorize('update', $grupo);

        $grupo = $this->grupoService->update($grupo, $request->validated());

        return response()->json([
            'message' => 'Grupo actualizado correctamente',
            'data' => new GrupoResource($grupo),
        ]);
    }

    public function destroy(Grupo $grupo): JsonResponse
    {
        $this->authorize('delete', $grupo);

        try {
            $this->grupoService->delete($grupo);
        } catch (ValidationException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
                'errors' => $exception->errors(),
            ], 422);
        }

        return response()->json([
            'message' => 'Grupo eliminado correctamente',
        ]);
    }

    public function restore(int $id): JsonResponse
    {
        $grupo = Grupo::onlyTrashed()->findOrFail($id);

        $this->authorize('restore', $grupo);

        $grupo = $this->grupoService->restore($id);

        return response()->json([
            'message' => 'Grupo restaurado correctamente',
            'data' => new GrupoResource($grupo),
        ]);
    }

    public function changeStatus(Grupo $grupo): JsonResponse
    {
        $this->authorize('activate', $grupo);

        $grupo = $this->grupoService->toggleStatus($grupo);

        return response()->json([
            'message' => 'Estado actualizado',
            'data' => new GrupoResource($grupo),
        ]);
    }
}
