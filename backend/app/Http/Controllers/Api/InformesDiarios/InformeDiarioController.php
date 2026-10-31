<?php

namespace App\Http\Controllers\Api\InformesDiarios;

use App\Http\Controllers\Controller;
use App\Http\Requests\InformesDiarios\StoreInformeDiarioRequest;
use App\Http\Requests\InformesDiarios\UpdateInformeDiarioRequest;
use App\Http\Resources\InformesDiarios\InformeDiarioResource;
use App\Models\InformeDiario;
use App\Services\InformesDiarios\InformeDiarioService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class InformeDiarioController extends Controller
{
    public function __construct(
        private readonly InformeDiarioService $informeDiarioService
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', InformeDiario::class);

        $informes = $this->informeDiarioService->paginate($request->user(), $request->all());

        return InformeDiarioResource::collection($informes);
    }

    public function pendientes(): JsonResponse
    {
        $this->authorize('pendientes', InformeDiario::class);

        $data = $this->informeDiarioService->pendientes();

        return response()->json([
            'total' => count($data),
            'data' => $data,
        ]);
    }

    public function trabajadores(): JsonResponse
    {
        $this->authorize('listTrabajadores', InformeDiario::class);

        return response()->json([
            'data' => $this->informeDiarioService->trabajadores(),
        ]);
    }

    public function show(InformeDiario $informeDiario): InformeDiarioResource
    {
        $this->authorize('view', $informeDiario);

        $informeDiario->load(['trabajador', 'revisor']);

        return new InformeDiarioResource($informeDiario);
    }

    public function store(StoreInformeDiarioRequest $request): JsonResponse
    {
        $this->authorize('create', InformeDiario::class);

        $informe = $this->informeDiarioService->create($request->user(), $request->validated());

        return response()->json([
            'message' => 'Informe diario registrado correctamente',
            'data' => new InformeDiarioResource($informe),
        ], 201);
    }

    public function update(UpdateInformeDiarioRequest $request, InformeDiario $informeDiario): JsonResponse
    {
        $this->authorize('update', $informeDiario);

        $informe = $this->informeDiarioService->update($informeDiario, $request->validated());

        return response()->json([
            'message' => 'Informe diario actualizado correctamente',
            'data' => new InformeDiarioResource($informe),
        ]);
    }

    public function revisar(Request $request, InformeDiario $informeDiario): JsonResponse
    {
        $this->authorize('review', $informeDiario);

        $informe = $this->informeDiarioService->revisar($request->user(), $informeDiario);

        return response()->json([
            'message' => 'Informe diario marcado como revisado',
            'data' => new InformeDiarioResource($informe),
        ]);
    }
}
