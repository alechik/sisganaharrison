<?php

namespace App\Http\Controllers\Api\Inventario;

use App\Http\Controllers\Controller;
use App\Http\Resources\Inventario\AlmacenProductoResource;
use App\Http\Resources\Inventario\MovimientoInventarioResource;
use App\Models\MovimientoInventario;
use App\Services\Inventario\MovimientoInventarioConsultaService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class MovimientoInventarioController extends Controller
{
    public function __construct(private readonly MovimientoInventarioConsultaService $service) {}

    public function stock(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', MovimientoInventario::class);

        return AlmacenProductoResource::collection($this->service->paginateStock($request->all()));
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', MovimientoInventario::class);

        return MovimientoInventarioResource::collection($this->service->paginateMovimientos($request->all()));
    }
}
