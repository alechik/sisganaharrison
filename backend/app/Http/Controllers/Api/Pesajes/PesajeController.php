<?php

namespace App\Http\Controllers\Api\Pesajes;

use App\Http\Controllers\Controller;
use App\Http\Requests\Pesajes\PreviewPesajeExcelRequest;
use App\Http\Requests\Pesajes\StorePesajeRequest;
use App\Http\Resources\Pesajes\PesajeResource;
use App\Http\Resources\Ventas\AnimalDisponibleVentaResource;
use App\Models\Pesaje;
use App\Services\Pesajes\PesajeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PesajeController extends Controller
{
    public function __construct(
        private readonly PesajeService $pesajeService
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Pesaje::class);

        $pesajes = $this->pesajeService->paginate($request->all());

        return PesajeResource::collection($pesajes);
    }

    public function animalesDisponibles(Request $request): AnonymousResourceCollection
    {
        $this->authorize('create', Pesaje::class);

        $animales = $this->pesajeService->animalesDisponibles($request->all());

        return AnimalDisponibleVentaResource::collection($animales);
    }

    public function plantillaExcel(): StreamedResponse
    {
        $this->authorize('create', Pesaje::class);

        return $this->pesajeService->descargarPlantilla();
    }

    public function previewExcel(PreviewPesajeExcelRequest $request): JsonResponse
    {
        $this->authorize('create', Pesaje::class);

        try {
            $preview = $this->pesajeService->previewExcel($request->file('archivo'));
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

    public function show(Pesaje $pesaje): PesajeResource
    {
        $this->authorize('view', $pesaje);

        return new PesajeResource($this->pesajeService->find($pesaje->id));
    }

    public function store(StorePesajeRequest $request): JsonResponse
    {
        $this->authorize('create', Pesaje::class);

        try {
            $pesaje = $this->pesajeService->create($request->validated());
        } catch (ValidationException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
                'errors' => $exception->errors(),
            ], 422);
        }

        return response()->json([
            'message' => 'Pesaje registrado correctamente',
            'data' => new PesajeResource($pesaje),
        ], 201);
    }
}
