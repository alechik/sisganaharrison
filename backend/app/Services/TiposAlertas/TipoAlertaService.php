<?php

namespace App\Services\TiposAlertas;

use App\Models\TipoAlerta;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class TipoAlertaService
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

    public function find(int $id): TipoAlerta
    {
        return TipoAlerta::query()->findOrFail($id);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): TipoAlerta
    {
        return TipoAlerta::query()->create($data);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(TipoAlerta $tipoAlerta, array $data): TipoAlerta
    {
        $tipoAlerta->update($data);

        return $tipoAlerta->fresh();
    }

    public function delete(TipoAlerta $tipoAlerta): void
    {
        $tipoAlerta->activo = false;
        $tipoAlerta->save();
        $tipoAlerta->delete();
    }

    public function restore(int $id): TipoAlerta
    {
        $tipoAlerta = TipoAlerta::onlyTrashed()->findOrFail($id);
        $tipoAlerta->restore();

        return $tipoAlerta->fresh();
    }

    public function toggleStatus(TipoAlerta $tipoAlerta): TipoAlerta
    {
        $tipoAlerta->activo = ! $tipoAlerta->activo;
        $tipoAlerta->save();

        return $tipoAlerta->fresh();
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return Builder<TipoAlerta>
     */
    private function buildQuery(array $filters, bool $onlyTrashed = false): Builder
    {
        $query = $onlyTrashed
            ? TipoAlerta::onlyTrashed()
            : TipoAlerta::query();

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
