<?php

namespace App\Services\Almacenes;

use App\Models\Almacen;
use App\Models\Estancia;
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
        return Almacen::query()->with('estancia:id,codigo,nombre')->findOrFail($id);
    }

    public function asegurarParaEstancia(Estancia $estancia): Almacen
    {
        return Almacen::query()->firstOrCreate(
            ['estancia_id' => $estancia->id],
            [
                'nombre' => 'Almacén '.$estancia->nombre,
                'direccion' => $estancia->direccion,
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
        $this->assertEstanciaLibre((int) $data['estancia_id']);

        return Almacen::query()->create($data)->load('estancia:id,codigo,nombre');
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Almacen $almacen, array $data): Almacen
    {
        if ((int) $data['estancia_id'] !== (int) $almacen->estancia_id) {
            $this->assertEstanciaLibre((int) $data['estancia_id'], $almacen->id);
        }
        $almacen->update($data);

        return $almacen->fresh(['estancia:id,codigo,nombre']);
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
        $this->assertEstanciaLibre((int) $almacen->estancia_id, $almacen->id);
        $almacen->restore();

        return $almacen->fresh(['estancia:id,codigo,nombre']);
    }

    public function toggleStatus(Almacen $almacen): Almacen
    {
        $almacen->activo = ! $almacen->activo;
        $almacen->save();

        return $almacen->fresh(['estancia:id,codigo,nombre']);
    }

    private function assertEstanciaLibre(int $estanciaId, ?int $ignoreId = null): void
    {
        $query = Almacen::query()->where('estancia_id', $estanciaId);
        if ($ignoreId) {
            $query->where('id', '!=', $ignoreId);
        }
        if ($query->exists()) {
            throw ValidationException::withMessages([
                'estancia_id' => 'La estancia ya tiene un almacén asignado.',
            ]);
        }
        $existe = Estancia::query()->whereKey($estanciaId)->whereNull('deleted_at')->exists();
        if (! $existe) {
            throw ValidationException::withMessages([
                'estancia_id' => 'La estancia seleccionada no existe.',
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
        $query->with('estancia:id,codigo,nombre');

        if (! empty($filters['search'])) {
            $search = (string) $filters['search'];
            $query->where(function (Builder $builder) use ($search) {
                $builder->where('nombre', 'ilike', '%'.$search.'%')
                    ->orWhereHas('estancia', fn (Builder $q) => $q->where('nombre', 'ilike', '%'.$search.'%')->orWhere('codigo', 'ilike', '%'.$search.'%'));
            });
        }
        if (! empty($filters['estancia_id'])) {
            $query->where('estancia_id', (int) $filters['estancia_id']);
        }
        if (array_key_exists('activo', $filters) && $filters['activo'] !== null && $filters['activo'] !== '') {
            $query->where('activo', filter_var($filters['activo'], FILTER_VALIDATE_BOOLEAN));
        }
        $sortBy = in_array($filters['sort_by'] ?? '', self::SORTABLE_COLUMNS, true) ? $filters['sort_by'] : 'nombre';
        $sortDir = strtolower((string) ($filters['sort_dir'] ?? 'asc')) === 'desc' ? 'desc' : 'asc';

        return $query->orderBy($sortBy, $sortDir);
    }
}
