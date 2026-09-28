<?php

namespace App\Http\Controllers\Api\Traspasos;

use App\Http\Controllers\Controller;
use App\Http\Requests\Traspasos\StoreTraspasoRequest;
use App\Http\Requests\Traspasos\UpdateTraspasoRequest;
use App\Http\Resources\Traspasos\TraspasoResource;
use App\Http\Resources\Ventas\AnimalDisponibleVentaResource;
use App\Models\Traspaso;
use App\Services\Traspasos\TraspasoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Validation\ValidationException;

class TraspasoController extends Controller
{
    public function __construct(
        private readonly TraspasoService $traspasoService
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Traspaso::class);

        return TraspasoResource::collection(
            $this->traspasoService->paginate($request->all())
        );
    }

    public function animalesDisponibles(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();
        if (! $user?->can('traspasos.create') && ! $user?->can('traspasos.update')) {
            abort(403);
        }

        return AnimalDisponibleVentaResource::collection(
            $this->traspasoService->animalesDisponibles($request->all())
        );
    }

    public function show(Traspaso $traspaso): TraspasoResource
    {
        $this->authorize('view', $traspaso);

        $traspaso->load([
            'usuario:id,nombre,apellido',
            'loteSalida:id,codigo,nombre',
            'loteIngreso:id,codigo,nombre',
            'detalles.animal:id,codigo,arete,sexo,categoria_id',
            'detalles.animal.categoria:id,codigo,nombre',
        ]);

        return new TraspasoResource($traspaso);
    }

    public function store(StoreTraspasoRequest $request): JsonResponse
    {
        $this->authorize('create', Traspaso::class);

        try {
            $traspaso = $this->traspasoService->create($request->validated());
        } catch (ValidationException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
                'errors' => $exception->errors(),
            ], 422);
        }

        return response()->json([
            'message' => 'Traspaso registrado correctamente',
            'data' => new TraspasoResource($traspaso),
        ], 201);
    }

    public function update(UpdateTraspasoRequest $request, Traspaso $traspaso): JsonResponse
    {
        $this->authorize('update', $traspaso);

        try {
            $traspaso = $this->traspasoService->update($traspaso, $request->validated());
        } catch (ValidationException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
                'errors' => $exception->errors(),
            ], 422);
        }

        return response()->json([
            'message' => 'Traspaso actualizado correctamente',
            'data' => new TraspasoResource($traspaso),
        ]);
    }

    public function pdf(Request $request, Traspaso $traspaso): Response
    {
        $this->authorize('view', $traspaso);

        return $this->traspasoService->pdf($traspaso, $request->boolean('inline'));
    }
}
