<?php

namespace App\Http\Controllers\Api\Parcelas;

use App\Http\Controllers\Controller;
use App\Http\Requests\Parcelas\StoreParcelaRequest;
use App\Http\Requests\Parcelas\UpdateParcelaRequest;
use App\Http\Resources\Parcelas\ParcelaResource;
use App\Models\Parcela;
use App\Services\Parcelas\ParcelaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\ValidationException;

class ParcelaController extends Controller
{
    public function __construct(
        private readonly ParcelaService $parcelaService
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Parcela::class);

        $parcelas = $this->parcelaService->paginate($request->all());

        return ParcelaResource::collection($parcelas);
    }

    public function deleted(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Parcela::class);

        $parcelas = $this->parcelaService->paginateDeleted($request->all());

        return ParcelaResource::collection($parcelas);
    }

    public function show(Parcela $parcela): ParcelaResource
    {
        $this->authorize('view', $parcela);

        $parcela->load('estancia:id,nombre');

        return new ParcelaResource($parcela);
    }

    public function store(StoreParcelaRequest $request): JsonResponse
    {
        $this->authorize('create', Parcela::class);

        $parcela = $this->parcelaService->create($request->validated());

        return response()->json([
            'message' => 'Parcela creada correctamente',
            'data' => new ParcelaResource($parcela),
        ], 201);
    }

    public function update(UpdateParcelaRequest $request, Parcela $parcela): JsonResponse
    {
        $this->authorize('update', $parcela);

        $parcela = $this->parcelaService->update($parcela, $request->validated());

        return response()->json([
            'message' => 'Parcela actualizada correctamente',
            'data' => new ParcelaResource($parcela),
        ]);
    }

    public function destroy(Parcela $parcela): JsonResponse
    {
        $this->authorize('delete', $parcela);

        try {
            $this->parcelaService->delete($parcela);
        } catch (ValidationException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
                'errors' => $exception->errors(),
            ], 422);
        }

        return response()->json([
            'message' => 'Parcela eliminada correctamente',
        ]);
    }

    public function restore(int $id): JsonResponse
    {
        $parcela = Parcela::onlyTrashed()->findOrFail($id);

        $this->authorize('restore', $parcela);

        $parcela = $this->parcelaService->restore($id);

        return response()->json([
            'message' => 'Parcela restaurada correctamente',
            'data' => new ParcelaResource($parcela),
        ]);
    }

    public function changeStatus(Parcela $parcela): JsonResponse
    {
        $this->authorize('activate', $parcela);

        $parcela = $this->parcelaService->toggleStatus($parcela);

        return response()->json([
            'message' => 'Estado actualizado',
            'data' => new ParcelaResource($parcela),
        ]);
    }
}
