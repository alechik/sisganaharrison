<?php

namespace App\Http\Controllers\Api\Partos;

use App\Http\Controllers\Controller;
use App\Http\Requests\Partos\StorePartoRequest;
use App\Http\Requests\Partos\UpdatePartoRequest;
use App\Http\Resources\Partos\PartoResource;
use App\Models\Parto;
use App\Services\Partos\PartoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\ValidationException;

class PartoController extends Controller
{
    public function __construct(
        private readonly PartoService $partoService
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Parto::class);

        $partos = $this->partoService->paginate($request->all());

        return PartoResource::collection($partos);
    }

    public function show(Parto $parto): PartoResource
    {
        $this->authorize('view', $parto);

        $parto->load([
            'gestacion:id,servicio_id,estado,fecha_confirmacion,fecha_probable_parto',
            'gestacion.servicio:id,hembra_id,macho_id,fecha_servicio,tipo_servicio,resultado',
            'gestacion.servicio.hembra:id,codigo,arete',
            'gestacion.servicio.macho:id,codigo,arete',
        ]);

        return new PartoResource($parto);
    }

    public function store(StorePartoRequest $request): JsonResponse
    {
        $this->authorize('create', Parto::class);

        try {
            $parto = $this->partoService->create($request->validated());
        } catch (ValidationException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
                'errors' => $exception->errors(),
            ], 422);
        }

        return response()->json([
            'message' => 'Parto registrado correctamente',
            'data' => new PartoResource($parto),
        ], 201);
    }

    public function update(UpdatePartoRequest $request, Parto $parto): JsonResponse
    {
        $this->authorize('update', $parto);

        try {
            $parto = $this->partoService->update($parto, $request->validated());
        } catch (ValidationException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
                'errors' => $exception->errors(),
            ], 422);
        }

        return response()->json([
            'message' => 'Parto actualizado correctamente',
            'data' => new PartoResource($parto),
        ]);
    }

    public function changeStatus(Parto $parto): JsonResponse
    {
        $this->authorize('update', $parto);

        try {
            $parto = $this->partoService->finalizar($parto);
        } catch (ValidationException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
                'errors' => $exception->errors(),
            ], 422);
        }

        return response()->json([
            'message' => 'Parto finalizado correctamente',
            'data' => new PartoResource($parto),
        ]);
    }
}
