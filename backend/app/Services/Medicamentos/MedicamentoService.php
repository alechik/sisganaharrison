<?php

namespace App\Services\Medicamentos;

use App\Models\Medicamento;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Validation\ValidationException;

class MedicamentoService
{
    private const SORTABLE_COLUMNS = ['nombre', 'codigo', 'laboratorio', 'precio', 'created_at'];

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

    public function find(int $id): Medicamento
    {
        return Medicamento::query()
            ->with('presentacion:id,descripcion')
            ->findOrFail($id);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Medicamento
    {
        return Medicamento::query()
            ->create($data)
            ->load('presentacion:id,descripcion');
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Medicamento $medicamento, array $data): Medicamento
    {
        $medicamento->update($data);

        return $medicamento->fresh('presentacion:id,descripcion');
    }

    public function delete(Medicamento $medicamento): void
    {
        if ($medicamento->detallesEvento()->exists()) {
            throw ValidationException::withMessages([
                'medicamento' => 'No se puede eliminar el medicamento porque está asociado a eventos sanitarios.',
            ]);
        }

        $medicamento->activo = false;
        $medicamento->save();
        $medicamento->delete();
    }

    public function restore(int $id): Medicamento
    {
        $medicamento = Medicamento::onlyTrashed()->findOrFail($id);
        $medicamento->restore();

        return $medicamento->fresh('presentacion:id,descripcion');
    }

    public function toggleStatus(Medicamento $medicamento): Medicamento
    {
        $medicamento->activo = ! $medicamento->activo;
        $medicamento->save();

        return $medicamento->fresh('presentacion:id,descripcion');
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return Builder<Medicamento>
     */
    private function buildQuery(array $filters, bool $onlyTrashed = false): Builder
    {
        $query = $onlyTrashed
            ? Medicamento::onlyTrashed()->with('presentacion:id,descripcion')
            : Medicamento::query()->with('presentacion:id,descripcion');

        if (! empty($filters['search'])) {
            $search = (string) $filters['search'];

            $query->where(function (Builder $builder) use ($search) {
                $builder->where('nombre', 'ilike', '%'.$search.'%')
                    ->orWhere('codigo', 'ilike', '%'.$search.'%')
                    ->orWhere('laboratorio', 'ilike', '%'.$search.'%')
                    ->orWhere('descripcion', 'ilike', '%'.$search.'%');
            });
        }

        if (! empty($filters['presentacion_id'])) {
            $query->where('presentacion_id', (int) $filters['presentacion_id']);
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
