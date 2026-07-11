<?php

namespace App\Services\Lotes;

use App\Models\Lote;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;

class LoteService
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

    public function find(int $id): Lote
    {
        return Lote::query()
            ->with('potrero:id,nombre')
            ->findOrFail($id);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Lote
    {
        $lote = Lote::query()->create($data);

        return $lote->load('potrero:id,nombre');
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Lote $lote, array $data): Lote
    {
        if (array_key_exists('capacidad_animales', $data)) {
            $this->assertCapacidadValida($lote, (int) $data['capacidad_animales']);
        }

        $lote->update($data);

        return $lote->fresh(['potrero:id,nombre']);
    }

    public function delete(Lote $lote): void
    {
        if ($this->hasAnimalesAsignados($lote)) {
            throw ValidationException::withMessages([
                'lote' => 'No se puede eliminar porque tiene animales asignados.',
            ]);
        }

        $lote->activo = false;
        $lote->save();
        $lote->delete();
    }

    public function restore(int $id): Lote
    {
        $lote = Lote::onlyTrashed()->findOrFail($id);
        $lote->restore();

        return $lote->fresh(['potrero:id,nombre']);
    }

    public function toggleStatus(Lote $lote): Lote
    {
        $lote->activo = ! $lote->activo;
        $lote->save();

        return $lote->fresh(['potrero:id,nombre']);
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return Builder<Lote>
     */
    private function buildQuery(array $filters, bool $onlyTrashed = false): Builder
    {
        $query = $onlyTrashed
            ? Lote::onlyTrashed()
            : Lote::query();

        $query->with('potrero:id,nombre');

        if (! empty($filters['search'])) {
            $search = (string) $filters['search'];

            $query->where(function (Builder $builder) use ($search) {
                $builder->where('nombre', 'like', "%{$search}%")
                    ->orWhere('codigo', 'like', "%{$search}%")
                    ->orWhere('observaciones', 'like', "%{$search}%")
                    ->orWhereHas('potrero', function (Builder $potreroQuery) use ($search) {
                        $potreroQuery->where('nombre', 'like', "%{$search}%");
                    });
            });
        }

        if (! empty($filters['potrero_id'])) {
            $query->where('potrero_id', (int) $filters['potrero_id']);
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

    private function hasAnimalesAsignados(Lote $lote): bool
    {
        if (! Schema::hasTable('animales')) {
            return false;
        }

        return DB::table('animales')
            ->where('lote_id', $lote->id)
            ->whereNull('deleted_at')
            ->exists();
    }

    private function assertCapacidadValida(Lote $lote, int $capacidad): void
    {
        if (! Schema::hasTable('animales')) {
            return;
        }

        $asignados = DB::table('animales')
            ->where('lote_id', $lote->id)
            ->whereNull('deleted_at')
            ->count();

        if ($capacidad < $asignados) {
            throw ValidationException::withMessages([
                'capacidad_animales' => "La capacidad no puede ser menor a los {$asignados} animales asignados.",
            ]);
        }
    }
}
