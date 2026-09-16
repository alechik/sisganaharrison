<?php

namespace App\Http\Controllers\Api\Compras;

use App\Http\Controllers\Controller;
use App\Http\Requests\Compras\DecidirOrdenCompraRequest;
use App\Http\Requests\Compras\StoreOrdenCompraRequest;
use App\Http\Requests\Compras\UpdateOrdenCompraRequest;
use App\Http\Resources\Compras\OrdenCompraResource;
use App\Models\OrdenCompra;
use App\Services\Compras\OrdenCompraService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Validation\ValidationException;

class OrdenCompraController extends Controller
{
    public function __construct(
        private readonly OrdenCompraService $ordenCompraService
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', OrdenCompra::class);

        $ordenes = $this->ordenCompraService->paginate($request->all(), $request->user());

        return OrdenCompraResource::collection($ordenes);
    }

    public function pendientes(Request $request): JsonResponse
    {
        $this->authorize('viewAny', OrdenCompra::class);

        if (! $request->user()?->can('compras.authorize')) {
            return response()->json(['data' => [], 'total' => 0]);
        }

        $ordenes = $this->ordenCompraService->pendientesResumen();

        return response()->json([
            'total' => $this->ordenCompraService->countPendientes(),
            'data' => OrdenCompraResource::collection($ordenes)->resolve(),
        ]);
    }

    public function show(OrdenCompra $ordenCompra): OrdenCompraResource
    {
        $this->authorize('view', $ordenCompra);

        $ordenCompra->load([
            'proveedor:id,razon_social,nit,email',
            'creador:id,nombre,apellido',
            'autorizador:id,nombre,apellido',
            'detalles.categoria:id,codigo,nombre',
            'detalles.animal:id,codigo,sexo,categoria_id',
            'cuarentena:id,orden_compra_id,estado',
        ]);

        return new OrdenCompraResource($ordenCompra);
    }

    public function store(StoreOrdenCompraRequest $request): JsonResponse
    {
        $this->authorize('create', OrdenCompra::class);

        try {
            $orden = $this->ordenCompraService->create($request->validated());
        } catch (ValidationException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
                'errors' => $exception->errors(),
            ], 422);
        }

        return response()->json([
            'message' => 'Orden de compra registrada correctamente',
            'data' => new OrdenCompraResource($orden),
        ], 201);
    }

    public function update(UpdateOrdenCompraRequest $request, OrdenCompra $ordenCompra): JsonResponse
    {
        $this->authorize('update', $ordenCompra);

        try {
            $orden = $this->ordenCompraService->update($ordenCompra, $request->validated());
        } catch (ValidationException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
                'errors' => $exception->errors(),
            ], 422);
        }

        return response()->json([
            'message' => 'Orden de compra actualizada correctamente',
            'data' => new OrdenCompraResource($orden),
        ]);
    }

    public function autorizar(DecidirOrdenCompraRequest $request, OrdenCompra $ordenCompra): JsonResponse
    {
        $this->authorize('authorize', $ordenCompra);

        try {
            $orden = $this->ordenCompraService->autorizar(
                $ordenCompra,
                $request->validated('observacion') ?? null
            );
        } catch (ValidationException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
                'errors' => $exception->errors(),
            ], 422);
        }

        return response()->json([
            'message' => 'Orden de compra autorizada correctamente',
            'data' => new OrdenCompraResource($orden),
        ]);
    }

    public function rechazar(DecidirOrdenCompraRequest $request, OrdenCompra $ordenCompra): JsonResponse
    {
        $this->authorize('authorize', $ordenCompra);

        try {
            $orden = $this->ordenCompraService->rechazar(
                $ordenCompra,
                $request->validated('observacion') ?? null
            );
        } catch (ValidationException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
                'errors' => $exception->errors(),
            ], 422);
        }

        return response()->json([
            'message' => 'Orden de compra rechazada',
            'data' => new OrdenCompraResource($orden),
        ]);
    }

    public function pdf(OrdenCompra $ordenCompra): Response
    {
        $this->authorize('view', $ordenCompra);

        return $this->ordenCompraService->pdf($ordenCompra);
    }
}
