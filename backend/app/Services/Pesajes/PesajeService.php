<?php

namespace App\Services\Pesajes;

use App\Models\Animal;
use App\Models\Pesaje;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Validation\ValidationException;

class PesajeService
{
    private const SORTABLE_COLUMNS = ['fecha', 'peso', 'created_at'];

    /**
     * @param  array<string, mixed>  $filters
     */
    public function paginate(array $filters = []): LengthAwarePaginator
    {
        return $this->buildQuery($filters)
            ->paginate((int) ($filters['per_page'] ?? 10));
    }

    public function find(int $id): Pesaje
    {
        return Pesaje::query()
            ->with('animal:id,codigo,arete')
            ->findOrFail($id);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Pesaje
    {
        $this->assertAnimalActivo((int) $data['animal_id']);

        return Pesaje::query()
            ->create($data)
            ->load('animal:id,codigo,arete');
    }

    /**
     * Primer pesaje de una cría viva. No duplica si ya existe el de nacimiento.
     */
    public function registrarDeNacimiento(Animal $animal, string $fecha, float $peso): Pesaje
    {
        $existente = Pesaje::query()
            ->where('animal_id', $animal->id)
            ->where('observaciones', Pesaje::OBSERVACION_NACIMIENTO)
            ->first();

        if ($existente) {
            return $existente->load('animal:id,codigo,arete');
        }

        return $this->create([
            'animal_id' => $animal->id,
            'fecha' => $fecha,
            'peso' => $peso,
            'observaciones' => Pesaje::OBSERVACION_NACIMIENTO,
        ]);
    }

    /**
     * Pesaje histórico identificado por observación. No sobrescribe ni duplica el mismo tipo.
     */
    public function registrarHistorico(Animal $animal, string $fecha, float $peso, string $observacion): Pesaje
    {
        $existente = Pesaje::query()
            ->where('animal_id', $animal->id)
            ->where('observaciones', $observacion)
            ->first();

        if ($existente) {
            return $existente->load('animal:id,codigo,arete');
        }

        return $this->create([
            'animal_id' => $animal->id,
            'fecha' => $fecha,
            'peso' => $peso,
            'observaciones' => $observacion,
        ]);
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return Builder<Pesaje>
     */
    private function buildQuery(array $filters): Builder
    {
        $query = Pesaje::query()
            ->with('animal:id,codigo,arete');

        if (! empty($filters['search'])) {
            $search = (string) $filters['search'];

            $query->where(function (Builder $builder) use ($search) {
                $builder->where('observaciones', 'like', "%{$search}%")
                    ->orWhereHas('animal', function (Builder $animalQuery) use ($search) {
                        $animalQuery->where('codigo', 'like', "%{$search}%")
                            ->orWhere('arete', 'like', "%{$search}%");
                    });
            });
        }

        if (! empty($filters['animal_id'])) {
            $query->where('animal_id', (int) $filters['animal_id']);
        }

        if (! empty($filters['fecha_desde'])) {
            $query->whereDate('fecha', '>=', $filters['fecha_desde']);
        }

        if (! empty($filters['fecha_hasta'])) {
            $query->whereDate('fecha', '<=', $filters['fecha_hasta']);
        }

        $sortBy = in_array($filters['sort_by'] ?? '', self::SORTABLE_COLUMNS, true)
            ? $filters['sort_by']
            : 'fecha';

        $sortDir = strtolower((string) ($filters['sort_dir'] ?? 'desc')) === 'asc' ? 'asc' : 'desc';

        return $query->orderBy($sortBy, $sortDir);
    }

    private function assertAnimalActivo(int $animalId): void
    {
        $animal = Animal::query()
            ->where('id', $animalId)
            ->where('estado', Animal::ESTADO_ACTIVO)
            ->whereNull('deleted_at')
            ->first();

        if (! $animal) {
            throw ValidationException::withMessages([
                'animal_id' => 'El animal seleccionado no está activo o no existe.',
            ]);
        }
    }
}
