<?php

namespace App\Http\Controllers\Api\Salidas;

use App\Http\Controllers\Controller;
use App\Http\Requests\Salidas\PreviewSalidaExcelRequest;
use App\Http\Requests\Salidas\StoreSalidaRequest;
use App\Http\Resources\Salidas\AnimalDisponibleSalidaResource;
use App\Http\Resources\Salidas\SalidaResource;
use App\Models\Salida;
use App\Services\Salidas\SalidaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SalidaController extends Controller
{
    public function __construct(
        private readonly SalidaService $salidaService
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Salida::class);

        $salidas = $this->salidaService->paginate($request->all());

        return SalidaResource::collection($salidas);
    }

    public function animalesDisponibles(Request $request): AnonymousResourceCollection
    {
        $this->authorize('create', Salida::class);

        $animales = $this->salidaService->animalesDisponibles($request->all());

        return AnimalDisponibleSalidaResource::collection($animales);
    }

    public function plantillaExcel(): StreamedResponse
    {
        $this->authorize('create', Salida::class);

        return $this->salidaService->descargarPlantilla();
    }

    public function previewExcel(PreviewSalidaExcelRequest $request): JsonResponse
    {
        $this->authorize('create', Salida::class);

        try {
            $preview = $this->salidaService->previewExcel(
                $request->file('archivo'),
                $request->filled('tipo_salida_id') ? (int) $request->integer('tipo_salida_id') : null
            );
        } catch (ValidationException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
                'errors' => $exception->errors(),
            ], 422);
        }

        return response()->json([
            'data' => $preview,
        ]);
    }

    public function show(Salida $salida): SalidaResource
    {
        $this->authorize('view', $salida);

        return new SalidaResource($this->salidaService->find($salida->id));
    }

    public function store(StoreSalidaRequest $request): JsonResponse
    {
        $this->authorize('create', Salida::class);

        try {
            $salida = $this->salidaService->create($request->validated());
        } catch (ValidationException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
                'errors' => $exception->errors(),
            ], 422);
        }

        return response()->json([
            'message' => 'Salida registrada correctamente',
            'data' => new SalidaResource($salida),
        ], 201);
    }

    public function pdf(Request $request, Salida $salida): Response
    {
        $this->authorize('view', $salida);

        return $this->salidaService->pdf($salida, $request->boolean('inline'));
    }
}
