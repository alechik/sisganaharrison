<?php

namespace App\Services\SubcategoriasProductos;

use App\Models\CategoriaProducto;
use App\Models\SubcategoriaProducto;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Validation\ValidationException;

class SubcategoriaProductoService
{
    private const SORTABLE_COLUMNS = ['nombre', 'created_at'];

    /**
     * @param  array<string, mixed>  $filters
     */
    public function paginate(array $filters = []): LengthAwarePaginator
    {
        return $this->buildQuery($filters)->paginate((int) ($filters['per_page'] ?? 10));
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function paginateDeleted(array $filters = []): LengthAwarePaginator
    {
        return $this->buildQuery($filters, true)->paginate((int) ($filters['per_page'] ?? 10));
    }

    public function find(int $id): SubcategoriaProducto
    {
        return SubcategoriaProducto::query()->with('categoria:id,nombre')->findOrFail($id);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): SubcategoriaProducto
    {
        $this->assertCategoria((int) $data['categoria_producto_id']);

        return SubcategoriaProducto::query()->create($data)->load('categoria:id,nombre');
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(SubcategoriaProducto $subcategoria, array $data): SubcategoriaProducto
    {
        $this->assertCategoria((int) $data['categoria_producto_id']);
        $subcategoria->update($data);

        return $subcategoria->fresh(['categoria:id,nombre']);
    }

    public function delete(SubcategoriaProducto $subcategoria): void
    {
        if ($subcategoria->medicamentos()->whereNull('deleted_at')->exists()) {
            throw ValidationException::withMessages([
                'subcategoria' => 'No se puede eliminar porque tiene productos asociados.',
            ]);
        }
        $subcategoria->activo = false;
        $subcategoria->save();
        $subcategoria->delete();
    }

    public function restore(int $id): SubcategoriaProducto
    {
        $subcategoria = SubcategoriaProducto::onlyTrashed()->findOrFail($id);
        $subcategoria->restore();

        return $subcategoria->fresh(['categoria:id,nombre']);
    }

    public function toggleStatus(SubcategoriaProducto $subcategoria): SubcategoriaProducto
    {
        $subcategoria->activo = ! $subcategoria->activo;
        $subcategoria->save();

        return $subcategoria->fresh(['categoria:id,nombre']);
    }

    private function assertCategoria(int $id): void
    {
        $ok = CategoriaProducto::query()->whereKey($id)->where('activo', true)->whereNull('deleted_at')->exists();
        if (! $ok) {
            throw ValidationException::withMessages([
                'categoria_producto_id' => 'La categoría seleccionada no existe o no está activa.',
            ]);
        }
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return Builder<SubcategoriaProducto>
     */
    private function buildQuery(array $filters, bool $onlyTrashed = false): Builder
    {
        $query = $onlyTrashed ? SubcategoriaProducto::onlyTrashed() : SubcategoriaProducto::query();
        $query->with('categoria:id,nombre');

        if (! empty($filters['search'])) {
            $search = (string) $filters['search'];
            $query->where(function (Builder $builder) use ($search) {
                $builder->where('nombre', 'ilike', '%'.$search.'%')
                    ->orWhereHas('categoria', fn (Builder $q) => $q->where('nombre', 'ilike', '%'.$search.'%'));
            });
        }
        if (! empty($filters['categoria_producto_id'])) {
            $query->where('categoria_producto_id', (int) $filters['categoria_producto_id']);
        }
        if (array_key_exists('activo', $filters) && $filters['activo'] !== null && $filters['activo'] !== '') {
            $query->where('activo', filter_var($filters['activo'], FILTER_VALIDATE_BOOLEAN));
        }
        $sortBy = in_array($filters['sort_by'] ?? '', self::SORTABLE_COLUMNS, true) ? $filters['sort_by'] : 'nombre';
        $sortDir = strtolower((string) ($filters['sort_dir'] ?? 'asc')) === 'desc' ? 'desc' : 'asc';

        return $query->orderBy($sortBy, $sortDir);
    }
}
