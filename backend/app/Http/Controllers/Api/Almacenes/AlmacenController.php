<?php

namespace App\Http\Controllers\Api\Almacenes;

use App\Http\Controllers\Controller;
use App\Http\Requests\Almacenes\StoreAlmacenRequest;
use App\Http\Requests\Almacenes\UpdateAlmacenRequest;
use App\Http\Resources\Almacenes\AlmacenResource;
use App\Models\Almacen;
use App\Services\Almacenes\AlmacenService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\ValidationException;

class AlmacenController extends Controller
{
    public function __construct(private readonly AlmacenService $service) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Almacen::class);

        return AlmacenResource::collection($this->service->paginate($request->all()));
    }

    public function deleted(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Almacen::class);

        return AlmacenResource::collection($this->service->paginateDeleted($request->all()));
    }

    public function show(Almacen $almacen): AlmacenResource
    {
        $this->authorize('view', $almacen);
        $almacen->load('establecimiento:id,codigo,nombre');

        return new AlmacenResource($almacen);
    }

    public function store(StoreAlmacenRequest $request): JsonResponse
    {
        $this->authorize('create', Almacen::class);
        try {
            $item = $this->service->create($request->validated());
        } catch (ValidationException $exception) {
            return response()->json(['message' => $exception->getMessage(), 'errors' => $exception->errors()], 422);
        }

        return response()->json(['message' => 'Almacén creado correctamente', 'data' => new AlmacenResource($item)], 201);
    }

    public function update(UpdateAlmacenRequest $request, Almacen $almacen): JsonResponse
    {
        $this->authorize('update', $almacen);
        try {
            $item = $this->service->update($almacen, $request->validated());
        } catch (ValidationException $exception) {
            return response()->json(['message' => $exception->getMessage(), 'errors' => $exception->errors()], 422);
        }

        return response()->json(['message' => 'Almacén actualizado correctamente', 'data' => new AlmacenResource($item)]);
    }

    public function destroy(Almacen $almacen): JsonResponse
    {
        $this->authorize('delete', $almacen);
        try {
            $this->service->delete($almacen);
        } catch (ValidationException $exception) {
            return response()->json(['message' => $exception->getMessage(), 'errors' => $exception->errors()], 422);
        }

        return response()->json(['message' => 'Almacén eliminado correctamente']);
    }

    public function restore(int $id): JsonResponse
    {
        $item = Almacen::onlyTrashed()->findOrFail($id);
        $this->authorize('restore', $item);
        $item = $this->service->restore($id);

        return response()->json(['message' => 'Almacén restaurado correctamente', 'data' => new AlmacenResource($item)]);
    }

    public function changeStatus(Almacen $almacen): JsonResponse
    {
        $this->authorize('activate', $almacen);
        $item = $this->service->toggleStatus($almacen);

        return response()->json(['message' => 'Estado actualizado', 'data' => new AlmacenResource($item)]);
    }
}
