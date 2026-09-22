<?php

namespace App\Services\Partos;

use App\Models\Gestacion;
use App\Models\Parto;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PartoService
{
    private const SORTABLE_COLUMNS = ['fecha_parto', 'estado', 'created_at'];

    private const RELATIONS = [
        'gestacion:id,servicio_id,estado,fecha_confirmacion,fecha_probable_parto',
        'gestacion.servicio:id,hembra_id,macho_id,fecha_servicio,tipo_servicio,resultado',
        'gestacion.servicio.hembra:id,codigo,arete',
        'gestacion.servicio.macho:id,codigo,arete',
    ];

    /**
     * @param  array<string, mixed>  $filters
     */
    public function paginate(array $filters = []): LengthAwarePaginator
    {
        return $this->buildQuery($filters)
            ->paginate((int) ($filters['per_page'] ?? 10));
    }

    public function find(int $id): Parto
    {
        return Parto::query()
            ->with(self::RELATIONS)
            ->findOrFail($id);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Parto
    {
        $gestacionId = (int) $data['gestacion_id'];

        $this->assertGestacionExiste($gestacionId);
        $this->assertGestacionActiva($gestacionId);
        $this->assertUnicoPartoPorGestacion($gestacionId);

        $data['estado'] = Parto::ESTADO_PENDIENTE;

        return DB::transaction(function () use ($data, $gestacionId) {
            $parto = Parto::query()
                ->create($data)
                ->load(self::RELATIONS);

            $this->finalizarGestacion($gestacionId);

            return $parto->fresh(self::RELATIONS);
        });
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Parto $parto, array $data): Parto
    {
        $gestacionId = (int) $data['gestacion_id'];

        $this->assertGestacionExiste($gestacionId);
        $this->assertUnicoPartoPorGestacion($gestacionId, $parto->id);

        if ($gestacionId !== (int) $parto->gestacion_id) {
            $this->assertGestacionActiva($gestacionId);
        }

        unset($data['estado']);

        $gestacionOriginal = (int) $parto->gestacion_id;

        return DB::transaction(function () use ($parto, $data, $gestacionId, $gestacionOriginal) {
            $parto->update($data);

            if ($gestacionId !== $gestacionOriginal) {
                $this->finalizarGestacion($gestacionId);
            }

            return $parto->fresh(self::RELATIONS);
        });
    }

    public function finalizar(Parto $parto): Parto
    {
        if ($parto->estaFinalizado()) {
            throw ValidationException::withMessages([
                'estado' => 'El parto ya está finalizado.',
            ]);
        }

        $parto->update(['estado' => Parto::ESTADO_FINALIZADA]);

        return $parto->fresh(self::RELATIONS);
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return Builder<Parto>
     */
    private function buildQuery(array $filters): Builder
    {
        $query = Parto::query()->with(self::RELATIONS);

        if (! empty($filters['search'])) {
            $search = (string) $filters['search'];

            $query->where(function (Builder $builder) use ($search) {
                $builder->where('observaciones', 'like', "%{$search}%")
                    ->orWhereHas('gestacion.servicio.hembra', function (Builder $hembraQuery) use ($search) {
                        $hembraQuery->where('codigo', 'like', "%{$search}%")
                            ->orWhere('arete', 'like', "%{$search}%");
                    })
                    ->orWhereHas('gestacion.servicio.macho', function (Builder $machoQuery) use ($search) {
                        $machoQuery->where('codigo', 'like', "%{$search}%")
                            ->orWhere('arete', 'like', "%{$search}%");
                    });
            });
        }

        if (! empty($filters['gestacion_id'])) {
            $query->where('gestacion_id', (int) $filters['gestacion_id']);
        }

        if (! empty($filters['estado'])) {
            $incluirId = ! empty($filters['incluir_id']) ? (int) $filters['incluir_id'] : null;

            $query->where(function (Builder $builder) use ($filters, $incluirId) {
                $builder->where('estado', (string) $filters['estado']);
                if ($incluirId) {
                    $builder->orWhereKey($incluirId);
                }
            });
        }

        if (! empty($filters['fecha_parto_desde'])) {
            $query->whereDate('fecha_parto', '>=', $filters['fecha_parto_desde']);
        }

        if (! empty($filters['fecha_parto_hasta'])) {
            $query->whereDate('fecha_parto', '<=', $filters['fecha_parto_hasta']);
        }

        $sortBy = in_array($filters['sort_by'] ?? '', self::SORTABLE_COLUMNS, true)
            ? $filters['sort_by']
            : 'fecha_parto';

        $sortDir = strtolower((string) ($filters['sort_dir'] ?? 'desc')) === 'asc' ? 'asc' : 'desc';

        return $query->orderBy($sortBy, $sortDir);
    }

    private function assertGestacionExiste(int $gestacionId): void
    {
        if (! Gestacion::query()->whereKey($gestacionId)->exists()) {
            throw ValidationException::withMessages([
                'gestacion_id' => 'La gestación seleccionada no existe.',
            ]);
        }
    }

    private function assertGestacionActiva(int $gestacionId): void
    {
        $gestacion = Gestacion::query()->find($gestacionId);

        if (! $gestacion || ! $gestacion->esActiva()) {
            throw ValidationException::withMessages([
                'gestacion_id' => 'Solo una gestación ACTIVA puede generar un parto.',
            ]);
        }
    }

    private function assertUnicoPartoPorGestacion(int $gestacionId, ?int $excludeId = null): void
    {
        $query = Parto::query()->where('gestacion_id', $gestacionId);

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        if ($query->exists()) {
            throw ValidationException::withMessages([
                'gestacion_id' => 'Ya existe un parto registrado para esta gestación.',
            ]);
        }
    }

    private function finalizarGestacion(int $gestacionId): void
    {
        Gestacion::query()
            ->whereKey($gestacionId)
            ->update(['estado' => Gestacion::ESTADO_FINALIZADA]);
    }
}
