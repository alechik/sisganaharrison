<?php

namespace App\Services\Tareas;

use App\Models\Tarea;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class TareaService
{
    private const RELATIONS = ['gerencia', 'trabajador'];

    private const SORTABLE_COLUMNS = [
        'codigo_tarea',
        'estado',
        'fecha_inicio',
        'fecha_fin',
        'created_at',
    ];

    /**
     * @param  array<string, mixed>  $filters
     */
    public function paginate(User $actor, array $filters = []): LengthAwarePaginator
    {
        return $this->buildQuery($actor, $filters)
            ->paginate((int) ($filters['per_page'] ?? 10));
    }

    public function find(int $id): Tarea
    {
        return Tarea::query()->with(self::RELATIONS)->findOrFail($id);
    }

    /**
     * @return list<array{id:int, nombre:string}>
     */
    public function asignables(): array
    {
        return User::query()
            ->where('estado', true)
            ->whereHas('roles', fn (Builder $query) => $query->whereIn('name', ['trabajador', 'veterinario']))
            ->orderBy('nombre')
            ->orderBy('apellido')
            ->get()
            ->map(fn (User $user) => [
                'id' => (int) $user->id,
                'nombre' => (string) $user->nombre_completo,
            ])
            ->values()
            ->all();
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(User $actor, array $data): Tarea
    {
        $asignado = $this->assertAsignable((int) $data['user_trabajador_id']);

        $tarea = DB::transaction(function () use ($actor, $asignado, $data) {
            return Tarea::query()->create([
                'user_gerencia_id' => $actor->id,
                'user_trabajador_id' => $asignado->id,
                'codigo_tarea' => $this->nextCodigo(),
                'indicacion' => $data['indicacion'],
                'respuesta_indicacion' => null,
                'visto' => Tarea::VISTA_NO,
                'estado' => Tarea::ESTADO_EMITIDO,
                'fecha_inicio' => now(),
                'fecha_fin' => null,
            ]);
        });

        return $tarea->load(self::RELATIONS);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function updateRespuesta(Tarea $tarea, array $data): Tarea
    {
        if ($tarea->estaTerminada()) {
            throw ValidationException::withMessages([
                'respuesta_indicacion' => 'No se puede modificar una tarea terminada.',
            ]);
        }

        $tarea->update([
            'respuesta_indicacion' => $data['respuesta_indicacion'],
        ]);

        return $tarea->fresh(self::RELATIONS);
    }

    public function marcarVistaSiCorresponde(User $actor, Tarea $tarea): Tarea
    {
        $esAsignado = (int) $tarea->user_trabajador_id === (int) $actor->id
            && $actor->hasAnyRole(['trabajador', 'veterinario']);

        if (! $esAsignado || $tarea->estaTerminada()) {
            return $tarea;
        }

        $dirty = false;

        if ($tarea->visto !== Tarea::VISTA_SI) {
            $tarea->visto = Tarea::VISTA_SI;
            $dirty = true;
        }

        if ($tarea->estado === Tarea::ESTADO_EMITIDO) {
            $tarea->estado = Tarea::ESTADO_PENDIENTE;
            $dirty = true;
        }

        if ($dirty) {
            $tarea->save();
        }

        return $tarea->fresh(self::RELATIONS) ?? $tarea;
    }

    public function terminar(Tarea $tarea): Tarea
    {
        if ($tarea->estaTerminada()) {
            throw ValidationException::withMessages([
                'estado' => 'La tarea ya está terminada.',
            ]);
        }

        $tarea->update([
            'estado' => Tarea::ESTADO_TERMINADO,
            'fecha_fin' => now(),
        ]);

        return $tarea->fresh(self::RELATIONS);
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return Builder<Tarea>
     */
    private function buildQuery(User $actor, array $filters): Builder
    {
        $query = Tarea::query()->with(self::RELATIONS);

        if (! $actor->hasAnyRole(['administrador', 'gerencia'])) {
            $query->where('user_trabajador_id', $actor->id);
        }

        if (! empty($filters['search'])) {
            $search = (string) $filters['search'];
            $query->where(function (Builder $builder) use ($search) {
                $builder->where('codigo_tarea', 'ilike', '%'.$search.'%')
                    ->orWhere('indicacion', 'ilike', '%'.$search.'%');
            });
        }

        if (! empty($filters['estado']) && in_array($filters['estado'], Tarea::ESTADOS, true)) {
            $query->where('estado', $filters['estado']);
        }

        if (! empty($filters['user_trabajador_id']) && $actor->hasAnyRole(['administrador', 'gerencia'])) {
            $query->where('user_trabajador_id', (int) $filters['user_trabajador_id']);
        }

        if (! empty($filters['fecha_desde'])) {
            $query->whereDate('fecha_inicio', '>=', $filters['fecha_desde']);
        }

        if (! empty($filters['fecha_hasta'])) {
            $query->whereDate('fecha_inicio', '<=', $filters['fecha_hasta']);
        }

        $sortBy = in_array($filters['sort_by'] ?? '', self::SORTABLE_COLUMNS, true)
            ? $filters['sort_by']
            : 'created_at';
        $sortDir = strtolower((string) ($filters['sort_dir'] ?? 'desc')) === 'asc' ? 'asc' : 'desc';

        return $query->orderBy($sortBy, $sortDir);
    }

    private function assertAsignable(int $userId): User
    {
        $asignado = User::query()->find($userId);

        if (! $asignado || ! $asignado->estado) {
            throw ValidationException::withMessages([
                'user_trabajador_id' => 'El usuario asignado no está disponible.',
            ]);
        }

        if (! $asignado->hasAnyRole(['trabajador', 'veterinario'])) {
            throw ValidationException::withMessages([
                'user_trabajador_id' => 'La tarea solo puede asignarse a un trabajador o veterinario.',
            ]);
        }

        return $asignado;
    }

    private function nextCodigo(): string
    {
        $ultimo = Tarea::query()->lockForUpdate()->orderByDesc('id')->value('codigo_tarea');
        $n = 1;
        if (is_string($ultimo) && preg_match('/(\d+)$/', $ultimo, $m)) {
            $n = (int) $m[1] + 1;
        }

        return 'TAR-'.str_pad((string) $n, 6, '0', STR_PAD_LEFT);
    }
}
