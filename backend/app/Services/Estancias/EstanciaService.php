<?php

namespace App\Services\Estancias;

use App\Models\Estancia;
use App\Services\Almacenes\AlmacenService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;

class EstanciaService
{
    private const SORTABLE_COLUMNS = ['nombre', 'codigo', 'departamento', 'created_at'];

    public function __construct(
        private readonly AlmacenService $almacenService
    ) {}

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

    public function find(int $id): Estancia
    {
        return Estancia::query()->findOrFail($id);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Estancia
    {
        $estancia = Estancia::query()->create($data);
        $this->almacenService->asegurarParaEstancia($estancia);

        return $estancia->fresh();
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Estancia $estancia, array $data): Estancia
    {
        $estancia->update($data);

        return $estancia->fresh();
    }

    public function delete(Estancia $estancia): void
    {
        if ($this->hasParcelasAsociados($estancia)) {
            throw ValidationException::withMessages([
                'estancia' => 'No se puede eliminar porque tiene parcelas asociadas.',
            ]);
        }

        $estancia->activo = false;
        $estancia->save();
        $estancia->delete();
    }

    public function restore(int $id): Estancia
    {
        $estancia = Estancia::onlyTrashed()->findOrFail($id);
        $estancia->restore();

        return $estancia->fresh();
    }

    public function toggleStatus(Estancia $estancia): Estancia
    {
        $estancia->activo = ! $estancia->activo;
        $estancia->save();

        return $estancia->fresh();
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return Builder<Estancia>
     */
    private function buildQuery(array $filters, bool $onlyTrashed = false): Builder
    {
        $query = $onlyTrashed
            ? Estancia::onlyTrashed()
            : Estancia::query();

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

    private function hasParcelasAsociados(Estancia $estancia): bool
    {
        if (! Schema::hasTable('parcelas')) {
            return false;
        }

        return DB::table('parcelas')
            ->where('estancia_id', $estancia->id)
            ->whereNull('deleted_at')
            ->exists();
    }
}
