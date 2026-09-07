<?php

namespace App\Http\Controllers\Api\SociosDeNegocio;

use App\Http\Controllers\Controller;
use App\Http\Requests\SociosDeNegocio\StorePersonaRequest;
use App\Http\Requests\SociosDeNegocio\UpdatePersonaRequest;
use App\Http\Resources\SociosDeNegocio\PersonaResource;
use App\Models\Persona;
use App\Services\SociosDeNegocio\PersonaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\ValidationException;

class PersonaController extends Controller
{
    public function __construct(
        private readonly PersonaService $personaService
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Persona::class);

        $personas = $this->personaService->paginate($request->all());

        return PersonaResource::collection($personas);
    }

    public function deleted(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Persona::class);

        $personas = $this->personaService->paginateDeleted($request->all());

        return PersonaResource::collection($personas);
    }

    public function show(Persona $persona): PersonaResource
    {
        $this->authorize('view', $persona);

        $persona->load(['tipos:id,nombre', 'registradoPor:id,nombre,apellido']);

        return new PersonaResource($persona);
    }

    public function store(StorePersonaRequest $request): JsonResponse
    {
        $this->authorize('create', Persona::class);

        try {
            $persona = $this->personaService->create($request->validated());
        } catch (ValidationException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
                'errors' => $exception->errors(),
            ], 422);
        }

        return response()->json([
            'message' => 'Socio de negocio registrado correctamente',
            'data' => new PersonaResource($persona),
        ], 201);
    }

    public function update(UpdatePersonaRequest $request, Persona $persona): JsonResponse
    {
        $this->authorize('update', $persona);

        try {
            $persona = $this->personaService->update($persona, $request->validated());
        } catch (ValidationException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
                'errors' => $exception->errors(),
            ], 422);
        }

        return response()->json([
            'message' => 'Socio de negocio actualizado correctamente',
            'data' => new PersonaResource($persona),
        ]);
    }

    public function destroy(Persona $persona): JsonResponse
    {
        $this->authorize('delete', $persona);

        $this->personaService->delete($persona);

        return response()->json([
            'message' => 'Socio de negocio desactivado correctamente',
        ]);
    }

    public function restore(int $id): JsonResponse
    {
        $persona = Persona::onlyTrashed()->findOrFail($id);

        $this->authorize('restore', $persona);

        $persona = $this->personaService->restore($id);

        return response()->json([
            'message' => 'Socio de negocio restaurado correctamente',
            'data' => new PersonaResource($persona),
        ]);
    }

    public function changeStatus(Persona $persona): JsonResponse
    {
        $this->authorize('activate', $persona);

        $persona = $this->personaService->toggleStatus($persona);

        return response()->json([
            'message' => 'Estado actualizado',
            'data' => new PersonaResource($persona),
        ]);
    }
}
