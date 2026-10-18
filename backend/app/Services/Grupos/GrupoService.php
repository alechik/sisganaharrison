<?php

namespace App\Services\Grupos;

use App\Models\Grupo;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class GrupoService
{
    private const SORTABLE_COLUMNS = ['nombre', 'created_at'];

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

    public function find(int $id): Grupo
    {
        return Grupo::query()
            ->with('lote:id,nombre,codigo')
            ->findOrFail($id);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Grupo
    {
        $grupo = Grupo::query()->create($data);

        return $grupo->load('lote:id,nombre,codigo');
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Grupo $grupo, array $data): Grupo
    {
        $grupo->update($data);

        return $grupo->fresh(['lote:id,nombre,codigo']);
    }

    public function delete(Grupo $grupo): void
    {
        if (DB::table('animales')->where('grupo_id', $grupo->id)->whereNull('deleted_at')->exists()) {
            throw ValidationException::withMessages([
                'grupo' => 'No se puede eliminar porque tiene animales asignados.',
            ]);
        }

        $grupo->activo = false;
        $grupo->save();
        $grupo->delete();
    }

    public function restore(int $id): Grupo
    {
        $grupo = Grupo::onlyTrashed()->findOrFail($id);
        $grupo->restore();

        return $grupo->fresh(['lote:id,nombre,codigo']);
    }

    public function toggleStatus(Grupo $grupo): Grupo
    {
        $grupo->activo = ! $grupo->activo;
        $grupo->save();

        return $grupo->fresh(['lote:id,nombre,codigo']);
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return Builder<Grupo>
     */
    private function buildQuery(array $filters, bool $onlyTrashed = false): Builder
    {
        $query = $onlyTrashed
            ? Grupo::onlyTrashed()
            : Grupo::query();

        $query->with('lote:id,nombre,codigo');

        if (! empty($filters['search'])) {
            $search = (string) $filters['search'];
            $query->where(function (Builder $builder) use ($search) {
                $builder->where('nombre', 'ilike', "%{$search}%")
                    ->orWhere('observaciones', 'ilike', "%{$search}%")
                    ->orWhereHas('lote', function (Builder $loteQuery) use ($search) {
                        $loteQuery->where('nombre', 'ilike', "%{$search}%")
                            ->orWhere('codigo', 'ilike', "%{$search}%");
                    });
            });
        }

        if (! empty($filters['lote_id'])) {
            $query->where('lote_id', (int) $filters['lote_id']);
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
