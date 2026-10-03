<?php

namespace App\Http\Controllers\Api\Animales;

use App\Http\Controllers\Controller;
use App\Http\Requests\Animales\AnimalHistorialRequest;
use App\Http\Resources\Animales\AnimalHistorialItemResource;
use App\Models\Animal;
use App\Services\AnimalHistorialService;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AnimalHistorialController extends Controller
{
    public function __construct(
        private readonly AnimalHistorialService $animalHistorialService
    ) {}

    public function show(AnimalHistorialRequest $request, Animal $animal): AnonymousResourceCollection
    {
        $this->authorize('view', $animal);

        $historial = $this->animalHistorialService->historial($animal, $request->validated());

        return AnimalHistorialItemResource::collection($historial['data'])
            ->additional(['meta' => $historial['meta']]);
    }
}
