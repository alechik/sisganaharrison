<?php

namespace App\Http\Controllers\Api\Compras;

use App\Http\Controllers\Controller;
use App\Http\Requests\Compras\StoreCuarentenaRequest;
use App\Http\Requests\Compras\UpdateCuarentenaRequest;
use App\Http\Resources\Compras\CuarentenaResource;
use App\Models\Cuarentena;
use App\Models\OrdenCompra;
use App\Services\Compras\CuarentenaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Validation\ValidationException;

class CuarentenaController extends Controller
{
    public function __construct(
        private readonly CuarentenaService $cuarentenaService
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Cuarentena::class);

        $cuarentenas = $this->cuarentenaService->paginate($request->all());

        return CuarentenaResource::collection($cuarentenas);
    }

    public function show(Cuarentena $cuarentena): CuarentenaResource
    {
        $this->authorize('view', $cuarentena);

        $cuarentena->load([
            'proveedor:id,razon_social,nit,email',
            'creador:id,nombre,apellido',
            'ordenCompra:id,cod_compra,estado,fecha',
            'detalles.categoria:id,codigo,nombre',
            'detalles.animal:id,codigo,arete',
        ]);

        return new CuarentenaResource($cuarentena);
    }

    public function store(StoreCuarentenaRequest $request): JsonResponse
    {
        $this->authorize('create', Cuarentena::class);

        try {
            $cuarentena = $this->cuarentenaService->createDirecta($request->validated());
        } catch (ValidationException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
                'errors' => $exception->errors(),
            ], 422);
        }

        return response()->json([
            'message' => 'Cuarentena directa registrada correctamente',
            'data' => new CuarentenaResource($cuarentena),
        ], 201);
    }

    public function generarDesdeOrden(OrdenCompra $ordenCompra): JsonResponse
    {
        $this->authorize('generateCuarentena', $ordenCompra);

        try {
            $cuarentena = $this->cuarentenaService->generarDesdeOrden($ordenCompra);
        } catch (ValidationException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
                'errors' => $exception->errors(),
            ], 422);
        }

        return response()->json([
            'message' => 'Cuarentena generada desde la orden de compra',
            'data' => new CuarentenaResource($cuarentena),
        ], 201);
    }

    public function update(UpdateCuarentenaRequest $request, Cuarentena $cuarentena): JsonResponse
    {
        $this->authorize('update', $cuarentena);

        try {
            $actualizada = $this->cuarentenaService->update($cuarentena, $request->validated());
        } catch (ValidationException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
                'errors' => $exception->errors(),
            ], 422);
        }

        return response()->json([
            'message' => 'Cuarentena actualizada correctamente',
            'data' => new CuarentenaResource($actualizada),
        ]);
    }

    public function completar(Cuarentena $cuarentena): JsonResponse
    {
        $this->authorize('complete', $cuarentena);

        try {
            $completada = $this->cuarentenaService->completar($cuarentena);
        } catch (ValidationException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
                'errors' => $exception->errors(),
            ], 422);
        }

        return response()->json([
            'message' => 'Cuarentena completada correctamente',
            'data' => new CuarentenaResource($completada),
        ]);
    }

    public function pdf(Cuarentena $cuarentena): Response
    {
        $this->authorize('view', $cuarentena);

        return $this->cuarentenaService->pdf($cuarentena);
    }
}
