<?php

namespace App\Http\Controllers\Api\ServiciosReproductivos;

use App\Http\Controllers\Controller;
use App\Http\Requests\ServiciosReproductivos\StoreServicioReproductivoRequest;
use App\Http\Requests\ServiciosReproductivos\UpdateServicioReproductivoRequest;
use App\Http\Resources\ServiciosReproductivos\ServicioReproductivoResource;
use App\Models\ServicioReproductivo;
use App\Services\ServiciosReproductivos\ServicioReproductivoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\ValidationException;

class ServicioReproductivoController extends Controller
{
    public function __construct(
        private readonly ServicioReproductivoService $servicioReproductivoService
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', ServicioReproductivo::class);

        $servicios = $this->servicioReproductivoService->paginate($request->all());

        return ServicioReproductivoResource::collection($servicios);
    }

    public function show(ServicioReproductivo $servicioReproductivo): ServicioReproductivoResource
    {
        $this->authorize('view', $servicioReproductivo);

        $servicioReproductivo->load([
            'hembra:id,codigo,arete,sexo',
            'macho:id,codigo,arete,sexo',
        ]);

        return new ServicioReproductivoResource($servicioReproductivo);
    }

    public function store(StoreServicioReproductivoRequest $request): JsonResponse
    {
        $this->authorize('create', ServicioReproductivo::class);

        try {
            $servicio = $this->servicioReproductivoService->create($request->validated());
        } catch (ValidationException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
                'errors' => $exception->errors(),
            ], 422);
        }

        return response()->json([
            'message' => 'Servicio reproductivo registrado correctamente',
            'data' => new ServicioReproductivoResource($servicio),
        ], 201);
    }

    public function update(
        UpdateServicioReproductivoRequest $request,
        ServicioReproductivo $servicioReproductivo
    ): JsonResponse {
        $this->authorize('update', $servicioReproductivo);

        try {
            $servicio = $this->servicioReproductivoService->update(
                $servicioReproductivo,
                $request->validated()
            );
        } catch (ValidationException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
                'errors' => $exception->errors(),
            ], 422);
        }

        return response()->json([
            'message' => 'Servicio reproductivo actualizado correctamente',
            'data' => new ServicioReproductivoResource($servicio),
        ]);
    }
}
