<?php

namespace App\Services\TiposIngresos;

use App\Models\TipoIngreso;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Validation\ValidationException;

class TipoIngresoService
{
    private const SORTABLE_COLUMNS = ['nombre', 'codigo', 'iniciales', 'created_at'];

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

    public function find(int $id): TipoIngreso
    {
        return TipoIngreso::query()->findOrFail($id);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): TipoIngreso
    {
        $data['requiere_proveedor'] = (bool) ($data['requiere_proveedor'] ?? false);

        return TipoIngreso::query()->create($data);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(TipoIngreso $tipoIngreso, array $data): TipoIngreso
    {
        if (array_key_exists('requiere_proveedor', $data)) {
            $data['requiere_proveedor'] = (bool) $data['requiere_proveedor'];
        }

        $tipoIngreso->update($data);

        return $tipoIngreso->fresh();
    }

    public function delete(TipoIngreso $tipoIngreso): void
    {
        if ($tipoIngreso->ingresos()->exists()) {
            throw ValidationException::withMessages([
                'tipo_ingreso' => 'No se puede eliminar un tipo de ingreso con registros asociados.',
            ]);
        }

        $tipoIngreso->estado = false;
        $tipoIngreso->save();
        $tipoIngreso->delete();
    }

    public function restore(int $id): TipoIngreso
    {
        $tipoIngreso = TipoIngreso::onlyTrashed()->findOrFail($id);
        $tipoIngreso->restore();

        return $tipoIngreso->fresh();
    }

    public function toggleStatus(TipoIngreso $tipoIngreso): TipoIngreso
    {
        $tipoIngreso->estado = ! $tipoIngreso->estado;
        $tipoIngreso->save();

        return $tipoIngreso->fresh();
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return Builder<TipoIngreso>
     */
    private function buildQuery(array $filters, bool $onlyTrashed = false): Builder
    {
        $query = $onlyTrashed
            ? TipoIngreso::onlyTrashed()
            : TipoIngreso::query();

        if (! empty($filters['search'])) {
            $search = (string) $filters['search'];

            $query->where(function (Builder $builder) use ($search) {
                $builder->where('nombre', 'like', "%{$search}%")
                    ->orWhere('codigo', 'like', "%{$search}%")
                    ->orWhere('iniciales', 'like', "%{$search}%")
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
