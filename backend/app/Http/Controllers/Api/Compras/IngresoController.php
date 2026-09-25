<?php

namespace App\Http\Controllers\Api\Compras;

use App\Http\Controllers\Controller;
use App\Http\Requests\Compras\StoreIngresoRequest;
use App\Http\Resources\Compras\CuarentenaResource;
use App\Http\Resources\Compras\IngresoResource;
use App\Models\Cuarentena;
use App\Models\Ingreso;
use App\Services\Compras\IngresoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Validation\ValidationException;

class IngresoController extends Controller
{
    public function __construct(
        private readonly IngresoService $ingresoService
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Ingreso::class);

        $ingresos = $this->ingresoService->paginate($request->all());

        return IngresoResource::collection($ingresos);
    }

    public function show(Ingreso $ingreso): IngresoResource
    {
        $this->authorize('view', $ingreso);

        $ingreso->load([
            'proveedor:id,razon_social,nit,email',
            'creador:id,nombre,apellido',
            'lote:id,nombre,codigo',
            'cuarentena:id,cod_compra,estado,origen,proveedor_id,fecha_inicio,fecha_fin',
            'detalles.animal:id,codigo,sexo,categoria_id,arete,nombre,edad_inicial,edad_actual,precio_kilo,lote_id',
            'detalles.animal.categoria:id,codigo,nombre',
        ]);

        return new IngresoResource($ingreso);
    }

    public function cuarentenasDisponibles(): JsonResponse
    {
        $this->authorize('create', Ingreso::class);

        $cuarentenas = $this->ingresoService->cuarentenasDisponibles();

        return response()->json([
            'data' => CuarentenaResource::collection($cuarentenas)->resolve(),
        ]);
    }

    public function pendientes(Cuarentena $cuarentena): JsonResponse
    {
        $this->authorize('create', Ingreso::class);

        try {
            $payload = $this->ingresoService->pendientesDeCuarentena($cuarentena);
        } catch (ValidationException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
                'errors' => $exception->errors(),
            ], 422);
        }

        return response()->json([
            'data' => $payload,
        ]);
    }

    public function store(StoreIngresoRequest $request): JsonResponse
    {
        $this->authorize('create', Ingreso::class);

        try {
            $ingreso = $this->ingresoService->create($request->validated());
        } catch (ValidationException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
                'errors' => $exception->errors(),
            ], 422);
        }

        return response()->json([
            'message' => 'Ingreso registrado correctamente',
            'data' => new IngresoResource($ingreso),
        ], 201);
    }

    public function pdf(Ingreso $ingreso): Response
    {
        $this->authorize('view', $ingreso);

        return $this->ingresoService->pdf($ingreso);
    }
}
