<?php

namespace App\Services\Gestaciones;

use App\Models\Gestacion;
use App\Models\ServicioReproductivo;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Validation\ValidationException;

class GestacionService
{
    private const SORTABLE_COLUMNS = ['fecha_confirmacion', 'fecha_probable_parto', 'estado', 'created_at'];

    private const RELATIONS = [
        'servicio:id,hembra_id,macho_id,fecha_servicio,tipo_servicio,resultado',
        'servicio.hembra:id,codigo,arete',
        'servicio.macho:id,codigo,arete',
    ];

    /**
     * @param  array<string, mixed>  $filters
     */
    public function paginate(array $filters = []): LengthAwarePaginator
    {
        return $this->buildQuery($filters)
            ->paginate((int) ($filters['per_page'] ?? 10));
    }

    public function find(int $id): Gestacion
    {
        return Gestacion::query()
            ->with(self::RELATIONS)
            ->findOrFail($id);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Gestacion
    {
        $this->assertServicioExiste((int) $data['servicio_id']);
        $this->assertUnicaGestacionPorServicio((int) $data['servicio_id']);
        $this->assertUnicaGestacionActiva((int) $data['servicio_id'], $data['estado']);

        return Gestacion::query()
            ->create($data)
            ->load(self::RELATIONS);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Gestacion $gestacion, array $data): Gestacion
    {
        $this->assertServicioExiste((int) $data['servicio_id']);
        $this->assertUnicaGestacionPorServicio((int) $data['servicio_id'], $gestacion->id);
        $this->assertUnicaGestacionActiva(
            (int) $data['servicio_id'],
            $data['estado'],
            $gestacion->id
        );

        $gestacion->update($data);

        return $gestacion->fresh(self::RELATIONS);
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return Builder<Gestacion>
     */
    private function buildQuery(array $filters): Builder
    {
        $query = Gestacion::query()->with(self::RELATIONS);

        if (! empty($filters['search'])) {
            $search = (string) $filters['search'];

            $query->where(function (Builder $builder) use ($search) {
                $builder->where('estado', 'like', "%{$search}%")
                    ->orWhere('observaciones', 'like', "%{$search}%")
                    ->orWhereHas('servicio.hembra', function (Builder $hembraQuery) use ($search) {
                        $hembraQuery->where('codigo', 'like', "%{$search}%")
                            ->orWhere('arete', 'like', "%{$search}%");
                    })
                    ->orWhereHas('servicio.macho', function (Builder $machoQuery) use ($search) {
                        $machoQuery->where('codigo', 'like', "%{$search}%")
                            ->orWhere('arete', 'like', "%{$search}%");
                    });
            });
        }

        if (! empty($filters['servicio_id'])) {
            $query->where('servicio_id', (int) $filters['servicio_id']);
        }

        if (! empty($filters['estado'])) {
            $query->where('estado', (string) $filters['estado']);
        }

        if (! empty($filters['fecha_confirmacion_desde'])) {
            $query->whereDate('fecha_confirmacion', '>=', $filters['fecha_confirmacion_desde']);
        }

        if (! empty($filters['fecha_confirmacion_hasta'])) {
            $query->whereDate('fecha_confirmacion', '<=', $filters['fecha_confirmacion_hasta']);
        }

        $sortBy = in_array($filters['sort_by'] ?? '', self::SORTABLE_COLUMNS, true)
            ? $filters['sort_by']
            : 'fecha_probable_parto';

        $sortDir = strtolower((string) ($filters['sort_dir'] ?? 'desc')) === 'asc' ? 'asc' : 'desc';

        return $query->orderBy($sortBy, $sortDir);
    }

    private function assertServicioExiste(int $servicioId): void
    {
        if (! ServicioReproductivo::query()->whereKey($servicioId)->exists()) {
            throw ValidationException::withMessages([
                'servicio_id' => 'El servicio reproductivo seleccionado no existe.',
            ]);
        }
    }

    private function assertUnicaGestacionPorServicio(int $servicioId, ?int $excludeId = null): void
    {
        $query = Gestacion::query()->where('servicio_id', $servicioId);

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        if ($query->exists()) {
            throw ValidationException::withMessages([
                'servicio_id' => 'Ya existe una gestación registrada para este servicio reproductivo.',
            ]);
        }
    }

    private function assertUnicaGestacionActiva(int $servicioId, string $estado, ?int $excludeId = null): void
    {
        if ($estado !== Gestacion::ESTADO_ACTIVA) {
            return;
        }

        $query = Gestacion::query()
            ->where('servicio_id', $servicioId)
            ->where('estado', Gestacion::ESTADO_ACTIVA);

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        if ($query->exists()) {
            throw ValidationException::withMessages([
                'estado' => 'Ya existe una gestación activa para este servicio reproductivo.',
            ]);
        }
    }
}
