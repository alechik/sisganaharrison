<?php

namespace App\Services\SociosDeNegocio;

use App\Models\Persona;
use App\Models\TipoPersona;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class PersonaService
{
    private const SORTABLE_COLUMNS = ['razon_social', 'email', 'created_at', 'fecha_reg'];

    private const RELATIONS = [
        'tipos:id,nombre',
        'registradoPor:id,nombre,apellido',
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

    public function find(int $id): Persona
    {
        return Persona::query()
            ->with(self::RELATIONS)
            ->findOrFail($id);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Persona
    {
        $tipoIds = $this->assertTipos($data['tipo_ids'] ?? []);

        $persona = Persona::query()->create([
            'razon_social' => $data['razon_social'],
            'responsable' => $data['responsable'] ?? null,
            'email' => $data['email'] ?? null,
            'fecha_nacimiento' => $data['fecha_nacimiento'] ?? null,
            'ci' => $data['ci'] ?? null,
            'nit' => $data['nit'] ?? null,
            'celular' => $data['celular'] ?? null,
            'estado_civil' => $data['estado_civil'] ?? null,
            'sexo' => $data['sexo'] ?? null,
            'direccion' => $data['direccion'] ?? null,
            'estado' => Persona::ESTADO_ACTIVO,
            'fecha_reg' => $data['fecha_reg'] ?? now()->toDateString(),
            'user_id' => Auth::id(),
        ]);

        $persona->tipos()->sync($tipoIds);

        return $persona->load(self::RELATIONS);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Persona $persona, array $data): Persona
    {
        $tipoIds = $this->assertTipos($data['tipo_ids'] ?? []);

        $persona->update([
            'razon_social' => $data['razon_social'],
            'responsable' => $data['responsable'] ?? null,
            'email' => $data['email'] ?? null,
            'fecha_nacimiento' => $data['fecha_nacimiento'] ?? null,
            'ci' => $data['ci'] ?? null,
            'nit' => $data['nit'] ?? null,
            'celular' => $data['celular'] ?? null,
            'estado_civil' => $data['estado_civil'] ?? null,
            'sexo' => $data['sexo'] ?? null,
            'direccion' => $data['direccion'] ?? null,
        ]);

        $persona->tipos()->sync($tipoIds);

        return $persona->fresh(self::RELATIONS);
    }

    public function delete(Persona $persona): void
    {
        $persona->estado = Persona::ESTADO_INACTIVO;
        $persona->save();
        $persona->delete();
    }

    public function restore(int $id): Persona
    {
        $persona = Persona::onlyTrashed()->findOrFail($id);
        $persona->restore();

        return $persona->fresh(self::RELATIONS);
    }

    public function toggleStatus(Persona $persona): Persona
    {
        $persona->estado = $persona->estaActivo()
            ? Persona::ESTADO_INACTIVO
            : Persona::ESTADO_ACTIVO;
        $persona->save();

        return $persona->fresh(self::RELATIONS);
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return Builder<Persona>
     */
    private function buildQuery(array $filters, bool $onlyTrashed = false): Builder
    {
        $query = $onlyTrashed
            ? Persona::onlyTrashed()->with(self::RELATIONS)
            : Persona::query()->with(self::RELATIONS);

        if (! empty($filters['search'])) {
            $search = (string) $filters['search'];

            $query->where(function (Builder $builder) use ($search) {
                $builder->where('razon_social', 'like', "%{$search}%")
                    ->orWhere('responsable', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('nit', 'like', "%{$search}%")
                    ->orWhere('direccion', 'like', "%{$search}%");

                if (is_numeric($search)) {
                    $builder->orWhere('ci', (int) $search)
                        ->orWhere('celular', (int) $search);
                }
            });
        }

        if (! empty($filters['tipo_id'])) {
            $tipoId = (int) $filters['tipo_id'];
            $query->whereHas('tipos', fn (Builder $builder) => $builder->where('tipo.id', $tipoId));
        }

        if (! empty($filters['tipo'])) {
            $tipoNombre = strtoupper((string) $filters['tipo']);
            $query->whereHas('tipos', fn (Builder $builder) => $builder->where('tipo.nombre', $tipoNombre));
        }

        if (array_key_exists('estado', $filters) && $filters['estado'] !== null && $filters['estado'] !== '') {
            $estado = $filters['estado'];

            if (is_bool($estado) || in_array($estado, ['true', 'false', '1', '0'], true)) {
                $activo = filter_var($estado, FILTER_VALIDATE_BOOLEAN);
                $query->where('estado', $activo ? Persona::ESTADO_ACTIVO : Persona::ESTADO_INACTIVO);
            } else {
                $query->where('estado', strtoupper((string) $estado));
            }
        }

        $sortBy = in_array($filters['sort_by'] ?? '', self::SORTABLE_COLUMNS, true)
            ? $filters['sort_by']
            : 'razon_social';

        $sortDir = strtolower((string) ($filters['sort_dir'] ?? 'asc')) === 'desc' ? 'desc' : 'asc';

        return $query->orderBy($sortBy, $sortDir);
    }

    /**
     * @param  array<int|string>  $tipoIds
     * @return list<int>
     */
    private function assertTipos(array $tipoIds): array
    {
        $ids = array_values(array_unique(array_map('intval', $tipoIds)));

        if ($ids === []) {
            throw ValidationException::withMessages([
                'tipo_ids' => 'Debe asignar al menos un tipo de persona.',
            ]);
        }

        $existentes = TipoPersona::query()->whereIn('id', $ids)->pluck('id')->all();

        if (count($existentes) !== count($ids)) {
            throw ValidationException::withMessages([
                'tipo_ids' => 'Uno o más tipos de persona no existen.',
            ]);
        }

        return $ids;
    }
}
