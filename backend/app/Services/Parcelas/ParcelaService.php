<?php

namespace App\Services\Parcelas;

use App\Models\Parcela;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;

class ParcelaService
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

    public function find(int $id): Parcela
    {
        return Parcela::query()
            ->with('estancia:id,nombre')
            ->findOrFail($id);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Parcela
    {
        $parcela = Parcela::query()->create($data);

        return $parcela->load('estancia:id,nombre');
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Parcela $parcela, array $data): Parcela
    {
        $parcela->update($data);

        return $parcela->fresh(['estancia:id,nombre']);
    }

    public function delete(Parcela $parcela): void
    {
        if ($this->hasPotrerosAsociados($parcela)) {
            throw ValidationException::withMessages([
                'parcela' => 'No se puede eliminar porque tiene potreros asociados.',
            ]);
        }

        $parcela->activo = false;
        $parcela->save();
        $parcela->delete();
    }

    public function restore(int $id): Parcela
    {
        $parcela = Parcela::onlyTrashed()->findOrFail($id);
        $parcela->restore();

        return $parcela->fresh(['estancia:id,nombre']);
    }

    public function toggleStatus(Parcela $parcela): Parcela
    {
        $parcela->activo = ! $parcela->activo;
        $parcela->save();

        return $parcela->fresh(['estancia:id,nombre']);
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return Builder<Parcela>
     */
    private function buildQuery(array $filters, bool $onlyTrashed = false): Builder
    {
        $query = $onlyTrashed
            ? Parcela::onlyTrashed()
            : Parcela::query();

        $query->with('estancia:id,nombre');

        if (! empty($filters['search'])) {
            $search = (string) $filters['search'];

            $query->where(function (Builder $builder) use ($search) {
                $builder->where('nombre', 'like', "%{$search}%")
                    ->orWhere('codigo', 'like', "%{$search}%")
                    ->orWhere('tipo_pasto', 'like', "%{$search}%")
                    ->orWhere('descripcion', 'like', "%{$search}%")
                    ->orWhereHas('estancia', function (Builder $estanciaQuery) use ($search) {
                        $estanciaQuery->where('nombre', 'like', "%{$search}%");
                    });
            });
        }

        if (! empty($filters['estancia_id'])) {
            $query->where('estancia_id', (int) $filters['estancia_id']);
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

    private function hasPotrerosAsociados(Parcela $parcela): bool
    {
        if (! Schema::hasTable('potreros')) {
            return false;
        }

        return DB::table('potreros')
            ->where('parcela_id', $parcela->id)
            ->whereNull('deleted_at')
            ->exists();
    }
}
