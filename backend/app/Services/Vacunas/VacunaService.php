<?php

namespace App\Services\Vacunas;

use App\Models\Vacuna;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class VacunaService
{
    private const SORTABLE_COLUMNS = ['nombre', 'codigo', 'laboratorio', 'created_at'];

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

    public function find(int $id): Vacuna
    {
        return Vacuna::query()->findOrFail($id);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Vacuna
    {
        return Vacuna::query()->create($data);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Vacuna $vacuna, array $data): Vacuna
    {
        $vacuna->update($data);

        return $vacuna->fresh();
    }

    public function delete(Vacuna $vacuna): void
    {
        $vacuna->activo = false;
        $vacuna->save();
        $vacuna->delete();
    }

    public function restore(int $id): Vacuna
    {
        $vacuna = Vacuna::onlyTrashed()->findOrFail($id);
        $vacuna->restore();

        return $vacuna->fresh();
    }

    public function toggleStatus(Vacuna $vacuna): Vacuna
    {
        $vacuna->activo = ! $vacuna->activo;
        $vacuna->save();

        return $vacuna->fresh();
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return Builder<Vacuna>
     */
    private function buildQuery(array $filters, bool $onlyTrashed = false): Builder
    {
        $query = $onlyTrashed
            ? Vacuna::onlyTrashed()
            : Vacuna::query();

        if (! empty($filters['search'])) {
            $search = (string) $filters['search'];

            $query->where(function (Builder $builder) use ($search) {
                $builder->where('nombre', 'like', "%{$search}%")
                    ->orWhere('codigo', 'like', "%{$search}%")
                    ->orWhere('laboratorio', 'like', "%{$search}%")
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
