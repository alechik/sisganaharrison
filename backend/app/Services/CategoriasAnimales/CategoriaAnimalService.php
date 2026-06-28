<?php

namespace App\Services\CategoriasAnimales;

use App\Models\CategoriaAnimal;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class CategoriaAnimalService
{
    private const SORTABLE_COLUMNS = ['nombre', 'codigo', 'created_at'];

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

    public function find(int $id): CategoriaAnimal
    {
        return CategoriaAnimal::query()->findOrFail($id);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): CategoriaAnimal
    {
        return CategoriaAnimal::query()->create($data);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(CategoriaAnimal $categoriaAnimal, array $data): CategoriaAnimal
    {
        $categoriaAnimal->update($data);

        return $categoriaAnimal->fresh();
    }

    public function delete(CategoriaAnimal $categoriaAnimal): void
    {
        $categoriaAnimal->activo = false;
        $categoriaAnimal->save();
        $categoriaAnimal->delete();
    }

    public function restore(int $id): CategoriaAnimal
    {
        $categoriaAnimal = CategoriaAnimal::onlyTrashed()->findOrFail($id);
        $categoriaAnimal->restore();

        return $categoriaAnimal->fresh();
    }

    public function toggleStatus(CategoriaAnimal $categoriaAnimal): CategoriaAnimal
    {
        $categoriaAnimal->activo = ! $categoriaAnimal->activo;
        $categoriaAnimal->save();

        return $categoriaAnimal->fresh();
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return Builder<CategoriaAnimal>
     */
    private function buildQuery(array $filters, bool $onlyTrashed = false): Builder
    {
        $query = $onlyTrashed
            ? CategoriaAnimal::onlyTrashed()
            : CategoriaAnimal::query();

        if (! empty($filters['search'])) {
            $search = (string) $filters['search'];

            $query->where(function (Builder $builder) use ($search) {
                $builder->where('nombre', 'like', "%{$search}%")
                    ->orWhere('codigo', 'like', "%{$search}%")
                    ->orWhere('descripcion', 'like', "%{$search}%");
            });
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
