<?php

namespace App\Http\Controllers\Api\TiposSalidas;

use App\Http\Controllers\Controller;
use App\Http\Requests\TiposSalidas\StoreTipoSalidaRequest;
use App\Http\Requests\TiposSalidas\UpdateTipoSalidaRequest;
use App\Http\Resources\TiposSalidas\TipoSalidaResource;
use App\Models\TipoSalida;
use App\Services\TiposSalidas\TipoSalidaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\ValidationException;

class TipoSalidaController extends Controller
{
    public function __construct(
        private readonly TipoSalidaService $tipoSalidaService
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', TipoSalida::class);

        $tipos = $this->tipoSalidaService->paginate($request->all());

        return TipoSalidaResource::collection($tipos);
    }

    public function deleted(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', TipoSalida::class);

        $tipos = $this->tipoSalidaService->paginateDeleted($request->all());

        return TipoSalidaResource::collection($tipos);
    }

    public function show(TipoSalida $tipo_salida): TipoSalidaResource
    {
        $this->authorize('view', $tipo_salida);

        return new TipoSalidaResource($tipo_salida);
    }

    public function store(StoreTipoSalidaRequest $request): JsonResponse
    {
        $this->authorize('create', TipoSalida::class);

        $tipo = $this->tipoSalidaService->create($request->validated());

        return response()->json([
            'message' => 'Tipo de salida creado correctamente',
            'data' => new TipoSalidaResource($tipo),
        ], 201);
    }

    public function update(UpdateTipoSalidaRequest $request, TipoSalida $tipo_salida): JsonResponse
    {
        $this->authorize('update', $tipo_salida);

        $tipo = $this->tipoSalidaService->update($tipo_salida, $request->validated());

        return response()->json([
            'message' => 'Tipo de salida actualizado correctamente',
            'data' => new TipoSalidaResource($tipo),
        ]);
    }

    public function destroy(TipoSalida $tipo_salida): JsonResponse
    {
        $this->authorize('delete', $tipo_salida);

        try {
            $this->tipoSalidaService->delete($tipo_salida);
        } catch (ValidationException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
                'errors' => $exception->errors(),
            ], 422);
        }

        return response()->json([
            'message' => 'Tipo de salida eliminado correctamente',
        ]);
    }

    public function restore(int $id): JsonResponse
    {
        $tipo = TipoSalida::onlyTrashed()->findOrFail($id);

        $this->authorize('restore', $tipo);

        $tipo = $this->tipoSalidaService->restore($id);

        return response()->json([
            'message' => 'Tipo de salida restaurado correctamente',
            'data' => new TipoSalidaResource($tipo),
        ]);
    }
}
