<?php

namespace App\Http\Controllers\Api\Nacimientos;

use App\Http\Controllers\Controller;
use App\Http\Requests\Nacimientos\StoreNacimientoRequest;
use App\Http\Requests\Nacimientos\UpdateNacimientoRequest;
use App\Http\Resources\Nacimientos\NacimientoResource;
use App\Models\Nacimiento;
use App\Services\Nacimientos\NacimientoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\ValidationException;

class NacimientoController extends Controller
{
    private const RELATIONS = [
        'parto:id,gestacion_id,fecha_parto',
        'parto.gestacion:id,servicio_id,estado',
        'parto.gestacion.servicio:id,hembra_id,macho_id,fecha_servicio,tipo_servicio',
        'parto.gestacion.servicio.hembra:id,codigo,arete',
        'parto.gestacion.servicio.macho:id,codigo,arete',
        'animal:id,codigo,arete',
        'registradoPor:id,nombre,apellido',
    ];

    public function __construct(
        private readonly NacimientoService $nacimientoService
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Nacimiento::class);

        $nacimientos = $this->nacimientoService->paginate($request->all());

        return NacimientoResource::collection($nacimientos);
    }

    public function show(Nacimiento $nacimiento): NacimientoResource
    {
        $this->authorize('view', $nacimiento);

        $nacimiento->load(self::RELATIONS);

        return new NacimientoResource($nacimiento);
    }

    public function store(StoreNacimientoRequest $request): JsonResponse
    {
        $this->authorize('create', Nacimiento::class);

        try {
            $nacimiento = $this->nacimientoService->create($request->validated());
        } catch (ValidationException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
                'errors' => $exception->errors(),
            ], 422);
        }

        return response()->json([
            'message' => 'Nacimiento registrado correctamente',
            'data' => new NacimientoResource($nacimiento),
        ], 201);
    }

    public function update(UpdateNacimientoRequest $request, Nacimiento $nacimiento): JsonResponse
    {
        $this->authorize('update', $nacimiento);

        try {
            $nacimiento = $this->nacimientoService->update($nacimiento, $request->validated());
        } catch (ValidationException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
                'errors' => $exception->errors(),
            ], 422);
        }

        return response()->json([
            'message' => 'Nacimiento actualizado correctamente',
            'data' => new NacimientoResource($nacimiento),
        ]);
    }
}
