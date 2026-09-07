<?php

namespace App\Http\Controllers\Api\SociosDeNegocio;

use App\Http\Controllers\Controller;
use App\Http\Requests\SociosDeNegocio\StoreTipoPersonaRequest;
use App\Http\Requests\SociosDeNegocio\UpdateTipoPersonaRequest;
use App\Http\Resources\SociosDeNegocio\TipoPersonaResource;
use App\Models\TipoPersona;
use App\Services\SociosDeNegocio\TipoPersonaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\ValidationException;

class TipoPersonaController extends Controller
{
    public function __construct(
        private readonly TipoPersonaService $tipoPersonaService
    ) {}

    public function index(Request $request): AnonymousResourceCollection|\Illuminate\Http\Resources\Json\JsonResource
    {
        $this->authorize('viewAny', TipoPersona::class);

        if ($request->boolean('all')) {
            return TipoPersonaResource::collection($this->tipoPersonaService->listAll());
        }

        $tipos = $this->tipoPersonaService->paginate($request->all());

        return TipoPersonaResource::collection($tipos);
    }

    public function show(TipoPersona $tipoPersona): TipoPersonaResource
    {
        $this->authorize('view', $tipoPersona);

        return new TipoPersonaResource($tipoPersona);
    }

    public function store(StoreTipoPersonaRequest $request): JsonResponse
    {
        $this->authorize('create', TipoPersona::class);

        $tipo = $this->tipoPersonaService->create($request->validated());

        return response()->json([
            'message' => 'Tipo de persona creado correctamente',
            'data' => new TipoPersonaResource($tipo),
        ], 201);
    }

    public function update(UpdateTipoPersonaRequest $request, TipoPersona $tipoPersona): JsonResponse
    {
        $this->authorize('update', $tipoPersona);

        try {
            $tipo = $this->tipoPersonaService->update($tipoPersona, $request->validated());
        } catch (ValidationException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
                'errors' => $exception->errors(),
            ], 422);
        }

        return response()->json([
            'message' => 'Tipo de persona actualizado correctamente',
            'data' => new TipoPersonaResource($tipo),
        ]);
    }

    public function destroy(TipoPersona $tipoPersona): JsonResponse
    {
        $this->authorize('delete', $tipoPersona);

        try {
            $this->tipoPersonaService->delete($tipoPersona);
        } catch (ValidationException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
                'errors' => $exception->errors(),
            ], 422);
        }

        return response()->json([
            'message' => 'Tipo de persona eliminado correctamente',
        ]);
    }
}
