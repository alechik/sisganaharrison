<?php

namespace App\Services\SociosDeNegocio;

use App\Models\TipoPersona;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class TipoPersonaService
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
     * @return \Illuminate\Support\Collection<int, TipoPersona>
     */
    public function listAll()
    {
        return TipoPersona::query()->orderBy('nombre')->get(['id', 'nombre']);
    }

    public function find(int $id): TipoPersona
    {
        return TipoPersona::query()->findOrFail($id);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): TipoPersona
    {
        return TipoPersona::query()->create([
            'nombre' => $this->normalizeNombre((string) $data['nombre']),
        ]);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(TipoPersona $tipoPersona, array $data): TipoPersona
    {
        if ($tipoPersona->esProtegido()) {
            throw ValidationException::withMessages([
                'nombre' => 'No se puede modificar un tipo de persona protegido del sistema.',
            ]);
        }

        $tipoPersona->update([
            'nombre' => $this->normalizeNombre((string) $data['nombre']),
        ]);

        return $tipoPersona->fresh();
    }

    public function delete(TipoPersona $tipoPersona): void
    {
        if ($tipoPersona->esProtegido()) {
            throw ValidationException::withMessages([
                'nombre' => 'No se puede eliminar un tipo de persona protegido del sistema.',
            ]);
        }

        if ($tipoPersona->personas()->exists()) {
            throw ValidationException::withMessages([
                'nombre' => 'No se puede eliminar un tipo asignado a socios de negocio.',
            ]);
        }

        $tipoPersona->delete();
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return Builder<TipoPersona>
     */
    private function buildQuery(array $filters): Builder
    {
        $query = TipoPersona::query();

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

    private function normalizeNombre(string $nombre): string
    {
        return Str::upper(Str::slug($nombre, '_'));
    }
}
