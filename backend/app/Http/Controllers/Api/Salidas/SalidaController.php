<?php

namespace App\Http\Controllers\Api\Salidas;

use App\Http\Controllers\Controller;
use App\Http\Requests\Salidas\StoreSalidaRequest;
use App\Http\Resources\Salidas\SalidaResource;
use App\Http\Resources\Ventas\AnimalDisponibleVentaResource;
use App\Models\Salida;
use App\Services\Salidas\SalidaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Validation\ValidationException;

class SalidaController extends Controller
{
    public function __construct(
        private readonly SalidaService $salidaService
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Salida::class);

        $salidas = $this->salidaService->paginate($request->all());

        return SalidaResource::collection($salidas);
    }

    public function ventasDisponibles(): JsonResponse
    {
        $this->authorize('create', Salida::class);

        $ventas = $this->salidaService->ventasDisponibles();

        return response()->json([
            'data' => $ventas->map(fn ($venta) => [
                'id' => $venta->id,
                'cod_venta' => $venta->cod_venta,
                'fecha_venta' => $venta->fecha_venta?->format('Y-m-d'),
                'cliente_id' => $venta->cliente_id,
                'cliente_razon_social' => $venta->cliente?->razon_social,
            ])->values(),
        ]);
    }

    public function animalesDisponibles(Request $request): AnonymousResourceCollection
    {
        $this->authorize('create', Salida::class);

        $animales = $this->salidaService->animalesDisponibles($request->all());

        return AnimalDisponibleVentaResource::collection($animales);
    }

    public function show(Salida $salida): SalidaResource
    {
        $this->authorize('view', $salida);

        $salida->load([
            'cliente:id,razon_social,nit',
            'creador:id,nombre,apellido',
            'tipoSalida:id,nombre',
            'venta:id,cod_venta,cliente_id,fecha_venta',
            'detalles.animal:id,codigo,arete,sexo,categoria_id,lote_id,estado',
            'detalles.animal.categoria:id,codigo,nombre',
            'detalles.animal.lote:id,nombre,codigo,potrero_id',
            'detalles.animal.lote.potrero:id,nombre',
            'detalles.lote:id,nombre,codigo,potrero_id',
            'detalles.lote.potrero:id,nombre',
        ]);

        return new SalidaResource($salida);
    }

    public function store(StoreSalidaRequest $request): JsonResponse
    {
        $this->authorize('create', Salida::class);

        try {
            $salida = $this->salidaService->create($request->validated());
        } catch (ValidationException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
                'errors' => $exception->errors(),
            ], 422);
        }

        return response()->json([
            'message' => 'Salida registrada correctamente',
            'data' => new SalidaResource($salida),
        ], 201);
    }

    public function pdf(Request $request, Salida $salida): Response
    {
        $this->authorize('view', $salida);

        return $this->salidaService->pdf($salida, $request->boolean('inline'));
    }
}
