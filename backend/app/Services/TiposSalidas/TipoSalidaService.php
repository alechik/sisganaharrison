<?php

namespace App\Services\TiposSalidas;

use App\Models\TipoSalida;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;

class TipoSalidaService
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

    public function find(int $id): TipoSalida
    {
        return TipoSalida::query()->findOrFail($id);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): TipoSalida
    {
        return TipoSalida::query()->create($data);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(TipoSalida $tipoSalida, array $data): TipoSalida
    {
        $tipoSalida->update($data);

        return $tipoSalida->fresh();
    }

    public function delete(TipoSalida $tipoSalida): void
    {
        $this->assertSinRelaciones($tipoSalida);
        $tipoSalida->delete();
    }

    public function restore(int $id): TipoSalida
    {
        $tipoSalida = TipoSalida::onlyTrashed()->findOrFail($id);
        $tipoSalida->restore();

        return $tipoSalida->fresh();
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return Builder<TipoSalida>
     */
    private function buildQuery(array $filters, bool $onlyTrashed = false): Builder
    {
        $query = $onlyTrashed
            ? TipoSalida::onlyTrashed()
            : TipoSalida::query();

        if (! empty($filters['search'])) {
            $search = (string) $filters['search'];
            $query->where('nombre', 'like', "%{$search}%");
        }

        $sortBy = in_array($filters['sort_by'] ?? '', self::SORTABLE_COLUMNS, true)
            ? $filters['sort_by']
            : 'nombre';

        $sortDir = strtolower((string) ($filters['sort_dir'] ?? 'asc')) === 'desc' ? 'desc' : 'asc';

        return $query->orderBy($sortBy, $sortDir);
    }

    private function assertSinRelaciones(TipoSalida $tipoSalida): void
    {
        if (! Schema::hasTable('salidas')) {
            return;
        }

        $enUso = DB::table('salidas')->where('tipo_salida_id', $tipoSalida->id)->exists();

        if ($enUso) {
            throw ValidationException::withMessages([
                'tipo_salida' => 'No se puede eliminar el tipo porque está asociado a salidas.',
            ]);
        }
    }
}
