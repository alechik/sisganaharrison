<?php

namespace App\Http\Controllers\Api\Presentaciones;

use App\Http\Controllers\Controller;
use App\Http\Requests\Presentaciones\StorePresentacionRequest;
use App\Http\Requests\Presentaciones\UpdatePresentacionRequest;
use App\Http\Resources\Presentaciones\PresentacionResource;
use App\Models\Presentacion;
use App\Services\Presentaciones\PresentacionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\ValidationException;

class PresentacionController extends Controller
{
    public function __construct(
        private readonly PresentacionService $presentacionService
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Presentacion::class);

        return PresentacionResource::collection(
            $this->presentacionService->paginate($request->all())
        );
    }

    public function deleted(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Presentacion::class);

        return PresentacionResource::collection(
            $this->presentacionService->paginateDeleted($request->all())
        );
    }

    public function show(Presentacion $presentacion): PresentacionResource
    {
        $this->authorize('view', $presentacion);

        return new PresentacionResource($presentacion);
    }

    public function store(StorePresentacionRequest $request): JsonResponse
    {
        $this->authorize('create', Presentacion::class);

        $presentacion = $this->presentacionService->create($request->validated());

        return response()->json([
            'message' => 'Presentación creada correctamente',
            'data' => new PresentacionResource($presentacion),
        ], 201);
    }

    public function update(UpdatePresentacionRequest $request, Presentacion $presentacion): JsonResponse
    {
        $this->authorize('update', $presentacion);

        $presentacion = $this->presentacionService->update($presentacion, $request->validated());

        return response()->json([
            'message' => 'Presentación actualizada correctamente',
            'data' => new PresentacionResource($presentacion),
        ]);
    }

    public function destroy(Presentacion $presentacion): JsonResponse
    {
        $this->authorize('delete', $presentacion);

        try {
            $this->presentacionService->delete($presentacion);
        } catch (ValidationException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
                'errors' => $exception->errors(),
            ], 422);
        }

        return response()->json([
            'message' => 'Presentación eliminada correctamente',
        ]);
    }

    public function restore(int $id): JsonResponse
    {
        $presentacion = Presentacion::onlyTrashed()->findOrFail($id);

        $this->authorize('restore', $presentacion);

        $presentacion = $this->presentacionService->restore($id);

        return response()->json([
            'message' => 'Presentación restaurada correctamente',
            'data' => new PresentacionResource($presentacion),
        ]);
    }
}
