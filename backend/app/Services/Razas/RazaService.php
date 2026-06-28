<?php

namespace App\Services\Razas;

use App\Models\Raza;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class RazaService
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

    public function find(int $id): Raza
    {
        return Raza::query()->findOrFail($id);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Raza
    {
        return Raza::query()->create($data);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Raza $raza, array $data): Raza
    {
        $raza->update($data);

        return $raza->fresh();
    }

    public function delete(Raza $raza): void
    {
        $raza->estado = false;
        $raza->save();
        $raza->delete();
    }

    public function restore(int $id): Raza
    {
        $raza = Raza::onlyTrashed()->findOrFail($id);
        $raza->restore();

        return $raza->fresh();
    }

    public function toggleStatus(Raza $raza): Raza
    {
        $raza->estado = ! $raza->estado;
        $raza->save();

        return $raza->fresh();
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return Builder<Raza>
     */
    private function buildQuery(array $filters, bool $onlyTrashed = false): Builder
    {
        $query = $onlyTrashed
            ? Raza::onlyTrashed()
            : Raza::query();

        if (! empty($filters['search'])) {
            $search = (string) $filters['search'];

            $query->where(function (Builder $builder) use ($search) {
                $builder->where('nombre', 'like', "%{$search}%")
                    ->orWhere('codigo', 'like', "%{$search}%")
                    ->orWhere('descripcion', 'like', "%{$search}%");
            });
        }

        if (array_key_exists('estado', $filters) && $filters['estado'] !== null && $filters['estado'] !== '') {
            $query->where('estado', filter_var($filters['estado'], FILTER_VALIDATE_BOOLEAN));
        }

        $sortBy = in_array($filters['sort_by'] ?? '', self::SORTABLE_COLUMNS, true)
            ? $filters['sort_by']
            : 'nombre';

        $sortDir = strtolower((string) ($filters['sort_dir'] ?? 'asc')) === 'desc' ? 'desc' : 'asc';

        return $query->orderBy($sortBy, $sortDir);
    }
}
