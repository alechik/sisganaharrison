<?php

namespace App\Services\Potreros;

use App\Models\Potrero;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;

class PotreroService
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

    public function find(int $id): Potrero
    {
        return Potrero::query()
            ->with('establecimiento:id,nombre')
            ->findOrFail($id);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Potrero
    {
        $potrero = Potrero::query()->create($data);

        return $potrero->load('establecimiento:id,nombre');
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Potrero $potrero, array $data): Potrero
    {
        $potrero->update($data);

        return $potrero->fresh(['establecimiento:id,nombre']);
    }

    public function delete(Potrero $potrero): void
    {
        if ($this->hasLotesAsociados($potrero)) {
            throw ValidationException::withMessages([
                'potrero' => 'No se puede eliminar porque tiene lotes asociados.',
            ]);
        }

        $potrero->activo = false;
        $potrero->save();
        $potrero->delete();
    }

    public function restore(int $id): Potrero
    {
        $potrero = Potrero::onlyTrashed()->findOrFail($id);
        $potrero->restore();

        return $potrero->fresh(['establecimiento:id,nombre']);
    }

    public function toggleStatus(Potrero $potrero): Potrero
    {
        $potrero->activo = ! $potrero->activo;
        $potrero->save();

        return $potrero->fresh(['establecimiento:id,nombre']);
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return Builder<Potrero>
     */
    private function buildQuery(array $filters, bool $onlyTrashed = false): Builder
    {
        $query = $onlyTrashed
            ? Potrero::onlyTrashed()
            : Potrero::query();

        $query->with('establecimiento:id,nombre');

        if (! empty($filters['search'])) {
            $search = (string) $filters['search'];

            $query->where(function (Builder $builder) use ($search) {
                $builder->where('nombre', 'like', "%{$search}%")
                    ->orWhere('codigo', 'like', "%{$search}%")
                    ->orWhere('tipo_pasto', 'like', "%{$search}%")
                    ->orWhere('descripcion', 'like', "%{$search}%")
                    ->orWhereHas('establecimiento', function (Builder $establecimientoQuery) use ($search) {
                        $establecimientoQuery->where('nombre', 'like', "%{$search}%");
                    });
            });
        }

        if (! empty($filters['establecimiento_id'])) {
            $query->where('establecimiento_id', (int) $filters['establecimiento_id']);
        }

        if (array_key_exists('activo', $filters) && $filters['activo'] !== null && $filters['activo'] !== '') {
            $query->where('activo', filter_var($filters['activo'], FILTER_VALIDATE_BOOLEAN));
        }

        if (array_key_exists('disponibilidad', $filters) && $filters['disponibilidad'] !== null && $filters['disponibilidad'] !== '') {
            $query->where('disponibilidad', filter_var($filters['disponibilidad'], FILTER_VALIDATE_BOOLEAN));
        }

        $sortBy = in_array($filters['sort_by'] ?? '', self::SORTABLE_COLUMNS, true)
            ? $filters['sort_by']
            : 'nombre';

        $sortDir = strtolower((string) ($filters['sort_dir'] ?? 'asc')) === 'desc' ? 'desc' : 'asc';

        return $query->orderBy($sortBy, $sortDir);
    }

    private function hasLotesAsociados(Potrero $potrero): bool
    {
        if (! Schema::hasTable('lotes')) {
            return false;
        }

        return DB::table('lotes')
            ->where('potrero_id', $potrero->id)
            ->whereNull('deleted_at')
            ->exists();
    }
}
