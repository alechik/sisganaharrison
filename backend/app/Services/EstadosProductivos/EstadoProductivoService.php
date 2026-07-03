<?php

namespace App\Services\EstadosProductivos;

use App\Models\EstadoProductivo;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class EstadoProductivoService
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

    public function find(int $id): EstadoProductivo
    {
        return EstadoProductivo::query()->findOrFail($id);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): EstadoProductivo
    {
        return EstadoProductivo::query()->create($data);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(EstadoProductivo $estadoProductivo, array $data): EstadoProductivo
    {
        $estadoProductivo->update($data);

        return $estadoProductivo->fresh();
    }

    public function delete(EstadoProductivo $estadoProductivo): void
    {
        $estadoProductivo->activo = false;
        $estadoProductivo->save();
        $estadoProductivo->delete();
    }

    public function restore(int $id): EstadoProductivo
    {
        $estadoProductivo = EstadoProductivo::onlyTrashed()->findOrFail($id);
        $estadoProductivo->restore();

        return $estadoProductivo->fresh();
    }

    public function toggleStatus(EstadoProductivo $estadoProductivo): EstadoProductivo
    {
        $estadoProductivo->activo = ! $estadoProductivo->activo;
        $estadoProductivo->save();

        return $estadoProductivo->fresh();
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return Builder<EstadoProductivo>
     */
    private function buildQuery(array $filters, bool $onlyTrashed = false): Builder
    {
        $query = $onlyTrashed
            ? EstadoProductivo::onlyTrashed()
            : EstadoProductivo::query();

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
