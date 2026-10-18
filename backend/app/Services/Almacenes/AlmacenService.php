<?php

namespace App\Services\Almacenes;

use App\Models\Almacen;
use App\Models\Establecimiento;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Validation\ValidationException;

class AlmacenService
{
    private const SORTABLE_COLUMNS = ['nombre', 'created_at'];

    /**
     * @param  array<string, mixed>  $filters
     */
    public function paginate(array $filters = []): LengthAwarePaginator
    {
        return $this->buildQuery($filters)->paginate((int) ($filters['per_page'] ?? 10));
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function paginateDeleted(array $filters = []): LengthAwarePaginator
    {
        return $this->buildQuery($filters, true)->paginate((int) ($filters['per_page'] ?? 10));
    }

    public function find(int $id): Almacen
    {
        return Almacen::query()->with('establecimiento:id,codigo,nombre')->findOrFail($id);
    }

    public function asegurarParaEstablecimiento(Establecimiento $establecimiento): Almacen
    {
        return Almacen::query()->firstOrCreate(
            ['establecimiento_id' => $establecimiento->id],
            [
                'nombre' => 'Almacén '.$establecimiento->nombre,
                'direccion' => $establecimiento->direccion,
                'observacion' => 'Almacén principal de la estancia',
                'activo' => true,
            ]
        );
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Almacen
    {
        $this->assertEstablecimientoLibre((int) $data['establecimiento_id']);

        return Almacen::query()->create($data)->load('establecimiento:id,codigo,nombre');
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Almacen $almacen, array $data): Almacen
    {
        if ((int) $data['establecimiento_id'] !== (int) $almacen->establecimiento_id) {
            $this->assertEstablecimientoLibre((int) $data['establecimiento_id'], $almacen->id);
        }
        $almacen->update($data);

        return $almacen->fresh(['establecimiento:id,codigo,nombre']);
    }

    public function delete(Almacen $almacen): void
    {
        if ($almacen->existencias()->where('stock', '>', 0)->exists()) {
            throw ValidationException::withMessages([
                'almacen' => 'No se puede eliminar un almacén con existencias.',
            ]);
        }
        $almacen->activo = false;
        $almacen->save();
        $almacen->delete();
    }

    public function restore(int $id): Almacen
    {
        $almacen = Almacen::onlyTrashed()->findOrFail($id);
        $this->assertEstablecimientoLibre((int) $almacen->establecimiento_id, $almacen->id);
        $almacen->restore();

        return $almacen->fresh(['establecimiento:id,codigo,nombre']);
    }

    public function toggleStatus(Almacen $almacen): Almacen
    {
        $almacen->activo = ! $almacen->activo;
        $almacen->save();

        return $almacen->fresh(['establecimiento:id,codigo,nombre']);
    }

    private function assertEstablecimientoLibre(int $establecimientoId, ?int $ignoreId = null): void
    {
        $query = Almacen::query()->where('establecimiento_id', $establecimientoId);
        if ($ignoreId) {
            $query->where('id', '!=', $ignoreId);
        }
        if ($query->exists()) {
            throw ValidationException::withMessages([
                'establecimiento_id' => 'La estancia ya tiene un almacén asignado.',
            ]);
        }
        $existe = Establecimiento::query()->whereKey($establecimientoId)->whereNull('deleted_at')->exists();
        if (! $existe) {
            throw ValidationException::withMessages([
                'establecimiento_id' => 'La estancia seleccionada no existe.',
            ]);
        }
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return Builder<Almacen>
     */
    private function buildQuery(array $filters, bool $onlyTrashed = false): Builder
    {
        $query = $onlyTrashed ? Almacen::onlyTrashed() : Almacen::query();
        $query->with('establecimiento:id,codigo,nombre');

        if (! empty($filters['search'])) {
            $search = (string) $filters['search'];
            $query->where(function (Builder $builder) use ($search) {
                $builder->where('nombre', 'ilike', '%'.$search.'%')
                    ->orWhereHas('establecimiento', fn (Builder $q) => $q->where('nombre', 'ilike', '%'.$search.'%')->orWhere('codigo', 'ilike', '%'.$search.'%'));
            });
        }
        if (! empty($filters['establecimiento_id'])) {
            $query->where('establecimiento_id', (int) $filters['establecimiento_id']);
        }
        if (array_key_exists('activo', $filters) && $filters['activo'] !== null && $filters['activo'] !== '') {
            $query->where('activo', filter_var($filters['activo'], FILTER_VALIDATE_BOOLEAN));
        }
        $sortBy = in_array($filters['sort_by'] ?? '', self::SORTABLE_COLUMNS, true) ? $filters['sort_by'] : 'nombre';
        $sortDir = strtolower((string) ($filters['sort_dir'] ?? 'asc')) === 'desc' ? 'desc' : 'asc';

        return $query->orderBy($sortBy, $sortDir);
    }
}
