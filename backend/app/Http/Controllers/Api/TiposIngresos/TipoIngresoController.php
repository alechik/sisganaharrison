<?php

namespace App\Http\Controllers\Api\TiposIngresos;

use App\Http\Controllers\Controller;
use App\Http\Requests\TiposIngresos\StoreTipoIngresoRequest;
use App\Http\Requests\TiposIngresos\UpdateTipoIngresoRequest;
use App\Http\Resources\TiposIngresos\TipoIngresoResource;
use App\Models\TipoIngreso;
use App\Services\TiposIngresos\TipoIngresoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\ValidationException;

class TipoIngresoController extends Controller
{
    public function __construct(
        private readonly TipoIngresoService $tipoIngresoService
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', TipoIngreso::class);

        $tipos = $this->tipoIngresoService->paginate($request->all());

        return TipoIngresoResource::collection($tipos);
    }

    public function deleted(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', TipoIngreso::class);

        $tipos = $this->tipoIngresoService->paginateDeleted($request->all());

        return TipoIngresoResource::collection($tipos);
    }

    public function show(TipoIngreso $tipoIngreso): TipoIngresoResource
    {
        $this->authorize('view', $tipoIngreso);

        return new TipoIngresoResource($tipoIngreso);
    }

    public function store(StoreTipoIngresoRequest $request): JsonResponse
    {
        $this->authorize('create', TipoIngreso::class);

        $tipo = $this->tipoIngresoService->create($request->validated());

        return response()->json([
            'message' => 'Tipo de ingreso creado correctamente',
            'data' => new TipoIngresoResource($tipo),
        ], 201);
    }

    public function update(UpdateTipoIngresoRequest $request, TipoIngreso $tipoIngreso): JsonResponse
    {
        $this->authorize('update', $tipoIngreso);

        $tipo = $this->tipoIngresoService->update($tipoIngreso, $request->validated());

        return response()->json([
            'message' => 'Tipo de ingreso actualizado correctamente',
            'data' => new TipoIngresoResource($tipo),
        ]);
    }

    public function destroy(TipoIngreso $tipoIngreso): JsonResponse
    {
        $this->authorize('delete', $tipoIngreso);

        try {
            $this->tipoIngresoService->delete($tipoIngreso);
        } catch (ValidationException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
                'errors' => $exception->errors(),
            ], 422);
        }

        return response()->json([
            'message' => 'Tipo de ingreso eliminado correctamente',
        ]);
    }

    public function restore(int $id): JsonResponse
    {
        $tipo = TipoIngreso::onlyTrashed()->findOrFail($id);

        $this->authorize('restore', $tipo);

        $tipo = $this->tipoIngresoService->restore($id);

        return response()->json([
            'message' => 'Tipo de ingreso restaurado correctamente',
            'data' => new TipoIngresoResource($tipo),
        ]);
    }

    public function changeStatus(TipoIngreso $tipoIngreso): JsonResponse
    {
        $this->authorize('activate', $tipoIngreso);

        $tipo = $this->tipoIngresoService->toggleStatus($tipoIngreso);

        return response()->json([
            'message' => 'Estado actualizado',
            'data' => new TipoIngresoResource($tipo),
        ]);
    }
}
