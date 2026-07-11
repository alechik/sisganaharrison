<?php

namespace App\Http\Controllers\Api\Lotes;

use App\Http\Controllers\Controller;
use App\Http\Requests\Lotes\StoreLoteRequest;
use App\Http\Requests\Lotes\UpdateLoteRequest;
use App\Http\Resources\Lotes\LoteResource;
use App\Models\Lote;
use App\Services\Lotes\LoteService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\ValidationException;

class LoteController extends Controller
{
    public function __construct(
        private readonly LoteService $loteService
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Lote::class);

        $lotes = $this->loteService->paginate($request->all());

        return LoteResource::collection($lotes);
    }

    public function deleted(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Lote::class);

        $lotes = $this->loteService->paginateDeleted($request->all());

        return LoteResource::collection($lotes);
    }

    public function show(Lote $lote): LoteResource
    {
        $this->authorize('view', $lote);

        $lote->load('potrero:id,nombre');

        return new LoteResource($lote);
    }

    public function store(StoreLoteRequest $request): JsonResponse
    {
        $this->authorize('create', Lote::class);

        $lote = $this->loteService->create($request->validated());

        return response()->json([
            'message' => 'Lote creado correctamente',
            'data' => new LoteResource($lote),
        ], 201);
    }

    public function update(UpdateLoteRequest $request, Lote $lote): JsonResponse
    {
        $this->authorize('update', $lote);

        try {
            $lote = $this->loteService->update($lote, $request->validated());
        } catch (ValidationException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
                'errors' => $exception->errors(),
            ], 422);
        }

        return response()->json([
            'message' => 'Lote actualizado correctamente',
            'data' => new LoteResource($lote),
        ]);
    }

    public function destroy(Lote $lote): JsonResponse
    {
        $this->authorize('delete', $lote);

        try {
            $this->loteService->delete($lote);
        } catch (ValidationException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
                'errors' => $exception->errors(),
            ], 422);
        }

        return response()->json([
            'message' => 'Lote eliminado correctamente',
        ]);
    }

    public function restore(int $id): JsonResponse
    {
        $lote = Lote::onlyTrashed()->findOrFail($id);

        $this->authorize('restore', $lote);

        $lote = $this->loteService->restore($id);

        return response()->json([
            'message' => 'Lote restaurado correctamente',
            'data' => new LoteResource($lote),
        ]);
    }

    public function changeStatus(Lote $lote): JsonResponse
    {
        $this->authorize('activate', $lote);

        $lote = $this->loteService->toggleStatus($lote);

        return response()->json([
            'message' => 'Estado actualizado',
            'data' => new LoteResource($lote),
        ]);
    }
}
