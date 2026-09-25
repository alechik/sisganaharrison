<?php

namespace App\Services\ServiciosReproductivos;

use App\Models\Animal;
use App\Models\ServicioReproductivo;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Validation\ValidationException;

class ServicioReproductivoService
{
    private const SORTABLE_COLUMNS = ['fecha_servicio', 'tipo_servicio', 'created_at'];

    private const RELATIONS = [
        'hembra:id,codigo,arete,sexo',
        'macho:id,codigo,arete,sexo',
    ];

    /**
     * @param  array<string, mixed>  $filters
     */
    public function paginate(array $filters = []): LengthAwarePaginator
    {
        return $this->buildQuery($filters)
            ->paginate((int) ($filters['per_page'] ?? 10));
    }

    public function find(int $id): ServicioReproductivo
    {
        return ServicioReproductivo::query()
            ->with(self::RELATIONS)
            ->findOrFail($id);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): ServicioReproductivo
    {
        $this->assertAnimalesValidos($data);

        return ServicioReproductivo::query()
            ->create($data)
            ->load(self::RELATIONS);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(ServicioReproductivo $servicio, array $data): ServicioReproductivo
    {
        $this->assertAnimalesValidos($data);

        $servicio->update($data);

        return $servicio->fresh(self::RELATIONS);
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return Builder<ServicioReproductivo>
     */
    private function buildQuery(array $filters): Builder
    {
        $query = ServicioReproductivo::query()->with(self::RELATIONS);

        if (! empty($filters['search'])) {
            $search = (string) $filters['search'];

            $query->where(function (Builder $builder) use ($search) {
                $builder->where('tipo_servicio', 'like', "%{$search}%")
                    ->orWhere('resultado', 'like', "%{$search}%")
                    ->orWhere('observaciones', 'like', "%{$search}%")
                    ->orWhereHas('hembra', function (Builder $hembraQuery) use ($search) {
                        $hembraQuery->where('codigo', 'like', "%{$search}%")
                            ->orWhere('arete', 'like', "%{$search}%");
                    })
                    ->orWhereHas('macho', function (Builder $machoQuery) use ($search) {
                        $machoQuery->where('codigo', 'like', "%{$search}%")
                            ->orWhere('arete', 'like', "%{$search}%");
                    });
            });
        }

        if (! empty($filters['hembra_id'])) {
            $query->where('hembra_id', (int) $filters['hembra_id']);
        }

        if (! empty($filters['macho_id'])) {
            $query->where('macho_id', (int) $filters['macho_id']);
        }

        if (! empty($filters['tipo_servicio'])) {
            $query->where('tipo_servicio', (string) $filters['tipo_servicio']);
        }

        if (! empty($filters['resultado'])) {
            $query->where('resultado', (string) $filters['resultado']);
        }

        if (! empty($filters['sin_gestacion'])) {
            $incluirId = ! empty($filters['incluir_id']) ? (int) $filters['incluir_id'] : null;

            $query->where(function (Builder $builder) use ($incluirId) {
                $builder->whereDoesntHave('gestacion');
                if ($incluirId) {
                    $builder->orWhereKey($incluirId);
                }
            });
        }

        if (! empty($filters['fecha_desde'])) {
            $query->whereDate('fecha_servicio', '>=', $filters['fecha_desde']);
        }

        if (! empty($filters['fecha_hasta'])) {
            $query->whereDate('fecha_servicio', '<=', $filters['fecha_hasta']);
        }

        $sortBy = in_array($filters['sort_by'] ?? '', self::SORTABLE_COLUMNS, true)
            ? $filters['sort_by']
            : 'fecha_servicio';

        $sortDir = strtolower((string) ($filters['sort_dir'] ?? 'desc')) === 'asc' ? 'asc' : 'desc';

        return $query->orderBy($sortBy, $sortDir);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function assertAnimalesValidos(array $data): void
    {
        $hembra = $this->assertAnimalActivoPorSexo((int) $data['hembra_id'], 'H', 'hembra_id');
        $this->assertAreteValido($hembra, 'hembra_id');

        if (! empty($data['macho_id'])) {
            $machoId = (int) $data['macho_id'];

            if ($machoId === $hembra->id) {
                throw ValidationException::withMessages([
                    'macho_id' => 'La hembra y el macho no pueden ser el mismo animal.',
                ]);
            }

            $macho = $this->assertAnimalActivoPorSexo($machoId, 'M', 'macho_id');
            $this->assertAreteValido($macho, 'macho_id');
        }
    }

    private function assertAreteValido(Animal $animal, string $field): void
    {
        if ($animal->tieneAreteValido()) {
            return;
        }

        $label = $field === 'hembra_id' ? 'hembra' : 'macho';

        throw ValidationException::withMessages([
            $field => "El animal seleccionado como {$label} debe tener un arete asignado y válido.",
        ]);
    }

    private function assertAnimalActivoPorSexo(int $animalId, string $sexo, string $field): Animal
    {
        $animal = Animal::query()
            ->where('id', $animalId)
            ->where('sexo', $sexo)
            ->where('estado', Animal::ESTADO_ACTIVO)
            ->whereNull('deleted_at')
            ->first();

        if (! $animal) {
            $label = $sexo === 'H' ? 'hembra' : 'macho';

            throw ValidationException::withMessages([
                $field => "El animal seleccionado como {$label} no está activo, no existe o no tiene el sexo correcto.",
            ]);
        }

        return $animal;
    }
}
