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
                'almacen:id,nombre,establecimiento_id',
                'almacen.establecimiento:id,nombre,codigo',
                'medicamento:id,codigo,nombre,precio,presentacion_id,subcategoria_producto_id',
                'medicamento.presentacion:id,descripcion',
                'medicamento.subcategoria:id,nombre,categoria_producto_id',
                'medicamento.subcategoria.categoria:id,nombre',
            ]);

        if (! empty($filters['almacen_id'])) {
            $query->where('almacen_id', (int) $filters['almacen_id']);
        }
        if (! empty($filters['medicamento_id'])) {
            $query->where('medicamento_id', (int) $filters['medicamento_id']);
        }
        if (! empty($filters['search'])) {
            $search = (string) $filters['search'];
            $query->whereHas(
                'medicamento',
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
                'medicamento:id,codigo,nombre,precio',
                'usuario:id,nombre,apellido',
            ]);

        if (! empty($filters['almacen_id'])) {
            $query->where('almacen_id', (int) $filters['almacen_id']);
        }
        if (! empty($filters['medicamento_id'])) {
            $query->where('medicamento_id', (int) $filters['medicamento_id']);
        }
        if (! empty($filters['tipo'])) {
            $query->where('tipo', $filters['tipo']);
        }
        if (! empty($filters['search'])) {
            $search = (string) $filters['search'];
            $query->where(function (Builder $builder) use ($search) {
                $builder->where('observaciones', 'ilike', '%'.$search.'%')
                    ->orWhere('origen_type', 'ilike', '%'.$search.'%')
                    ->orWhereHas('medicamento', fn (Builder $q) => $q->where('nombre', 'ilike', '%'.$search.'%')->orWhere('codigo', 'ilike', '%'.$search.'%'));
            });
        }

        return $query->orderByDesc('id')->paginate((int) ($filters['per_page'] ?? 15));
    }
}
