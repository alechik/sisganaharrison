<?php

namespace App\Http\Controllers\Api\EventosSanitarios;

use App\Http\Controllers\Controller;
use App\Http\Requests\EventosSanitarios\StoreEventoSanitarioRequest;
use App\Http\Resources\EventosSanitarios\EventoSanitarioResource;
use App\Http\Resources\Ventas\AnimalDisponibleVentaResource;
use App\Models\EventoSanitario;
use App\Services\EventosSanitarios\EventoSanitarioService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\ValidationException;

class EventoSanitarioController extends Controller
{
    public function __construct(
        private readonly EventoSanitarioService $eventoSanitarioService
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', EventoSanitario::class);

        $eventos = $this->eventoSanitarioService->paginate($request->all());

        return EventoSanitarioResource::collection($eventos);
    }

    public function animalesDisponibles(Request $request): AnonymousResourceCollection
    {
        $this->authorize('create', EventoSanitario::class);

        return AnimalDisponibleVentaResource::collection(
            $this->eventoSanitarioService->animalesDisponibles($request->all())
        );
    }

    public function show(EventoSanitario $eventoSanitario): EventoSanitarioResource
    {
        $this->authorize('view', $eventoSanitario);

        $eventoSanitario->load([
            'tipoEvento:id,nombre,codigo',
            'usuario:id,nombre,apellido',
            'detalles.animal:id,codigo,arete,lote_id',
            'detalles.lote:id,nombre,codigo',
            'detalles.medicamento:id,codigo,nombre,presentacion_id,precio',
            'detalles.medicamento.presentacion:id,descripcion',
        ]);

        return new EventoSanitarioResource($eventoSanitario);
    }

    public function store(StoreEventoSanitarioRequest $request): JsonResponse
    {
        $this->authorize('create', EventoSanitario::class);

        try {
            $evento = $this->eventoSanitarioService->create($request->validated());
        } catch (ValidationException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
                'errors' => $exception->errors(),
            ], 422);
        }

        return response()->json([
            'message' => 'Evento sanitario registrado correctamente',
            'data' => new EventoSanitarioResource($evento),
        ], 201);
    }
}
