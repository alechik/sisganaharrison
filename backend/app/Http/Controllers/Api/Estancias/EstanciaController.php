<?php

namespace App\Http\Controllers\Api\Estancias;

use App\Http\Controllers\Controller;
use App\Http\Requests\Estancias\StoreEstanciaRequest;
use App\Http\Requests\Estancias\UpdateEstanciaRequest;
use App\Http\Resources\Estancias\EstanciaResource;
use App\Models\Estancia;
use App\Services\Estancias\EstanciaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\ValidationException;

class EstanciaController extends Controller
{
    public function __construct(
        private readonly EstanciaService $estanciaService
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Estancia::class);

        $estancias = $this->estanciaService->paginate($request->all());

        return EstanciaResource::collection($estancias);
    }

    public function deleted(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Estancia::class);

        $estancias = $this->estanciaService->paginateDeleted($request->all());

        return EstanciaResource::collection($estancias);
    }

    public function show(Estancia $estancia): EstanciaResource
    {
        $this->authorize('view', $estancia);

        return new EstanciaResource($estancia);
    }

    public function store(StoreEstanciaRequest $request): JsonResponse
    {
        $this->authorize('create', Estancia::class);

        $estancia = $this->estanciaService->create($request->validated());

        return response()->json([
            'message' => 'Estancia creada correctamente',
            'data' => new EstanciaResource($estancia),
        ], 201);
    }

    public function update(UpdateEstanciaRequest $request, Estancia $estancia): JsonResponse
    {
        $this->authorize('update', $estancia);

        $estancia = $this->estanciaService->update($estancia, $request->validated());

        return response()->json([
            'message' => 'Estancia actualizada correctamente',
            'data' => new EstanciaResource($estancia),
        ]);
    }

    public function destroy(Estancia $estancia): JsonResponse
    {
        $this->authorize('delete', $estancia);

        try {
            $this->estanciaService->delete($estancia);
        } catch (ValidationException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
                'errors' => $exception->errors(),
            ], 422);
        }

        return response()->json([
            'message' => 'Estancia eliminada correctamente',
        ]);
    }

    public function restore(int $id): JsonResponse
    {
        $estancia = Estancia::onlyTrashed()->findOrFail($id);

        $this->authorize('restore', $estancia);

        $estancia = $this->estanciaService->restore($id);

        return response()->json([
            'message' => 'Estancia restaurada correctamente',
            'data' => new EstanciaResource($estancia),
        ]);
    }

    public function changeStatus(Estancia $estancia): JsonResponse
    {
        $this->authorize('activate', $estancia);

        $estancia = $this->estanciaService->toggleStatus($estancia);

        return response()->json([
            'message' => 'Estado actualizado',
            'data' => new EstanciaResource($estancia),
        ]);
    }
}
