<?php

namespace App\Http\Controllers\Api\Medicamentos;

use App\Http\Controllers\Controller;
use App\Http\Requests\Medicamentos\StoreMedicamentoRequest;
use App\Http\Requests\Medicamentos\UpdateMedicamentoRequest;
use App\Http\Resources\Medicamentos\MedicamentoResource;
use App\Models\Medicamento;
use App\Services\Medicamentos\MedicamentoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\ValidationException;

class MedicamentoController extends Controller
{
    public function __construct(
        private readonly MedicamentoService $medicamentoService
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Medicamento::class);

        return MedicamentoResource::collection(
            $this->medicamentoService->paginate($request->all())
        );
    }

    public function deleted(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Medicamento::class);

        return MedicamentoResource::collection(
            $this->medicamentoService->paginateDeleted($request->all())
        );
    }

    public function show(Medicamento $medicamento): MedicamentoResource
    {
        $this->authorize('view', $medicamento);

        $medicamento->load('presentacion:id,descripcion');

        return new MedicamentoResource($medicamento);
    }

    public function store(StoreMedicamentoRequest $request): JsonResponse
    {
        $this->authorize('create', Medicamento::class);

        $medicamento = $this->medicamentoService->create($request->validated());

        return response()->json([
            'message' => 'Medicamento creado correctamente',
            'data' => new MedicamentoResource($medicamento),
        ], 201);
    }

    public function update(UpdateMedicamentoRequest $request, Medicamento $medicamento): JsonResponse
    {
        $this->authorize('update', $medicamento);

        $medicamento = $this->medicamentoService->update($medicamento, $request->validated());

        return response()->json([
            'message' => 'Medicamento actualizado correctamente',
            'data' => new MedicamentoResource($medicamento),
        ]);
    }

    public function destroy(Medicamento $medicamento): JsonResponse
    {
        $this->authorize('delete', $medicamento);

        try {
            $this->medicamentoService->delete($medicamento);
        } catch (ValidationException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
                'errors' => $exception->errors(),
            ], 422);
        }

        return response()->json([
            'message' => 'Medicamento eliminado correctamente',
        ]);
    }

    public function restore(int $id): JsonResponse
    {
        $medicamento = Medicamento::onlyTrashed()->findOrFail($id);

        $this->authorize('restore', $medicamento);

        $medicamento = $this->medicamentoService->restore($id);

        return response()->json([
            'message' => 'Medicamento restaurado correctamente',
            'data' => new MedicamentoResource($medicamento),
        ]);
    }

    public function changeStatus(Medicamento $medicamento): JsonResponse
    {
        $this->authorize('activate', $medicamento);

        $medicamento = $this->medicamentoService->toggleStatus($medicamento);

        return response()->json([
            'message' => 'Estado actualizado',
            'data' => new MedicamentoResource($medicamento),
        ]);
    }
}
