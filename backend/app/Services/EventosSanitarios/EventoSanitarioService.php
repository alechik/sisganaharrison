<?php

namespace App\Services\EventosSanitarios;

use App\Models\Animal;
use App\Models\EventoSanitario;
use App\Models\TipoEventoSanitario;
use App\Models\Vacuna;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Validation\ValidationException;

class EventoSanitarioService
{
    private const SORTABLE_COLUMNS = ['fecha', 'created_at'];

    private const RELATIONS = [
        'animal:id,codigo,arete',
        'tipoEvento:id,nombre,codigo',
        'vacuna:id,nombre',
    ];

    /**
     * @param  array<string, mixed>  $filters
     */
    public function paginate(array $filters = []): LengthAwarePaginator
    {
        return $this->buildQuery($filters)
            ->paginate((int) ($filters['per_page'] ?? 10));
    }

    public function find(int $id): EventoSanitario
    {
        return EventoSanitario::query()
            ->with(self::RELATIONS)
            ->findOrFail($id);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): EventoSanitario
    {
        $this->assertAnimalActivo((int) $data['animal_id']);
        $tipo = $this->assertTipoEventoActivo((int) $data['tipo_evento_id']);
        $this->assertVacunaSegunTipo($tipo, $data['vacuna_id'] ?? null);

        if (! empty($data['vacuna_id'])) {
            $this->assertVacunaActiva((int) $data['vacuna_id']);
        } else {
            $data['vacuna_id'] = null;
        }

        return EventoSanitario::query()
            ->create($data)
            ->load(self::RELATIONS);
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return Builder<EventoSanitario>
     */
    private function buildQuery(array $filters): Builder
    {
        $query = EventoSanitario::query()->with(self::RELATIONS);

        if (! empty($filters['search'])) {
            $search = (string) $filters['search'];

            $query->where(function (Builder $builder) use ($search) {
                $builder->where('diagnostico', 'like', "%{$search}%")
                    ->orWhere('tratamiento', 'like', "%{$search}%")
                    ->orWhere('observaciones', 'like', "%{$search}%")
                    ->orWhereHas('animal', function (Builder $animalQuery) use ($search) {
                        $animalQuery->where('codigo', 'like', "%{$search}%")
                            ->orWhere('arete', 'like', "%{$search}%");
                    })
                    ->orWhereHas('tipoEvento', fn (Builder $tipoQuery) => $tipoQuery->where('nombre', 'like', "%{$search}%"))
                    ->orWhereHas('vacuna', fn (Builder $vacunaQuery) => $vacunaQuery->where('nombre', 'like', "%{$search}%"));
            });
        }

        if (! empty($filters['animal_id'])) {
            $query->where('animal_id', (int) $filters['animal_id']);
        }

        if (! empty($filters['tipo_evento_id'])) {
            $query->where('tipo_evento_id', (int) $filters['tipo_evento_id']);
        }

        if (! empty($filters['vacuna_id'])) {
            $query->where('vacuna_id', (int) $filters['vacuna_id']);
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

    private function assertTipoEventoActivo(int $tipoEventoId): TipoEventoSanitario
    {
        $tipo = TipoEventoSanitario::query()
            ->where('id', $tipoEventoId)
            ->where('activo', true)
            ->whereNull('deleted_at')
            ->first();

        if (! $tipo) {
            throw ValidationException::withMessages([
                'tipo_evento_id' => 'El tipo de evento seleccionado no está activo o no existe.',
            ]);
        }

        return $tipo;
    }

    private function assertVacunaActiva(int $vacunaId): void
    {
        $vacuna = Vacuna::query()
            ->where('id', $vacunaId)
            ->where('activo', true)
            ->whereNull('deleted_at')
            ->first();

        if (! $vacuna) {
            throw ValidationException::withMessages([
                'vacuna_id' => 'La vacuna seleccionada no está activa o no existe.',
            ]);
        }
    }

    private function assertVacunaSegunTipo(TipoEventoSanitario $tipo, mixed $vacunaId): void
    {
        if ($tipo->requiereVacuna() && empty($vacunaId)) {
            throw ValidationException::withMessages([
                'vacuna_id' => 'La vacuna es obligatoria para eventos de tipo vacunación.',
            ]);
        }
    }
}
