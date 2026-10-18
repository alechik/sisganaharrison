<?php

namespace App\Services\CategoriasProductos;

use App\Models\CategoriaProducto;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Validation\ValidationException;

class CategoriaProductoService
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

    public function find(int $id): CategoriaProducto
    {
        return CategoriaProducto::query()->findOrFail($id);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): CategoriaProducto
    {
        return CategoriaProducto::query()->create($data);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(CategoriaProducto $categoria, array $data): CategoriaProducto
    {
        $categoria->update($data);

        return $categoria->fresh();
    }

    public function delete(CategoriaProducto $categoria): void
    {
        if ($categoria->subcategorias()->whereNull('deleted_at')->exists()) {
            throw ValidationException::withMessages([
                'categoria' => 'No se puede eliminar porque tiene subcategorías asociadas.',
            ]);
        }
        $categoria->activo = false;
        $categoria->save();
        $categoria->delete();
    }

    public function restore(int $id): CategoriaProducto
    {
        $categoria = CategoriaProducto::onlyTrashed()->findOrFail($id);
        $categoria->restore();

        return $categoria->fresh();
    }

    public function toggleStatus(CategoriaProducto $categoria): CategoriaProducto
    {
        $categoria->activo = ! $categoria->activo;
        $categoria->save();

        return $categoria->fresh();
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return Builder<CategoriaProducto>
     */
    private function buildQuery(array $filters, bool $onlyTrashed = false): Builder
    {
        $query = $onlyTrashed ? CategoriaProducto::onlyTrashed() : CategoriaProducto::query();

        if (! empty($filters['search'])) {
            $query->where('nombre', 'ilike', '%'.$filters['search'].'%');
        }
        if (array_key_exists('activo', $filters) && $filters['activo'] !== null && $filters['activo'] !== '') {
            $query->where('activo', filter_var($filters['activo'], FILTER_VALIDATE_BOOLEAN));
        }
        $sortBy = in_array($filters['sort_by'] ?? '', self::SORTABLE_COLUMNS, true) ? $filters['sort_by'] : 'nombre';
        $sortDir = strtolower((string) ($filters['sort_dir'] ?? 'asc')) === 'desc' ? 'desc' : 'asc';

        return $query->orderBy($sortBy, $sortDir);
    }
}
