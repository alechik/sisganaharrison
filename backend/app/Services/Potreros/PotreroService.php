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
            ->with('parcela:id,nombre')
            ->findOrFail($id);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Potrero
    {
        $potrero = Potrero::query()->create($data);

        return $potrero->load('parcela:id,nombre');
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Potrero $potrero, array $data): Potrero
    {
        if (array_key_exists('capacidad_animales', $data)) {
            $this->assertCapacidadValida($potrero, (int) $data['capacidad_animales']);
        }

        $potrero->update($data);

        return $potrero->fresh(['parcela:id,nombre']);
    }

    public function delete(Potrero $potrero): void
    {
        if ($this->hasAnimalesAsignados($potrero)) {
            throw ValidationException::withMessages([
                'potrero' => 'No se puede eliminar porque tiene animales asignados.',
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

        return $potrero->fresh(['parcela:id,nombre']);
    }

    public function toggleStatus(Potrero $potrero): Potrero
    {
        $potrero->activo = ! $potrero->activo;
        $potrero->save();

        return $potrero->fresh(['parcela:id,nombre']);
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

        $query->with('parcela:id,nombre');

        if (! empty($filters['search'])) {
            $search = (string) $filters['search'];

            $query->where(function (Builder $builder) use ($search) {
                $builder->where('nombre', 'like', "%{$search}%")
                    ->orWhere('codigo', 'like', "%{$search}%")
                    ->orWhere('observaciones', 'like', "%{$search}%")
                    ->orWhereHas('parcela', function (Builder $parcelaQuery) use ($search) {
                        $parcelaQuery->where('nombre', 'like', "%{$search}%");
                    });
            });
        }

        if (! empty($filters['parcela_id'])) {
            $query->where('parcela_id', (int) $filters['parcela_id']);
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

    private function hasAnimalesAsignados(Potrero $potrero): bool
    {
        if (! Schema::hasTable('animales')) {
            return false;
        }

        return DB::table('animales')
            ->where('potrero_id', $potrero->id)
            ->whereNull('deleted_at')
            ->exists();
    }

    private function assertCapacidadValida(Potrero $potrero, int $capacidad): void
    {
        if (! Schema::hasTable('animales')) {
            return;
        }

        $asignados = DB::table('animales')
            ->where('potrero_id', $potrero->id)
            ->whereNull('deleted_at')
            ->count();

        if ($capacidad < $asignados) {
            throw ValidationException::withMessages([
                'capacidad_animales' => "La capacidad no puede ser menor a los {$asignados} animales asignados.",
            ]);
        }
    }
}
