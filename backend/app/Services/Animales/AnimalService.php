<?php

namespace App\Services\Animales;

use App\Models\Animal;
use App\Models\Lote;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Validation\ValidationException;

class AnimalService
{
    private const SORTABLE_COLUMNS = ['nombre', 'codigo', 'fecha_nacimiento', 'created_at'];

    private const RELATIONS = [
        'raza:id,nombre',
        'categoria:id,nombre',
        'estadoProductivo:id,nombre',
        'lote:id,nombre',
        'madre:id,nombre,codigo',
        'padre:id,nombre,codigo',
    ];

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

    public function find(int $id): Animal
    {
        return Animal::query()
            ->with(self::RELATIONS)
            ->findOrFail($id);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Animal
    {
        $this->assertLoteTieneCapacidad((int) $data['lote_id']);

        $animal = Animal::query()->create($data);

        return $animal->load(self::RELATIONS);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Animal $animal, array $data): Animal
    {
        if (array_key_exists('lote_id', $data)) {
            $this->assertLoteTieneCapacidad((int) $data['lote_id'], $animal->id);
        }

        $animal->update($data);

        return $animal->fresh(self::RELATIONS);
    }

    public function delete(Animal $animal): void
    {
        $animal->activo = false;
        $animal->save();
        $animal->delete();
    }

    public function restore(int $id): Animal
    {
        $animal = Animal::onlyTrashed()->findOrFail($id);
        $animal->restore();

        return $animal->fresh(self::RELATIONS);
    }

    public function toggleStatus(Animal $animal): Animal
    {
        $animal->activo = ! $animal->activo;
        $animal->save();

        return $animal->fresh(self::RELATIONS);
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return Builder<Animal>
     */
    private function buildQuery(array $filters, bool $onlyTrashed = false): Builder
    {
        $query = $onlyTrashed
            ? Animal::onlyTrashed()
            : Animal::query();

        $query->with(self::RELATIONS);

        if (! empty($filters['search'])) {
            $search = (string) $filters['search'];

            $query->where(function (Builder $builder) use ($search) {
                $builder->where('nombre', 'like', "%{$search}%")
                    ->orWhere('codigo', 'like', "%{$search}%")
                    ->orWhere('arete', 'like', "%{$search}%")
                    ->orWhere('color', 'like', "%{$search}%")
                    ->orWhereHas('raza', fn (Builder $q) => $q->where('nombre', 'like', "%{$search}%"))
                    ->orWhereHas('lote', fn (Builder $q) => $q->where('nombre', 'like', "%{$search}%"));
            });
        }

        if (! empty($filters['raza_id'])) {
            $query->where('raza_id', (int) $filters['raza_id']);
        }

        if (! empty($filters['categoria_id'])) {
            $query->where('categoria_id', (int) $filters['categoria_id']);
        }

        if (! empty($filters['estado_productivo_id'])) {
            $query->where('estado_productivo_id', (int) $filters['estado_productivo_id']);
        }

        if (! empty($filters['lote_id'])) {
            $query->where('lote_id', (int) $filters['lote_id']);
        }

        if (! empty($filters['sexo']) && in_array($filters['sexo'], ['M', 'H'], true)) {
            $query->where('sexo', $filters['sexo']);
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

    private function assertLoteTieneCapacidad(int $loteId, ?int $excludeAnimalId = null): void
    {
        $lote = Lote::query()->findOrFail($loteId);

        if ($lote->capacidad_animales <= 0) {
            return;
        }

        $query = Animal::query()
            ->where('lote_id', $loteId)
            ->whereNull('deleted_at');

        if ($excludeAnimalId) {
            $query->where('id', '!=', $excludeAnimalId);
        }

        $asignados = $query->count();

        if ($asignados >= $lote->capacidad_animales) {
            throw ValidationException::withMessages([
                'lote_id' => "El lote {$lote->nombre} ha alcanzado su capacidad máxima ({$lote->capacidad_animales} animales).",
            ]);
        }
    }
}
