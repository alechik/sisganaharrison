<?php

namespace App\Services\TiposMovimientos;

use App\Models\TipoMovimiento;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class TipoMovimientoService
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

    public function find(int $id): TipoMovimiento
    {
        return TipoMovimiento::query()->findOrFail($id);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): TipoMovimiento
    {
        return TipoMovimiento::query()->create($data);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(TipoMovimiento $tipoMovimiento, array $data): TipoMovimiento
    {
        $tipoMovimiento->update($data);

        return $tipoMovimiento->fresh();
    }

    public function delete(TipoMovimiento $tipoMovimiento): void
    {
        $tipoMovimiento->activo = false;
        $tipoMovimiento->save();
        $tipoMovimiento->delete();
    }

    public function restore(int $id): TipoMovimiento
    {
        $tipoMovimiento = TipoMovimiento::onlyTrashed()->findOrFail($id);
        $tipoMovimiento->restore();

        return $tipoMovimiento->fresh();
    }

    public function toggleStatus(TipoMovimiento $tipoMovimiento): TipoMovimiento
    {
        $tipoMovimiento->activo = ! $tipoMovimiento->activo;
        $tipoMovimiento->save();

        return $tipoMovimiento->fresh();
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return Builder<TipoMovimiento>
     */
    private function buildQuery(array $filters, bool $onlyTrashed = false): Builder
    {
        $query = $onlyTrashed
            ? TipoMovimiento::onlyTrashed()
            : TipoMovimiento::query();

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
