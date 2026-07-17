<?php

namespace App\Http\Controllers\Api\Gestaciones;

use App\Http\Controllers\Controller;
use App\Http\Requests\Gestaciones\StoreGestacionRequest;
use App\Http\Requests\Gestaciones\UpdateGestacionRequest;
use App\Http\Resources\Gestaciones\GestacionResource;
use App\Models\Gestacion;
use App\Services\Gestaciones\GestacionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\ValidationException;

class GestacionController extends Controller
{
    public function __construct(
        private readonly GestacionService $gestacionService
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Gestacion::class);

        $gestaciones = $this->gestacionService->paginate($request->all());

        return GestacionResource::collection($gestaciones);
    }

    public function show(Gestacion $gestacion): GestacionResource
    {
        $this->authorize('view', $gestacion);

        $gestacion->load([
            'servicio.hembra:id,codigo,arete',
            'servicio.macho:id,codigo,arete',
        ]);

        return new GestacionResource($gestacion);
    }

    public function store(StoreGestacionRequest $request): JsonResponse
    {
        $this->authorize('create', Gestacion::class);

        try {
            $gestacion = $this->gestacionService->create($request->validated());
        } catch (ValidationException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
                'errors' => $exception->errors(),
            ], 422);
        }

        return response()->json([
            'message' => 'Gestación registrada correctamente',
            'data' => new GestacionResource($gestacion),
        ], 201);
    }

    public function update(UpdateGestacionRequest $request, Gestacion $gestacion): JsonResponse
    {
        $this->authorize('update', $gestacion);

        try {
            $gestacion = $this->gestacionService->update($gestacion, $request->validated());
        } catch (ValidationException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
                'errors' => $exception->errors(),
            ], 422);
        }

        return response()->json([
            'message' => 'Gestación actualizada correctamente',
            'data' => new GestacionResource($gestacion),
        ]);
    }
}
