<?php

namespace App\Services\Inventario;

use App\Models\AlmacenProducto;
use App\Models\MovimientoInventario;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class MovimientoInventarioConsultaService
{
    /**
     * @param  array<string, mixed>  $filters
     */
    public function paginateStock(array $filters = []): LengthAwarePaginator
    {
        $query = AlmacenProducto::query()
            ->with([
                'almacen:id,nombre,estancia_id',
                'almacen.estancia:id,nombre,codigo',
                'producto:id,codigo,nombre,precio,presentacion_id,subcategoria_producto_id',
                'producto.presentacion:id,nombre',
                'producto.subcategoria:id,nombre,categoria_producto_id',
                'producto.subcategoria.categoria:id,nombre',
            ]);

        if (! empty($filters['almacen_id'])) {
            $query->where('almacen_id', (int) $filters['almacen_id']);
        }
        if (! empty($filters['producto_id'])) {
            $query->where('producto_id', (int) $filters['producto_id']);
        }
        if (! empty($filters['search'])) {
            $search = (string) $filters['search'];
            $query->whereHas(
                'producto',
                fn (Builder $q) => $q->where('nombre', 'ilike', '%'.$search.'%')->orWhere('codigo', 'ilike', '%'.$search.'%')
            );
        }

        return $query->orderByDesc('updated_at')->paginate((int) ($filters['per_page'] ?? 10));
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function paginateMovimientos(array $filters = []): LengthAwarePaginator
    {
        $query = MovimientoInventario::query()
            ->with([
                'almacen:id,nombre',
                'producto:id,codigo,nombre,precio',
                'usuario:id,nombre,apellido',
            ]);

        if (! empty($filters['almacen_id'])) {
            $query->where('almacen_id', (int) $filters['almacen_id']);
        }
        if (! empty($filters['producto_id'])) {
            $query->where('producto_id', (int) $filters['producto_id']);
        }
        if (! empty($filters['tipo'])) {
            $query->where('tipo', $filters['tipo']);
        }
        if (! empty($filters['search'])) {
            $search = (string) $filters['search'];
            $query->where(function (Builder $builder) use ($search) {
                $builder->where('observaciones', 'ilike', '%'.$search.'%')
                    ->orWhere('origen_type', 'ilike', '%'.$search.'%')
                    ->orWhereHas('producto', fn (Builder $q) => $q->where('nombre', 'ilike', '%'.$search.'%')->orWhere('codigo', 'ilike', '%'.$search.'%'));
            });
        }

        return $query->orderByDesc('id')->paginate((int) ($filters['per_page'] ?? 15));
    }
}
