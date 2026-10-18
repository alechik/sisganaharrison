<?php

namespace App\Services\EventosSanitarios;

use App\Models\Almacen;
use App\Models\Animal;
use App\Models\DetallePesaje;
use App\Models\EventoSanitario;
use App\Models\Medicamento;
use App\Models\MovimientoInventario;
use App\Models\TipoEventoSanitario;
use App\Services\Documentos\PdfGenerator;
use App\Services\Inventario\InventarioService;
use Illuminate\Http\Response;
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
        'detalles.almacen:id,nombre',
    ];

    public function __construct(
        private readonly InventarioService $inventarioService,
        private readonly PdfGenerator $pdfGenerator
    ) {}

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
                'codigo_evento_sanitario' => $this->nextCodigo(),
                'fecha' => $data['fecha'],
                'diagnostico' => $data['diagnostico'] ?? null,
                'tratamiento' => $data['tratamiento'] ?? null,
                'observaciones' => $data['observaciones'] ?? null,
                'total' => 0,
            ]);

            $total = 0;
            foreach ($detalles as $linea) {
                $detalle = $evento->detalles()->create($linea);
                $total += $linea['precio_medicamento'] * $linea['cantidad'];
                $this->inventarioService->registrar([
                    'almacen_id' => $linea['almacen_id'],
                    'medicamento_id' => $linea['medicamento_id'],
                    'tipo' => MovimientoInventario::TIPO_CONSUMO_SANITARIO,
                    'cantidad' => -1 * (float) $linea['cantidad'],
                    'precio_unitario' => $linea['precio_medicamento'],
                    'origen_type' => 'evento_sanitario',
                    'origen_id' => $detalle->id,
                    'observaciones' => 'Consumo '.$evento->codigo_evento_sanitario,
                ]);
            }

            $evento->total = round($total, 2);
            $evento->save();

            return $evento->fresh(self::RELATIONS);
        });
    }

    public function pdf(EventoSanitario $evento): Response
    {
        $evento->load(self::RELATIONS);

        return $this->pdfGenerator->download(
            'documentos.evento-sanitario',
            [
                'titulo' => 'Evento Sanitario',
                'evento' => $evento,
            ],
            ($evento->codigo_evento_sanitario ?? 'EVS-'.$evento->id).'.pdf'
        );
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
     * @return list<array{animal_id: int, lote_id: int, medicamento_id: int, almacen_id: int, cantidad: float, peso_animal: float, precio_medicamento: float}>
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
            $almacenId = (int) ($linea['almacen_id'] ?? 0);
            $cantidad = round((float) ($linea['cantidad'] ?? 1), 2);

            if ($animalId < 1) {
                throw ValidationException::withMessages([
                    "detalles.$index.animal_id" => 'Debe seleccionar un animal.',
                ]);
            }

            $clave = $animalId.'-'.$medicamentoId;
            if (in_array($clave, $vistos, true)) {
                throw ValidationException::withMessages([
                    "detalles.$index.animal_id" => 'El mismo animal no puede repetir el mismo producto en el evento.',
                ]);
            }

            if ($medicamentoId < 1) {
                throw ValidationException::withMessages([
                    "detalles.$index.medicamento_id" => 'Debe seleccionar un producto.',
                ]);
            }
            if ($almacenId < 1) {
                throw ValidationException::withMessages([
                    "detalles.$index.almacen_id" => 'Debe seleccionar el almacén de origen.',
                ]);
            }
            if ($cantidad <= 0) {
                throw ValidationException::withMessages([
                    "detalles.$index.cantidad" => 'La cantidad utilizada debe ser mayor a cero.',
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
                    "detalles.$index.medicamento_id" => 'El producto seleccionado no está activo o no existe.',
                ]);
            }

            $almacen = Almacen::query()
                ->whereKey($almacenId)
                ->where('activo', true)
                ->whereNull('deleted_at')
                ->first();
            if (! $almacen) {
                throw ValidationException::withMessages([
                    "detalles.$index.almacen_id" => 'El almacén seleccionado no existe o no está activo.',
                ]);
            }

            $peso = $this->pesoActual($animal->id);
            if ($peso === null) {
                throw ValidationException::withMessages([
                    "detalles.$index.animal_id" => 'El animal no tiene un peso registrado.',
                ]);
            }

            $vistos[] = $clave;
            $normalizados[] = [
                'animal_id' => $animal->id,
                'lote_id' => (int) $animal->lote_id,
                'medicamento_id' => $medicamento->id,
                'almacen_id' => $almacen->id,
                'cantidad' => $cantidad,
                'peso_animal' => $peso,
                'precio_medicamento' => round((float) $medicamento->precio, 2),
            ];
        }

        return $normalizados;
    }

    private function nextCodigo(): string
    {
        $ultimo = EventoSanitario::query()->lockForUpdate()->orderByDesc('id')->value('codigo_evento_sanitario');
        $n = 1;
        if (is_string($ultimo) && preg_match('/(\d+)$/', $ultimo, $m)) {
            $n = (int) $m[1] + 1;
        }

        return 'EVS-'.str_pad((string) $n, 6, '0', STR_PAD_LEFT);
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
