<?php

namespace App\Services\Presentaciones;

use App\Models\Presentacion;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Validation\ValidationException;

class PresentacionService
{
    private const SORTABLE_COLUMNS = ['descripcion', 'created_at'];

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

    public function find(int $id): Presentacion
    {
        return Presentacion::query()->findOrFail($id);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Presentacion
    {
        return Presentacion::query()->create($data);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Presentacion $presentacion, array $data): Presentacion
    {
        $presentacion->update($data);

        return $presentacion->fresh();
    }

    public function delete(Presentacion $presentacion): void
    {
        if ($presentacion->medicamentos()->exists()) {
            throw ValidationException::withMessages([
                'presentacion' => 'No se puede eliminar la presentación porque está asociada a medicamentos.',
            ]);
        }

        $presentacion->delete();
    }

    public function restore(int $id): Presentacion
    {
        $presentacion = Presentacion::onlyTrashed()->findOrFail($id);
        $presentacion->restore();

        return $presentacion->fresh();
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return Builder<Presentacion>
     */
    private function buildQuery(array $filters, bool $onlyTrashed = false): Builder
    {
        $query = $onlyTrashed
            ? Presentacion::onlyTrashed()
            : Presentacion::query();

        if (! empty($filters['search'])) {
            $search = (string) $filters['search'];
            $query->where('descripcion', 'ilike', '%'.$search.'%');
        }

        $sortBy = in_array($filters['sort_by'] ?? '', self::SORTABLE_COLUMNS, true)
            ? $filters['sort_by']
            : 'descripcion';

        $sortDir = strtolower((string) ($filters['sort_dir'] ?? 'asc')) === 'desc' ? 'desc' : 'asc';

        return $query->orderBy($sortBy, $sortDir);
    }
}
