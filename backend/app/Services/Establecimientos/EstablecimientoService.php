<?php

namespace App\Services\Establecimientos;

use App\Models\Establecimiento;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;

class EstablecimientoService
{
    private const SORTABLE_COLUMNS = ['nombre', 'codigo', 'departamento', 'created_at'];

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

    public function find(int $id): Establecimiento
    {
        return Establecimiento::query()->findOrFail($id);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Establecimiento
    {
        return Establecimiento::query()->create($data);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Establecimiento $establecimiento, array $data): Establecimiento
    {
        $establecimiento->update($data);

        return $establecimiento->fresh();
    }

    public function delete(Establecimiento $establecimiento): void
    {
        if ($this->hasPotrerosAsociados($establecimiento)) {
            throw ValidationException::withMessages([
                'establecimiento' => 'No se puede eliminar porque tiene potreros asociados.',
            ]);
        }

        $establecimiento->activo = false;
        $establecimiento->save();
        $establecimiento->delete();
    }

    public function restore(int $id): Establecimiento
    {
        $establecimiento = Establecimiento::onlyTrashed()->findOrFail($id);
        $establecimiento->restore();

        return $establecimiento->fresh();
    }

    public function toggleStatus(Establecimiento $establecimiento): Establecimiento
    {
        $establecimiento->activo = ! $establecimiento->activo;
        $establecimiento->save();

        return $establecimiento->fresh();
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return Builder<Establecimiento>
     */
    private function buildQuery(array $filters, bool $onlyTrashed = false): Builder
    {
        $query = $onlyTrashed
            ? Establecimiento::onlyTrashed()
            : Establecimiento::query();

        if (! empty($filters['search'])) {
            $search = (string) $filters['search'];

            $query->where(function (Builder $builder) use ($search) {
                $builder->where('nombre', 'like', "%{$search}%")
                    ->orWhere('codigo', 'like', "%{$search}%")
                    ->orWhere('propietario', 'like', "%{$search}%")
                    ->orWhere('municipio', 'like', "%{$search}%")
                    ->orWhere('departamento', 'like', "%{$search}%")
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

    private function hasPotrerosAsociados(Establecimiento $establecimiento): bool
    {
        if (! Schema::hasTable('potreros')) {
            return false;
        }

        return DB::table('potreros')
            ->where('establecimiento_id', $establecimiento->id)
            ->whereNull('deleted_at')
            ->exists();
    }
}
