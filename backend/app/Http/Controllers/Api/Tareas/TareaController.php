<?php

namespace App\Http\Controllers\Api\Tareas;

use App\Http\Controllers\Controller;
use App\Http\Requests\Tareas\StoreTareaRequest;
use App\Http\Requests\Tareas\UpdateTareaRequest;
use App\Http\Resources\Tareas\TareaResource;
use App\Models\Tarea;
use App\Services\Tareas\TareaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class TareaController extends Controller
{
    public function __construct(
        private readonly TareaService $tareaService
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Tarea::class);

        $tareas = $this->tareaService->paginate($request->user(), $request->all());

        return TareaResource::collection($tareas);
    }

    public function asignables(): JsonResponse
    {
        $this->authorize('create', Tarea::class);

        return response()->json([
            'data' => $this->tareaService->asignables(),
        ]);
    }

    public function show(Request $request, Tarea $tarea): TareaResource
    {
        $this->authorize('view', $tarea);

        $tarea = $this->tareaService->marcarVistaSiCorresponde($request->user(), $tarea);

        return new TareaResource($tarea);
    }

    public function store(StoreTareaRequest $request): JsonResponse
    {
        $this->authorize('create', Tarea::class);

        $tarea = $this->tareaService->create($request->user(), $request->validated());

        return response()->json([
            'message' => 'Tarea creada correctamente',
            'data' => new TareaResource($tarea),
        ], 201);
    }

    public function update(UpdateTareaRequest $request, Tarea $tarea): JsonResponse
    {
        $this->authorize('update', $tarea);

        $tarea = $this->tareaService->updateRespuesta($tarea, $request->validated());

        return response()->json([
            'message' => 'Respuesta de la tarea actualizada correctamente',
            'data' => new TareaResource($tarea),
        ]);
    }

    public function terminar(Tarea $tarea): JsonResponse
    {
        $this->authorize('complete', $tarea);

        $tarea = $this->tareaService->terminar($tarea);

        return response()->json([
            'message' => 'Tarea terminada correctamente',
            'data' => new TareaResource($tarea),
        ]);
    }
}
