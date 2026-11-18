<?php

namespace App\Services\Productos;

use App\Models\Producto;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Validation\ValidationException;

class ProductoService
{
    private const RELATIONS = [
        'presentacion:id,nombre',
        'subcategoria:id,nombre,categoria_producto_id',
        'subcategoria.categoria:id,nombre',
    ];

    private const SORTABLE_COLUMNS = ['nombre', 'codigo', 'nombre_cientifico', 'precio', 'created_at'];

    /**
     * @param  array<string, mixed>  $filters
     */
    public function paginate(array $filters = []): LengthAwarePaginator
    {
        return $this->buildQuery($filters)
            ->paginate((int) ($filters['per_page'] ?? 10));
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function paginateDeleted(array $filters = []): LengthAwarePaginator
    {
        return $this->buildQuery($filters, onlyTrashed: true)
            ->paginate((int) ($filters['per_page'] ?? 10));
    }

    public function find(int $id): Producto
    {
        return Producto::query()
            ->with(self::RELATIONS)
            ->findOrFail($id);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Producto
    {
        return Producto::query()
            ->create($data)
            ->load(self::RELATIONS);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Producto $producto, array $data): Producto
    {
        $producto->update($data);

        return $producto->fresh(self::RELATIONS);
    }

    public function delete(Producto $producto): void
    {
        if ($producto->detallesEvento()->exists()) {
            throw ValidationException::withMessages([
                'producto' => 'No se puede eliminar el producto porque está asociado a eventos sanitarios.',
            ]);
        }

        $producto->activo = false;
        $producto->save();
        $producto->delete();
    }

    public function restore(int $id): Producto
    {
        $producto = Producto::onlyTrashed()->findOrFail($id);
        $producto->restore();

        return $producto->fresh(self::RELATIONS);
    }

    public function toggleStatus(Producto $producto): Producto
    {
        $producto->activo = ! $producto->activo;
        $producto->save();

        return $producto->fresh(self::RELATIONS);
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return Builder<Producto>
     */
    private function buildQuery(array $filters, bool $onlyTrashed = false): Builder
    {
        $query = $onlyTrashed
            ? Producto::onlyTrashed()->with(self::RELATIONS)
            : Producto::query()->with(self::RELATIONS);

        if (! empty($filters['search'])) {
            $search = (string) $filters['search'];

            $query->where(function (Builder $builder) use ($search) {
                $builder->where('nombre', 'ilike', '%'.$search.'%')
                    ->orWhere('codigo', 'ilike', '%'.$search.'%')
                    ->orWhere('nombre_cientifico', 'ilike', '%'.$search.'%')
                    ->orWhere('descripcion', 'ilike', '%'.$search.'%');
            });
        }

        if (! empty($filters['presentacion_id'])) {
            $query->where('presentacion_id', (int) $filters['presentacion_id']);
        }

        if (! empty($filters['subcategoria_producto_id'])) {
            $query->where('subcategoria_producto_id', (int) $filters['subcategoria_producto_id']);
        }

        if (! empty($filters['categoria_producto_id'])) {
            $query->whereHas(
                'subcategoria',
                fn (Builder $builder) => $builder->where('categoria_producto_id', (int) $filters['categoria_producto_id'])
            );
        }

        if (array_key_exists('activo', $filters) && $filters['activo'] !== null && $filters['activo'] !== '') {
            $query->where('activo', filter_var($filters['activo'], FILTER_VALIDATE_BOOLEAN));
        }

        $sortBy = in_array($filters['sort_by'] ?? '', self::SORTABLE_COLUMNS, true)
            ? $filters['sort_by']
            : 'nombre';

        $sortDir = strtolower((string) ($filters['sort_dir'] ?? 'asc')) === 'desc' ? 'desc' : 'asc';

        return $query->orderBy($sortBy, $sortDir);
    }
}
