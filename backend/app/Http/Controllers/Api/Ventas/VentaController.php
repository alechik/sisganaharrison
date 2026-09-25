<?php

namespace App\Http\Controllers\Api\Ventas;

use App\Http\Controllers\Controller;
use App\Http\Requests\Ventas\DecidirVentaRequest;
use App\Http\Requests\Ventas\StoreVentaRequest;
use App\Http\Requests\Ventas\UpdateVentaRequest;
use App\Http\Resources\Ventas\AnimalDisponibleVentaResource;
use App\Http\Resources\Ventas\VentaResource;
use App\Models\Venta;
use App\Services\Ventas\VentaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Validation\ValidationException;

class VentaController extends Controller
{
    public function __construct(
        private readonly VentaService $ventaService
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Venta::class);

        $ventas = $this->ventaService->paginate($request->all(), $request->user());

        return VentaResource::collection($ventas);
    }

    public function animalesDisponibles(Request $request): AnonymousResourceCollection
    {
        $this->authorize('create', Venta::class);

        $animales = $this->ventaService->animalesDisponibles(
            $request->all(),
            $request->filled('venta_id') ? (int) $request->input('venta_id') : null
        );

        return AnimalDisponibleVentaResource::collection($animales);
    }

    public function show(Venta $venta): VentaResource
    {
        $this->authorize('view', $venta);

        $venta->load([
            'cliente:id,razon_social,nit,email',
            'creador:id,nombre,apellido',
            'autorizador:id,nombre,apellido',
            'detalles.animal:id,codigo,arete,sexo,categoria_id,lote_id,estado',
            'detalles.animal.categoria:id,codigo,nombre',
            'detalles.animal.lote:id,nombre,codigo,potrero_id',
            'detalles.animal.lote.potrero:id,nombre',
            'detalles.lote:id,nombre,codigo,potrero_id',
            'detalles.lote.potrero:id,nombre',
        ]);

        return new VentaResource($venta);
    }

    public function store(StoreVentaRequest $request): JsonResponse
    {
        $this->authorize('create', Venta::class);

        try {
            $venta = $this->ventaService->create($request->validated());
        } catch (ValidationException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
                'errors' => $exception->errors(),
            ], 422);
        }

        return response()->json([
            'message' => 'Venta registrada correctamente',
            'data' => new VentaResource($venta),
        ], 201);
    }

    public function update(UpdateVentaRequest $request, Venta $venta): JsonResponse
    {
        $this->authorize('update', $venta);

        try {
            $venta = $this->ventaService->update($venta, $request->validated());
        } catch (ValidationException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
                'errors' => $exception->errors(),
            ], 422);
        }

        return response()->json([
            'message' => 'Venta actualizada correctamente',
            'data' => new VentaResource($venta),
        ]);
    }

    public function autorizar(DecidirVentaRequest $request, Venta $venta): JsonResponse
    {
        $this->authorize('authorize', $venta);

        try {
            $venta = $this->ventaService->autorizar(
                $venta,
                $request->validated('observacion') ?? null
            );
        } catch (ValidationException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
                'errors' => $exception->errors(),
            ], 422);
        }

        return response()->json([
            'message' => 'Venta autorizada correctamente',
            'data' => new VentaResource($venta),
        ]);
    }

    public function anular(DecidirVentaRequest $request, Venta $venta): JsonResponse
    {
        $this->authorize('authorize', $venta);

        try {
            $venta = $this->ventaService->anular(
                $venta,
                $request->validated('observacion') ?? null
            );
        } catch (ValidationException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
                'errors' => $exception->errors(),
            ], 422);
        }

        return response()->json([
            'message' => 'Venta anulada correctamente',
            'data' => new VentaResource($venta),
        ]);
    }

    public function pdf(Request $request, Venta $venta): Response
    {
        $this->authorize('view', $venta);

        return $this->ventaService->pdf(
            $venta,
            $request->boolean('inline')
        );
    }
}
