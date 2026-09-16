<?php

namespace App\Services\Animales;

use App\Models\Animal;
use App\Models\CategoriaAnimal;
use App\Models\Lote;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AnimalService
{
    private const SORTABLE_COLUMNS = ['nombre', 'codigo', 'fecha_nacimiento', 'created_at'];

    private const RELATIONS = [
        'raza:id,nombre',
        'categoria:id,codigo,nombre',
        'estadoProductivo:id,nombre',
        'lote:id,nombre',
        'madre:id,nombre,codigo',
        'padre:id,nombre,codigo',
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

    public function find(int $id): Animal
    {
        return Animal::query()
            ->with(self::RELATIONS)
            ->findOrFail($id);
    }

    /**
     * Vista previa del siguiente código (sin reservar).
     * La asignación definitiva ocurre en create / asegurarPreliminar.
     */
    public function peekSiguienteCodigo(int $categoriaId): string
    {
        return $this->buildSiguienteCodigo($categoriaId, lock: false);
    }

    /**
     * Crea o reutiliza un animal preliminar (codigo, sexo, categoria_id).
     * No duplica si ya existe animal_id. No inventa fecha_nacimiento.
     *
     * @param  array<string, mixed>  $extra
     */
    public function asegurarPreliminar(?int $animalId, int $categoriaId, string $sexo, array $extra = []): Animal
    {
        $sexo = strtoupper($sexo);

        if (! in_array($sexo, ['M', 'H'], true)) {
            throw ValidationException::withMessages([
                'sexo' => 'El sexo debe ser M (macho) o H (hembra).',
            ]);
        }

        if (! CategoriaAnimal::query()->whereKey($categoriaId)->exists()) {
            throw ValidationException::withMessages([
                'categoria_id' => 'La categoría seleccionada no existe.',
            ]);
        }

        $edad = array_key_exists('edad_inicial', $extra) && $extra['edad_inicial'] !== null
            ? (int) $extra['edad_inicial']
            : null;

        if ($animalId) {
            $animal = Animal::query()->findOrFail($animalId);

            if ($animal->edad_inicial === null && $edad !== null) {
                $animal->update([
                    'edad_inicial' => $edad,
                    'edad_actual' => $animal->edad_actual ?? $edad,
                ]);
            }

            return $animal->fresh() ?? $animal;
        }

        return $this->create([
            'codigo' => $this->buildSiguienteCodigo($categoriaId, lock: true),
            'sexo' => $sexo,
            'categoria_id' => $categoriaId,
            'activo' => true,
            'user_id' => $extra['user_id'] ?? Auth::id(),
            'edad_inicial' => $edad,
            'edad_actual' => $edad,
        ]);
    }

    /**
     * Alta o reutilización de animal nacido vivo. No crea un segundo animal si ya hay animal_id.
     *
     * @param  array<string, mixed>  $contexto
     */
    public function asegurarDesdeNacimiento(?int $animalId, array $contexto): Animal
    {
        $sexo = strtoupper((string) ($contexto['sexo'] ?? ''));
        $categoria = CategoriaAnimal::query()
            ->where('codigo', $sexo === 'H' ? 'TERNERA' : 'TERNERO')
            ->whereNull('deleted_at')
            ->first();

        if (! $categoria) {
            throw ValidationException::withMessages([
                'categoria_id' => 'No existe la categoría TERNERO/TERNERA para registrar la cría.',
            ]);
        }

        if ($animalId) {
            $animal = Animal::query()->findOrFail($animalId);
            $updates = [];

            if ($animal->fecha_nacimiento === null && ! empty($contexto['fecha_nacimiento'])) {
                $updates['fecha_nacimiento'] = $contexto['fecha_nacimiento'];
            }
            if ($animal->madre_id === null && ! empty($contexto['madre_id'])) {
                $updates['madre_id'] = $contexto['madre_id'];
            }
            if ($animal->padre_id === null && ! empty($contexto['padre_id'])) {
                $updates['padre_id'] = $contexto['padre_id'];
            }
            if ($animal->arete === null && ! empty($contexto['arete'])) {
                $updates['arete'] = $contexto['arete'];
            }
            if ($animal->edad_inicial === null) {
                $updates['edad_inicial'] = 0;
                $updates['edad_actual'] = $animal->edad_actual ?? 0;
            }

            if ($updates !== []) {
                $animal->update($updates);
            }

            return $animal->fresh() ?? $animal;
        }

        $arete = $contexto['arete'] ?? null;
        if ($arete && Animal::query()->where('arete', $arete)->exists()) {
            $arete = null;
        }

        return $this->create([
            'sexo' => $sexo,
            'categoria_id' => $categoria->id,
            'fecha_nacimiento' => $contexto['fecha_nacimiento'] ?? null,
            'arete' => $arete,
            'madre_id' => $contexto['madre_id'] ?? null,
            'padre_id' => $contexto['padre_id'] ?? null,
            'raza_id' => $contexto['raza_id'] ?? null,
            'user_id' => $contexto['user_id'] ?? Auth::id(),
            'edad_inicial' => 0,
            'edad_actual' => 0,
            'activo' => true,
        ]);
    }

    /**
     * Identifica animales en líneas comerciales: reutiliza animal_id o crea preliminares.
     * Si cantidad > 1 y no hay animal_id, genera una línea por ejemplar (cantidad = 1).
     *
     * @param  array<int, array<string, mixed>>  $lineas
     * @return list<array<string, mixed>>
     */
    public function identificarEnDetalles(array $lineas): array
    {
        $identificadas = [];
        $cantidadSolicitada = 0;

        foreach ($lineas as $index => $linea) {
            $sexo = strtoupper((string) ($linea['sexo'] ?? ''));
            $categoriaId = (int) ($linea['categoria_animal_id'] ?? 0);
            $cantidad = (int) ($linea['cantidad'] ?? 0);
            $animalId = ! empty($linea['animal_id']) ? (int) $linea['animal_id'] : null;
            $cantidadSolicitada += $cantidad;

            if (! in_array($sexo, ['M', 'H'], true)) {
                throw ValidationException::withMessages([
                    "detalles.$index.sexo" => 'Cada animal debe tener sexo M o H.',
                ]);
            }

            if ($cantidad < 1) {
                throw ValidationException::withMessages([
                    "detalles.$index.cantidad" => 'La cantidad debe ser mayor a cero.',
                ]);
            }

            $edad = array_key_exists('edad', $linea) && $linea['edad'] !== null && $linea['edad'] !== ''
                ? (int) $linea['edad']
                : null;

            if ($edad !== null && $edad < 0) {
                throw ValidationException::withMessages([
                    "detalles.$index.edad" => 'La edad inicial no puede ser negativa.',
                ]);
            }

            if ($animalId) {
                if ($cantidad !== 1) {
                    throw ValidationException::withMessages([
                        "detalles.$index.cantidad" => 'Un animal ya identificado debe tener cantidad 1. Agregue otra línea para más ejemplares.',
                    ]);
                }

                $animal = $this->asegurarPreliminar($animalId, $categoriaId, $sexo, [
                    'edad_inicial' => $edad,
                ]);
                $identificada = $this->mergeLineaIdentificada($linea, $animal, $index);
                $identificada['edad'] = $edad ?? $animal->edad_inicial;
                $identificadas[] = $identificada;

                continue;
            }

            for ($i = 0; $i < $cantidad; $i++) {
                $animal = $this->asegurarPreliminar(null, $categoriaId, $sexo, [
                    'edad_inicial' => $edad,
                ]);
                $fila = $this->mergeLineaIdentificada($linea, $animal, $index);
                $fila['cantidad'] = 1;
                $fila['edad'] = $edad ?? $animal->edad_inicial;
                if ($i > 0) {
                    $fila['descuento'] = 0;
                    $fila['subtotal'] = round((float) $fila['precio'], 2);
                } else {
                    $fila['subtotal'] = round((float) $fila['precio'] - (float) $fila['descuento'], 2);
                }
                $identificadas[] = $fila;
            }
        }

        if (count($identificadas) !== $cantidadSolicitada) {
            throw ValidationException::withMessages([
                'detalles' => 'La cantidad de animales identificados no coincide con la cantidad indicada en el detalle.',
            ]);
        }

        $ids = array_map(fn (array $fila) => (int) $fila['animal_id'], $identificadas);
        if (count($ids) !== count(array_unique($ids))) {
            throw ValidationException::withMessages([
                'detalles' => 'No se puede asociar el mismo animal más de una vez.',
            ]);
        }

        return $identificadas;
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Animal
    {
        return DB::transaction(function () use ($data) {
            if (empty($data['codigo'])) {
                $data['codigo'] = $this->buildSiguienteCodigo((int) $data['categoria_id'], lock: true);
            }

            if (! empty($data['lote_id'])) {
                $this->assertLoteTieneCapacidad((int) $data['lote_id']);
            }

            if (empty($data['user_id'])) {
                $data['user_id'] = Auth::id() ?? User::query()->orderBy('id')->value('id');
            }

            if (array_key_exists('edad_inicial', $data) && $data['edad_inicial'] !== null
                && (! array_key_exists('edad_actual', $data) || $data['edad_actual'] === null)) {
                $data['edad_actual'] = $data['edad_inicial'];
            }

            $animal = Animal::query()->create($data);

            return $animal->load(self::RELATIONS);
        });
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Animal $animal, array $data): Animal
    {
        if (! empty($data['lote_id'])) {
            $this->assertLoteTieneCapacidad((int) $data['lote_id'], $animal->id);
        }

        $animal->update($data);

        return $animal->fresh(self::RELATIONS);
    }

    public function delete(Animal $animal): void
    {
        $animal->activo = false;
        $animal->save();
        $animal->delete();
    }

    public function restore(int $id): Animal
    {
        $animal = Animal::onlyTrashed()->findOrFail($id);
        $animal->restore();

        return $animal->fresh(self::RELATIONS);
    }

    public function toggleStatus(Animal $animal): Animal
    {
        $animal->activo = ! $animal->activo;
        $animal->save();

        return $animal->fresh(self::RELATIONS);
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return Builder<Animal>
     */
    private function buildQuery(array $filters, bool $onlyTrashed = false): Builder
    {
        $query = $onlyTrashed
            ? Animal::onlyTrashed()
            : Animal::query();

        $query->with(self::RELATIONS);

        if (! empty($filters['search'])) {
            $search = (string) $filters['search'];

            $query->where(function (Builder $builder) use ($search) {
                $builder->where('nombre', 'like', "%{$search}%")
                    ->orWhere('codigo', 'like', "%{$search}%")
                    ->orWhere('arete', 'like', "%{$search}%")
                    ->orWhere('color', 'like', "%{$search}%")
                    ->orWhereHas('raza', fn (Builder $q) => $q->where('nombre', 'like', "%{$search}%"))
                    ->orWhereHas('lote', fn (Builder $q) => $q->where('nombre', 'like', "%{$search}%"));
            });
        }

        if (! empty($filters['raza_id'])) {
            $query->where('raza_id', (int) $filters['raza_id']);
        }

        if (! empty($filters['categoria_id'])) {
            $query->where('categoria_id', (int) $filters['categoria_id']);
        }

        if (! empty($filters['estado_productivo_id'])) {
            $query->where('estado_productivo_id', (int) $filters['estado_productivo_id']);
        }

        if (! empty($filters['lote_id'])) {
            $query->where('lote_id', (int) $filters['lote_id']);
        }

        if (! empty($filters['sexo']) && in_array($filters['sexo'], ['M', 'H'], true)) {
            $query->where('sexo', $filters['sexo']);
        }

        if (array_key_exists('activo', $filters) && $filters['activo'] !== null && $filters['activo'] !== '') {
            $query->where('activo', filter_var($filters['activo'], FILTER_VALIDATE_BOOLEAN));
        }

        $sortBy = in_array($filters['sort_by'] ?? '', self::SORTABLE_COLUMNS, true)
            ? $filters['sort_by']
            : 'codigo';

        $sortDir = strtolower((string) ($filters['sort_dir'] ?? 'asc')) === 'desc' ? 'desc' : 'asc';

        return $query->orderBy($sortBy, $sortDir);
    }

    private function buildSiguienteCodigo(int $categoriaId, bool $lock): string
    {
        $categoria = CategoriaAnimal::query()->findOrFail($categoriaId);
        $token = Str::upper((string) preg_replace('/[^A-Za-z0-9]/', '', (string) $categoria->codigo));
        if ($token === '') {
            $token = 'ANIM';
        }

        $prefix = "AN-{$token}-";

        $query = Animal::withTrashed()
            ->where('codigo', 'like', $prefix.'%')
            ->orderByDesc('codigo');

        if ($lock) {
            $query->lockForUpdate();
        }

        $ultimo = $query->value('codigo');

        $secuencia = 1;
        if ($ultimo && preg_match('/'.preg_quote($prefix, '/').'(\d+)$/', $ultimo, $matches)) {
            $secuencia = ((int) $matches[1]) + 1;
        }

        return $prefix.str_pad((string) $secuencia, 3, '0', STR_PAD_LEFT);
    }

    /**
     * @param  array<string, mixed>  $linea
     * @return array<string, mixed>
     */
    private function mergeLineaIdentificada(array $linea, Animal $animal, int $index): array
    {
        if ($animal->categoria_id !== (int) $linea['categoria_animal_id']) {
            throw ValidationException::withMessages([
                "detalles.$index.categoria_animal_id" => 'La categoría no coincide con el animal identificado.',
            ]);
        }

        $linea['animal_id'] = $animal->id;
        $linea['categoria_animal_id'] = $animal->categoria_id;
        $linea['sexo'] = $animal->sexo;

        return $linea;
    }

    private function assertLoteTieneCapacidad(int $loteId, ?int $excludeAnimalId = null): void
    {
        $lote = Lote::query()->findOrFail($loteId);

        if ($lote->capacidad_animales <= 0) {
            return;
        }

        $query = Animal::query()
            ->where('lote_id', $loteId)
            ->whereNull('deleted_at');

        if ($excludeAnimalId) {
            $query->where('id', '!=', $excludeAnimalId);
        }

        $asignados = $query->count();

        if ($asignados >= $lote->capacidad_animales) {
            throw ValidationException::withMessages([
                'lote_id' => "El lote {$lote->nombre} ha alcanzado su capacidad máxima ({$lote->capacidad_animales} animales).",
            ]);
        }
    }
}
