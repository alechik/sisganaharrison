<?php

namespace App\Services\InformesDiarios;

use App\Models\InformeDiario;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class InformeDiarioService
{
    private const RELATIONS = ['trabajador', 'revisor'];

    private const SORTABLE_COLUMNS = [
        'codigo_informe',
        'fecha',
        'revisado',
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

    public function find(int $id): InformeDiario
    {
        return InformeDiario::query()->with(self::RELATIONS)->findOrFail($id);
    }

    /**
     * @return list<array{id:int, codigo_informe:string, fecha:?string, trabajador:?array{id:int, nombre:string}}>
     */
    public function pendientes(): array
    {
        return InformeDiario::query()
            ->with('trabajador')
            ->where('revisado', InformeDiario::REVISADO_NO)
            ->orderByDesc('fecha')
            ->orderByDesc('id')
            ->get()
            ->map(fn (InformeDiario $informe) => $this->mapPendiente($informe))
            ->values()
            ->all();
    }

    /**
     * @return list<array{id:int, nombre:string}>
     */
    public function trabajadores(): array
    {
        return User::query()
            ->where('estado', true)
            ->whereHas('roles', fn (Builder $query) => $query->where('name', 'trabajador'))
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
    public function create(User $actor, array $data): InformeDiario
    {
        $informe = DB::transaction(function () use ($actor, $data) {
            return InformeDiario::query()->create([
                'user_trabajador_id' => $actor->id,
                'codigo_informe' => $this->nextCodigo(),
                'detalle_informe' => $data['detalle_informe'],
                'revisado' => InformeDiario::REVISADO_NO,
                'fecha' => $data['fecha'],
                'fecha_revision' => null,
                'user_revisor_id' => null,
            ]);
        });

        return $informe->load(self::RELATIONS);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(InformeDiario $informe, array $data): InformeDiario
    {
        if ($informe->estaRevisado()) {
            throw ValidationException::withMessages([
                'revisado' => 'No se puede modificar un informe ya revisado.',
            ]);
        }

        $informe->update([
            'fecha' => $data['fecha'],
            'detalle_informe' => $data['detalle_informe'],
        ]);

        return $informe->fresh(self::RELATIONS);
    }

    public function revisar(User $actor, InformeDiario $informe): InformeDiario
    {
        if ($informe->estaRevisado()) {
            throw ValidationException::withMessages([
                'revisado' => 'El informe ya fue revisado.',
            ]);
        }

        $informe->update([
            'revisado' => InformeDiario::REVISADO_SI,
            'fecha_revision' => now()->toDateString(),
            'user_revisor_id' => $actor->id,
        ]);

        return $informe->fresh(self::RELATIONS);
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return Builder<InformeDiario>
     */
    private function buildQuery(User $actor, array $filters): Builder
    {
        $query = InformeDiario::query()->with(self::RELATIONS);

        if (! $actor->hasAnyRole(['administrador', 'gerencia'])) {
            $query->where('user_trabajador_id', $actor->id);
        }

        if (! empty($filters['search'])) {
            $search = (string) $filters['search'];
            $query->where(function (Builder $builder) use ($search) {
                $builder->where('codigo_informe', 'ilike', '%'.$search.'%')
                    ->orWhere('detalle_informe', 'ilike', '%'.$search.'%');
            });
        }

        if (! empty($filters['revisado']) && in_array($filters['revisado'], InformeDiario::REVISADOS, true)) {
            $query->where('revisado', $filters['revisado']);
        }

        if (! empty($filters['user_trabajador_id']) && $actor->hasAnyRole(['administrador', 'gerencia'])) {
            $query->where('user_trabajador_id', (int) $filters['user_trabajador_id']);
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

        return $query->orderBy($sortBy, $sortDir)->orderByDesc('id');
    }

    private function nextCodigo(): string
    {
        $ultimo = InformeDiario::query()->lockForUpdate()->orderByDesc('id')->value('codigo_informe');
        $n = 1;
        if (is_string($ultimo) && preg_match('/(\d+)$/', $ultimo, $m)) {
            $n = (int) $m[1] + 1;
        }

        return 'INF-'.str_pad((string) $n, 6, '0', STR_PAD_LEFT);
    }

    /**
     * @return array{id:int, codigo_informe:string, fecha:?string, trabajador:?array{id:int, nombre:string}}
     */
    private function mapPendiente(InformeDiario $informe): array
    {
        return [
            'id' => (int) $informe->id,
            'codigo_informe' => (string) $informe->codigo_informe,
            'fecha' => $informe->fecha?->toDateString(),
            'trabajador' => $informe->trabajador ? [
                'id' => (int) $informe->trabajador->id,
                'nombre' => (string) $informe->trabajador->nombre_completo,
            ] : null,
        ];
    }
}
