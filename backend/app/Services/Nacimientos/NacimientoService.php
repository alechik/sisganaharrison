<?php

namespace App\Services\Nacimientos;

use App\Models\Nacimiento;
use App\Models\Parto;
use App\Models\User;
use App\Services\Animales\AnimalService;
use App\Services\Pesajes\PesajeService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class NacimientoService
{
    private const SORTABLE_COLUMNS = ['created_at', 'estado_nacimiento', 'sexo', 'arete'];

    private const RELATIONS = [
        'parto:id,gestacion_id,fecha_parto,estado',
        'parto.gestacion:id,servicio_id,estado',
        'parto.gestacion.servicio:id,hembra_id,macho_id,fecha_servicio,tipo_servicio',
        'parto.gestacion.servicio.hembra:id,codigo,arete,raza_id',
        'parto.gestacion.servicio.macho:id,codigo,arete',
        'animal:id,codigo,arete',
        'registradoPor:id,nombre,apellido',
    ];

    public function __construct(
        private readonly AnimalService $animalService,
        private readonly PesajeService $pesajeService
    ) {}

    /**
     * @param  array<string, mixed>  $filters
     */
    public function paginate(array $filters = []): LengthAwarePaginator
    {
        return $this->buildQuery($filters)
            ->paginate((int) ($filters['per_page'] ?? 10));
    }

    public function find(int $id): Nacimiento
    {
        return Nacimiento::query()
            ->with(self::RELATIONS)
            ->findOrFail($id);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Nacimiento
    {
        $this->validateBusinessRules($data);

        return DB::transaction(function () use ($data) {
            $data = $this->resolverCriaYPesaje($data);

            return Nacimiento::query()
                ->create($data)
                ->load(self::RELATIONS);
        });
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Nacimiento $nacimiento, array $data): Nacimiento
    {
        $this->validateBusinessRules($data, $nacimiento);

        return DB::transaction(function () use ($nacimiento, $data) {
            $data = $this->resolverCriaYPesaje($data, $nacimiento);

            $nacimiento->update($data);

            return $nacimiento->fresh(self::RELATIONS);
        });
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return Builder<Nacimiento>
     */
    private function buildQuery(array $filters): Builder
    {
        $query = Nacimiento::query()->with(self::RELATIONS);

        if (! empty($filters['search'])) {
            $search = (string) $filters['search'];

            $query->where(function (Builder $builder) use ($search) {
                $builder->where('arete', 'like', "%{$search}%")
                    ->orWhere('causa_muerte', 'like', "%{$search}%")
                    ->orWhere('observaciones', 'like', "%{$search}%")
                    ->orWhereHas('animal', function (Builder $animalQuery) use ($search) {
                        $animalQuery->where('codigo', 'like', "%{$search}%")
                            ->orWhere('arete', 'like', "%{$search}%");
                    })
                    ->orWhereHas('parto.gestacion.servicio.hembra', function (Builder $hembraQuery) use ($search) {
                        $hembraQuery->where('codigo', 'like', "%{$search}%")
                            ->orWhere('arete', 'like', "%{$search}%");
                    });
            });
        }

        if (! empty($filters['parto_id'])) {
            $query->where('parto_id', (int) $filters['parto_id']);
        }

        if (! empty($filters['animal_id'])) {
            $query->where('animal_id', (int) $filters['animal_id']);
        }

        if (! empty($filters['estado_nacimiento'])) {
            $query->where('estado_nacimiento', (string) $filters['estado_nacimiento']);
        }

        if (! empty($filters['sexo'])) {
            $query->where('sexo', (string) $filters['sexo']);
        }

        $sortBy = in_array($filters['sort_by'] ?? '', self::SORTABLE_COLUMNS, true)
            ? $filters['sort_by']
            : 'created_at';

        $sortDir = strtolower((string) ($filters['sort_dir'] ?? 'desc')) === 'asc' ? 'asc' : 'desc';

        return $query->orderBy($sortBy, $sortDir);
    }

    /**
     * VIVO: crea o actualiza la cría (nunca reutiliza un animal enviado por el cliente).
     * MUERTO: no crea animal ni pesaje; animal_id queda nulo.
     *
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function resolverCriaYPesaje(array $data, ?Nacimiento $existente = null): array
    {
        $ficha = is_array($data['animal'] ?? null) ? $data['animal'] : [];
        unset($data['animal'], $data['animal_id']);

        if (($data['estado_nacimiento'] ?? null) !== Nacimiento::ESTADO_VIVO) {
            $data['animal_id'] = null;

            return $data;
        }

        $parto = Parto::query()
            ->with(['gestacion.servicio.hembra:id,raza_id'])
            ->findOrFail((int) $data['parto_id']);

        $servicio = $parto->gestacion?->servicio;
        $arete = $ficha['arete'] ?? $data['arete'] ?? null;

        $animal = $this->animalService->asegurarDesdeNacimiento($existente?->animal_id, [
            'sexo' => $data['sexo'],
            'fecha_nacimiento' => $parto->fecha_parto?->format('Y-m-d'),
            'arete' => $arete,
            'nombre' => $ficha['nombre'] ?? null,
            'madre_id' => $servicio?->hembra_id,
            'padre_id' => $servicio?->macho_id,
            'raza_id' => $ficha['raza_id'] ?? $servicio?->hembra?->raza_id,
            'estado_productivo_id' => $ficha['estado_productivo_id'] ?? null,
            'lote_id' => $ficha['lote_id'] ?? null,
            'color' => $ficha['color'] ?? null,
            'observaciones' => $ficha['observaciones'] ?? null,
            'user_id' => $data['registrado_por'] ?? Auth::id(),
        ]);

        $data['animal_id'] = $animal->id;
        $data['arete'] = $animal->arete;

        if (isset($data['peso_nacimiento']) && $data['peso_nacimiento'] !== null && $data['peso_nacimiento'] !== '') {
            $this->pesajeService->registrarDeNacimiento(
                $animal,
                (string) $parto->fecha_parto?->format('Y-m-d'),
                (float) $data['peso_nacimiento']
            );
        }

        return $data;
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function validateBusinessRules(array $data, ?Nacimiento $existente = null): void
    {
        $this->assertPartoDisponibleParaNacimiento(
            (int) $data['parto_id'],
            $existente?->parto_id
        );
        $this->assertRegistradoPorExiste($data['registrado_por'] ?? null);
        $this->assertReglasEstadoNacimiento($data);
    }

    private function assertPartoDisponibleParaNacimiento(int $partoId, ?int $partoActualId = null): void
    {
        $parto = Parto::query()->find($partoId);

        if (! $parto) {
            throw ValidationException::withMessages([
                'parto_id' => 'El parto seleccionado no existe.',
            ]);
        }

        if ($partoActualId !== null && $partoId === (int) $partoActualId) {
            return;
        }

        if (! $parto->estaPendiente()) {
            throw ValidationException::withMessages([
                'parto_id' => 'Solo un parto PENDIENTE puede utilizarse para registrar un nacimiento.',
            ]);
        }
    }

    private function assertRegistradoPorExiste(mixed $userId): void
    {
        if ($userId === null || $userId === '') {
            return;
        }

        if (! User::query()->whereKey((int) $userId)->exists()) {
            throw ValidationException::withMessages([
                'registrado_por' => 'El usuario registrador seleccionado no existe.',
            ]);
        }
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function assertReglasEstadoNacimiento(array $data): void
    {
        $estado = (string) $data['estado_nacimiento'];
        $causaMuerte = $data['causa_muerte'] ?? null;

        if ($estado === Nacimiento::ESTADO_MUERTO) {
            if (blank($causaMuerte)) {
                throw ValidationException::withMessages([
                    'causa_muerte' => 'La causa de muerte es obligatoria para nacimientos muertos.',
                ]);
            }

            return;
        }

        if (filled($causaMuerte)) {
            throw ValidationException::withMessages([
                'causa_muerte' => 'La causa de muerte solo aplica a nacimientos muertos.',
            ]);
        }
    }
}
