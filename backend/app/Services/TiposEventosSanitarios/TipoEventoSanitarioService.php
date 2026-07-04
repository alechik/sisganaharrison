<?php

namespace App\Services\TiposEventosSanitarios;

use App\Models\TipoEventoSanitario;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class TipoEventoSanitarioService
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

    public function find(int $id): TipoEventoSanitario
    {
        return TipoEventoSanitario::query()->findOrFail($id);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): TipoEventoSanitario
    {
        return TipoEventoSanitario::query()->create($data);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(TipoEventoSanitario $tipoEventoSanitario, array $data): TipoEventoSanitario
    {
        $tipoEventoSanitario->update($data);

        return $tipoEventoSanitario->fresh();
    }

    public function delete(TipoEventoSanitario $tipoEventoSanitario): void
    {
        $tipoEventoSanitario->activo = false;
        $tipoEventoSanitario->save();
        $tipoEventoSanitario->delete();
    }

    public function restore(int $id): TipoEventoSanitario
    {
        $tipoEventoSanitario = TipoEventoSanitario::onlyTrashed()->findOrFail($id);
        $tipoEventoSanitario->restore();

        return $tipoEventoSanitario->fresh();
    }

    public function toggleStatus(TipoEventoSanitario $tipoEventoSanitario): TipoEventoSanitario
    {
        $tipoEventoSanitario->activo = ! $tipoEventoSanitario->activo;
        $tipoEventoSanitario->save();

        return $tipoEventoSanitario->fresh();
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return Builder<TipoEventoSanitario>
     */
    private function buildQuery(array $filters, bool $onlyTrashed = false): Builder
    {
        $query = $onlyTrashed
            ? TipoEventoSanitario::onlyTrashed()
            : TipoEventoSanitario::query();

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
