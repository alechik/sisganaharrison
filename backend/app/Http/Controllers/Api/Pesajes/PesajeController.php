<?php

namespace App\Http\Controllers\Api\Pesajes;

use App\Http\Controllers\Controller;
use App\Http\Requests\Pesajes\StorePesajeRequest;
use App\Http\Resources\Pesajes\PesajeResource;
use App\Models\Pesaje;
use App\Services\Pesajes\PesajeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\ValidationException;

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

    public function show(Pesaje $pesaje): PesajeResource
    {
        $this->authorize('view', $pesaje);

        $pesaje->load('animal:id,codigo,arete');

        return new PesajeResource($pesaje);
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
