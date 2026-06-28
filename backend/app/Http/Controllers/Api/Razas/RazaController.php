<?php

namespace App\Http\Controllers\Api\Razas;

use App\Http\Controllers\Controller;
use App\Http\Requests\Razas\StoreRazaRequest;
use App\Http\Requests\Razas\UpdateRazaRequest;
use App\Http\Resources\Razas\RazaResource;
use App\Models\Raza;
use App\Services\Razas\RazaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class RazaController extends Controller
{
    public function __construct(
        private readonly RazaService $razaService
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Raza::class);

        $razas = $this->razaService->paginate($request->all());

        return RazaResource::collection($razas);
    }

    public function deleted(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Raza::class);

        $razas = $this->razaService->paginateDeleted($request->all());

        return RazaResource::collection($razas);
    }

    public function show(Raza $raza): RazaResource
    {
        $this->authorize('view', $raza);

        return new RazaResource($raza);
    }

    public function store(StoreRazaRequest $request): JsonResponse
    {
        $this->authorize('create', Raza::class);

        $raza = $this->razaService->create($request->validated());

        return response()->json([
            'message' => 'Raza creada correctamente',
            'data' => new RazaResource($raza),
        ], 201);
    }

    public function update(UpdateRazaRequest $request, Raza $raza): JsonResponse
    {
        $this->authorize('update', $raza);

        $raza = $this->razaService->update($raza, $request->validated());

        return response()->json([
            'message' => 'Raza actualizada correctamente',
            'data' => new RazaResource($raza),
        ]);
    }

    public function destroy(Raza $raza): JsonResponse
    {
        $this->authorize('delete', $raza);

        $this->razaService->delete($raza);

        return response()->json([
            'message' => 'Raza eliminada correctamente',
        ]);
    }

    public function restore(int $id): JsonResponse
    {
        $raza = Raza::onlyTrashed()->findOrFail($id);

        $this->authorize('restore', $raza);

        $raza = $this->razaService->restore($id);

        return response()->json([
            'message' => 'Raza restaurada correctamente',
            'data' => new RazaResource($raza),
        ]);
    }

    public function changeStatus(Raza $raza): JsonResponse
    {
        $this->authorize('activate', $raza);

        $raza = $this->razaService->toggleStatus($raza);

        return response()->json([
            'message' => 'Estado actualizado',
            'data' => new RazaResource($raza),
        ]);
    }
}
