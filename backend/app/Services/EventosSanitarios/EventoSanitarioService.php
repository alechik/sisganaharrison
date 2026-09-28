<?php

namespace App\Services\EventosSanitarios;

use App\Models\Animal;
use App\Models\DetallePesaje;
use App\Models\EventoSanitario;
use App\Models\Medicamento;
use App\Models\TipoEventoSanitario;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class EventoSanitarioService
{
    private const SORTABLE_COLUMNS = ['fecha', 'total', 'created_at'];

    private const RELATIONS = [
        'tipoEvento:id,nombre,codigo',
        'usuario:id,nombre,apellido',
        'detalles.animal:id,codigo,arete,lote_id',
        'detalles.lote:id,nombre,codigo',
        'detalles.medicamento:id,codigo,nombre,presentacion_id,precio',
        'detalles.medicamento.presentacion:id,descripcion',
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
     * @param  array<string, mixed>  $filters
     * @return Collection<int, Animal>
     */
    public function animalesDisponibles(array $filters = []): Collection
    {
        $search = trim((string) ($filters['search'] ?? ''));
        if ($search === '') {
            return collect();
        }

        return Animal::query()
            ->with([
                'lote:id,nombre,codigo,potrero_id',
                'lote.potrero:id,nombre',
                'detallesPesaje' => fn ($builder) => $builder->latest('id')->limit(1),
            ])
            ->whereNull('deleted_at')
            ->where('estado', Animal::ESTADO_ACTIVO)
            ->where('codigo', 'ilike', '%'.$search.'%')
            ->orderBy('codigo')
            ->limit(20)
            ->get();
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): EventoSanitario
    {
        return DB::transaction(function () use ($data) {
            $this->assertTipoEventoActivo((int) $data['tipo_evento_id']);
            $detalles = $this->normalizeDetalles($data['detalles'] ?? []);

            $evento = EventoSanitario::query()->create([
                'tipo_evento_id' => (int) $data['tipo_evento_id'],
                'user_id' => Auth::id(),
                'fecha' => $data['fecha'],
                'diagnostico' => $data['diagnostico'] ?? null,
                'tratamiento' => $data['tratamiento'] ?? null,
                'observaciones' => $data['observaciones'] ?? null,
                'total' => 0,
            ]);

            $total = 0;
            foreach ($detalles as $linea) {
                $evento->detalles()->create($linea);
                $total += $linea['precio_medicamento'];
            }

            $evento->total = round($total, 2);
            $evento->save();

            return $evento->fresh(self::RELATIONS);
        });
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
                $builder->where('diagnostico', 'ilike', '%'.$search.'%')
                    ->orWhere('tratamiento', 'ilike', '%'.$search.'%')
                    ->orWhere('observaciones', 'ilike', '%'.$search.'%')
                    ->orWhereHas('tipoEvento', fn (Builder $tipoQuery) => $tipoQuery->where('nombre', 'ilike', '%'.$search.'%'))
                    ->orWhereHas('detalles.animal', function (Builder $animalQuery) use ($search) {
                        $animalQuery->where('codigo', 'ilike', '%'.$search.'%')
                            ->orWhere('arete', 'ilike', '%'.$search.'%');
                    })
                    ->orWhereHas('detalles.medicamento', fn (Builder $medQuery) => $medQuery->where('nombre', 'ilike', '%'.$search.'%'));
            });
        }

        if (! empty($filters['animal_id'])) {
            $query->whereHas(
                'detalles',
                fn (Builder $builder) => $builder->where('animal_id', (int) $filters['animal_id'])
            );
        }

        if (! empty($filters['tipo_evento_id'])) {
            $query->where('tipo_evento_id', (int) $filters['tipo_evento_id']);
        }

        if (! empty($filters['medicamento_id'])) {
            $query->whereHas(
                'detalles',
                fn (Builder $builder) => $builder->where('medicamento_id', (int) $filters['medicamento_id'])
            );
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

    /**
     * @param  array<int, array<string, mixed>>  $detalles
     * @return list<array{animal_id: int, lote_id: int, medicamento_id: int, peso_animal: float, precio_medicamento: float}>
     */
    private function normalizeDetalles(array $detalles): array
    {
        if ($detalles === []) {
            throw ValidationException::withMessages([
                'detalles' => 'Debe agregar al menos un animal al evento sanitario.',
            ]);
        }

        $vistos = [];
        $normalizados = [];

        foreach ($detalles as $index => $linea) {
            $animalId = (int) ($linea['animal_id'] ?? 0);
            $medicamentoId = (int) ($linea['medicamento_id'] ?? 0);

            if ($animalId < 1) {
                throw ValidationException::withMessages([
                    "detalles.$index.animal_id" => 'Debe seleccionar un animal.',
                ]);
            }

            if (in_array($animalId, $vistos, true)) {
                throw ValidationException::withMessages([
                    "detalles.$index.animal_id" => 'El mismo animal no puede repetirse en el evento.',
                ]);
            }

            if ($medicamentoId < 1) {
                throw ValidationException::withMessages([
                    "detalles.$index.medicamento_id" => 'Debe seleccionar un medicamento.',
                ]);
            }

            $animal = Animal::query()
                ->whereKey($animalId)
                ->where('estado', Animal::ESTADO_ACTIVO)
                ->whereNull('deleted_at')
                ->first();

            if (! $animal) {
                throw ValidationException::withMessages([
                    "detalles.$index.animal_id" => 'El animal seleccionado no está activo o no existe.',
                ]);
            }

            if (! $animal->lote_id) {
                throw ValidationException::withMessages([
                    "detalles.$index.animal_id" => 'El animal no tiene un lote asignado.',
                ]);
            }

            $medicamento = Medicamento::query()
                ->whereKey($medicamentoId)
                ->where('activo', true)
                ->whereNull('deleted_at')
                ->first();

            if (! $medicamento) {
                throw ValidationException::withMessages([
                    "detalles.$index.medicamento_id" => 'El medicamento seleccionado no está activo o no existe.',
                ]);
            }

            $peso = $this->pesoActual($animal->id);
            if ($peso === null) {
                throw ValidationException::withMessages([
                    "detalles.$index.animal_id" => 'El animal no tiene un peso registrado.',
                ]);
            }

            $vistos[] = $animalId;
            $normalizados[] = [
                'animal_id' => $animal->id,
                'lote_id' => (int) $animal->lote_id,
                'medicamento_id' => $medicamento->id,
                'peso_animal' => $peso,
                'precio_medicamento' => round((float) $medicamento->precio, 2),
            ];
        }

        return $normalizados;
    }

    private function pesoActual(int $animalId): ?float
    {
        $peso = DetallePesaje::query()
            ->where('animal_id', $animalId)
            ->latest('id')
            ->value('peso');

        return $peso !== null ? round((float) $peso, 2) : null;
    }
}
