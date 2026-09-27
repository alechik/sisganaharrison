<?php

namespace App\Services\Ventas;

use App\Models\Animal;
use App\Models\AnimalEvento;
use App\Models\DetalleVenta;
use App\Models\Persona;
use App\Models\TipoPersona;
use App\Models\User;
use App\Models\Venta;
use App\Services\Documentos\PdfGenerator;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Response;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class VentaService
{
    private const SORTABLE_COLUMNS = ['cod_venta', 'fecha_venta', 'estado', 'monto_total', 'created_at'];

    private const RELATIONS = [
        'cliente:id,razon_social,nit,email',
        'creador:id,nombre,apellido',
        'autorizador:id,nombre,apellido',
        'detalles.animal:id,codigo,arete,sexo,categoria_id,lote_id,estado',
        'detalles.animal.categoria:id,codigo,nombre',
        'detalles.animal.lote:id,nombre,codigo,potrero_id',
        'detalles.animal.lote.potrero:id,nombre',
        'detalles.lote:id,nombre,codigo,potrero_id',
        'detalles.lote.potrero:id,nombre',
    ];

    public function __construct(
        private readonly PdfGenerator $pdfGenerator
    ) {}

    /**
     * @param  array<string, mixed>  $filters
     */
    public function paginate(array $filters = [], ?User $actor = null): LengthAwarePaginator
    {
        return $this->buildQuery($filters, $actor)
            ->paginate((int) ($filters['per_page'] ?? 10));
    }

    public function find(int $id): Venta
    {
        return Venta::query()
            ->with(self::RELATIONS)
            ->findOrFail($id);
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return Collection<int, Animal>
     */
    public function animalesDisponibles(array $filters = [], ?int $ventaId = null): Collection
    {
        $query = Animal::query()
            ->with([
                'categoria:id,codigo,nombre',
                'lote:id,nombre,codigo,potrero_id',
                'lote.potrero:id,nombre',
                'detallesPesaje' => fn ($builder) => $builder->latest('id')->limit(1),
            ])
            ->whereNull('deleted_at')
            ->where(function (Builder $builder) use ($ventaId) {
                $builder->disponiblesParaVenta();
                if ($ventaId) {
                    $builder->orWhere(function (Builder $inner) use ($ventaId) {
                        $inner->where('estado', Animal::ESTADO_RESERVADO)
                            ->whereIn('id', DetalleVenta::query()->where('venta_id', $ventaId)->select('animal_id'));
                    });
                }
            });

        if (! empty($filters['potrero_id'])) {
            $query->whereHas('lote', fn (Builder $builder) => $builder->where('potrero_id', (int) $filters['potrero_id']));
        }

        if (! empty($filters['lote_id'])) {
            $query->where('lote_id', (int) $filters['lote_id']);
        }

        if (! empty($filters['categoria_id'])) {
            $query->where('categoria_id', (int) $filters['categoria_id']);
        }

        return $query->orderBy('codigo')->get();
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Venta
    {
        $this->assertCliente((int) $data['cliente_id']);

        return DB::transaction(function () use ($data) {
            $detalles = $this->normalizeDetalles($data['detalles'] ?? []);

            $venta = Venta::query()->create([
                'cliente_id' => $data['cliente_id'],
                'user_id' => Auth::id(),
                'cod_venta' => $this->nextCodigo(),
                'fecha_venta' => $data['fecha_venta'] ?? now()->toDateString(),
                'estado' => Venta::ESTADO_PENDIENTE,
                'descuento' => (float) ($data['descuento'] ?? 0),
                'total_peso' => 0,
                'monto_total' => 0,
            ]);

            $this->syncDetalles($venta, $detalles);
            $this->recalculateTotals($venta);

            return $venta->fresh(self::RELATIONS);
        });
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Venta $venta, array $data): Venta
    {
        $this->assertModificable($venta);
        $this->assertCliente((int) $data['cliente_id']);

        return DB::transaction(function () use ($venta, $data) {
            $detalles = $this->normalizeDetalles($data['detalles'] ?? [], $venta->id);
            $venta->update([
                'cliente_id' => $data['cliente_id'],
                'fecha_venta' => $data['fecha_venta'] ?? $venta->fecha_venta,
                'descuento' => (float) ($data['descuento'] ?? 0),
            ]);

            $this->syncDetalles($venta, $detalles);
            $this->recalculateTotals($venta);

            return $venta->fresh(self::RELATIONS);
        });
    }

    public function autorizar(Venta $venta, ?string $observacion = null): Venta
    {
        $this->assertPendiente($venta);

        $venta->update([
            'estado' => Venta::ESTADO_AUTORIZADA,
            'autorizado_por' => Auth::id(),
            'fecha_decision' => now(),
            'observacion_estado' => $observacion,
        ]);

        return $venta->fresh(self::RELATIONS);
    }

    public function anular(Venta $venta, ?string $observacion = null): Venta
    {
        $this->assertPendiente($venta);

        return DB::transaction(function () use ($venta, $observacion) {
            $venta->load('detalles');
            $this->liberarAnimales($venta->detalles->pluck('animal_id')->all(), $venta);

            $venta->update([
                'estado' => Venta::ESTADO_ANULADA,
                'autorizado_por' => Auth::id(),
                'fecha_decision' => now(),
                'observacion_estado' => $observacion,
            ]);

            return $venta->fresh(self::RELATIONS);
        });
    }

    public function pdf(Venta $venta, bool $inline = false): Response
    {
        $venta->load(self::RELATIONS);

        $labels = [
            Venta::ESTADO_PENDIENTE => 'Pendiente',
            Venta::ESTADO_AUTORIZADA => 'Autorizada',
            Venta::ESTADO_ANULADA => 'Anulada',
        ];

        $payload = [
            'titulo' => 'Venta',
            'venta' => $venta,
            'estado_label' => $labels[$venta->estado] ?? $venta->estado,
        ];

        $filename = $venta->cod_venta.'.pdf';

        return $inline
            ? $this->pdfGenerator->stream('documentos.venta', $payload, $filename)
            : $this->pdfGenerator->download('documentos.venta', $payload, $filename);
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return Builder<Venta>
     */
    private function buildQuery(array $filters, ?User $actor): Builder
    {
        $query = Venta::query()->with(self::RELATIONS);

        if ($actor && ! $actor->can('ventas.authorize') && ! $actor->hasRole('super-admin')) {
            $query->where('user_id', $actor->id);
        }

        if (! empty($filters['cod_venta'])) {
            $query->where('cod_venta', 'like', '%'.$filters['cod_venta'].'%');
        }

        if (! empty($filters['cliente'])) {
            $search = (string) $filters['cliente'];
            $query->whereHas('cliente', fn (Builder $builder) => $builder->where('razon_social', 'like', "%{$search}%"));
        }

        if (! empty($filters['cliente_id'])) {
            $query->where('cliente_id', (int) $filters['cliente_id']);
        }

        if (! empty($filters['estado'])) {
            $query->where('estado', strtoupper((string) $filters['estado']));
        }

        if (! empty($filters['fecha_desde'])) {
            $query->whereDate('fecha_venta', '>=', $filters['fecha_desde']);
        }

        if (! empty($filters['fecha_hasta'])) {
            $query->whereDate('fecha_venta', '<=', $filters['fecha_hasta']);
        }

        $sortBy = in_array($filters['sort_by'] ?? '', self::SORTABLE_COLUMNS, true)
            ? $filters['sort_by']
            : 'created_at';

        $sortDir = strtolower((string) ($filters['sort_dir'] ?? 'desc')) === 'asc' ? 'asc' : 'desc';

        return $query->orderBy($sortBy, $sortDir);
    }

    /**
     * @param  array<int, array<string, mixed>>  $detalles
     * @return list<array<string, mixed>>
     */
    private function normalizeDetalles(array $detalles, ?int $ventaId = null): array
    {
        if ($detalles === []) {
            throw ValidationException::withMessages([
                'detalles' => 'Debe agregar al menos un animal a la venta.',
            ]);
        }

        $vistos = [];
        $normalizados = [];

        foreach ($detalles as $index => $linea) {
            $animalId = (int) ($linea['animal_id'] ?? 0);
            if ($animalId < 1) {
                throw ValidationException::withMessages([
                    "detalles.$index.animal_id" => 'Debe seleccionar un animal.',
                ]);
            }

            if (in_array($animalId, $vistos, true)) {
                throw ValidationException::withMessages([
                    "detalles.$index.animal_id" => 'El mismo animal no puede repetirse en la venta.',
                ]);
            }

            $peso = round((float) ($linea['peso'] ?? 0), 2);
            $precio = round((float) ($linea['precio'] ?? 0), 2);
            $descuento = round((float) ($linea['descuento'] ?? 0), 2);

            if ($peso < 0.01) {
                throw ValidationException::withMessages([
                    "detalles.$index.peso" => 'El peso debe ser mayor a cero.',
                ]);
            }

            if ($precio < 0) {
                throw ValidationException::withMessages([
                    "detalles.$index.precio" => 'El precio no puede ser negativo.',
                ]);
            }

            $subtotal = round(max($precio - $descuento, 0), 2);
            $vistos[] = $animalId;
            $normalizados[] = [
                'animal_id' => $animalId,
                'cantidad' => 1,
                'peso' => $peso,
                'precio' => $precio,
                'descuento' => $descuento,
                'subtotal' => $subtotal,
            ];
        }

        $this->assertAnimalesDisponibles($vistos, $ventaId);

        return $normalizados;
    }

    /**
     * @param  list<int>  $animalIds
     */
    private function assertAnimalesDisponibles(array $animalIds, ?int $ventaId = null): void
    {
        $animales = Animal::query()
            ->whereIn('id', $animalIds)
            ->lockForUpdate()
            ->get()
            ->keyBy('id');

        foreach ($animalIds as $index => $animalId) {
            /** @var Animal|null $animal */
            $animal = $animales->get($animalId);
            if (! $animal || $animal->trashed()) {
                throw ValidationException::withMessages([
                    "detalles.$index.animal_id" => 'El animal seleccionado no existe.',
                ]);
            }

            $reservadoEnEstaVenta = $ventaId && $animal->estado === Animal::ESTADO_RESERVADO
                && DetalleVenta::query()->where('venta_id', $ventaId)->where('animal_id', $animalId)->exists();

            if (! $animal->estaDisponibleParaVenta() && ! $reservadoEnEstaVenta) {
                throw ValidationException::withMessages([
                    "detalles.$index.animal_id" => 'El animal no está disponible para una nueva venta.',
                ]);
            }

            $enOtraVenta = DetalleVenta::query()
                ->where('animal_id', $animalId)
                ->whereHas('venta', function (Builder $query) use ($ventaId) {
                    $query->whereIn('estado', [Venta::ESTADO_PENDIENTE, Venta::ESTADO_AUTORIZADA]);
                    if ($ventaId) {
                        $query->where('id', '!=', $ventaId);
                    }
                })
                ->exists();

            if ($enOtraVenta) {
                throw ValidationException::withMessages([
                    "detalles.$index.animal_id" => 'El animal ya está reservado en otra venta.',
                ]);
            }
        }
    }

    /**
     * @param  list<array<string, mixed>>  $detalles
     */
    private function syncDetalles(Venta $venta, array $detalles): void
    {
        $venta->load('detalles');
        $anteriores = $venta->detalles->pluck('animal_id')->map(fn ($id) => (int) $id)->all();
        $nuevos = array_map(fn (array $linea) => (int) $linea['animal_id'], $detalles);

        $aLiberar = array_values(array_diff($anteriores, $nuevos));
        $aReservar = array_values(array_diff($nuevos, $anteriores));

        $this->liberarAnimales($aLiberar, $venta);
        $this->reservarAnimales($aReservar, $venta);

        $venta->detalles()->delete();

        $animales = Animal::query()->whereIn('id', $nuevos)->get()->keyBy('id');

        foreach ($detalles as $linea) {
            $animal = $animales->get($linea['animal_id']);
            $venta->detalles()->create([
                'animal_id' => $linea['animal_id'],
                'cantidad' => 1,
                'peso' => $linea['peso'],
                'lote_id' => $animal?->lote_id,
                'precio' => $linea['precio'],
                'descuento' => $linea['descuento'],
                'subtotal' => $linea['subtotal'],
            ]);
        }
    }

    /**
     * @param  list<int>  $animalIds
     */
    private function reservarAnimales(array $animalIds, Venta $venta): void
    {
        if ($animalIds === []) {
            return;
        }

        Animal::query()->whereIn('id', $animalIds)->update(['estado' => Animal::ESTADO_RESERVADO]);

        foreach ($animalIds as $animalId) {
            AnimalEvento::query()->create([
                'animal_id' => $animalId,
                'tipo' => AnimalEvento::TIPO_RESERVA_VENTA,
                'fecha' => $venta->fecha_venta?->format('Y-m-d') ?? now()->toDateString(),
                'descripcion' => 'Animal reservado en venta '.$venta->cod_venta,
                'metadata' => [
                    'venta_id' => $venta->id,
                    'cod_venta' => $venta->cod_venta,
                ],
            ]);
        }
    }

    /**
     * @param  list<int>  $animalIds
     */
    private function liberarAnimales(array $animalIds, Venta $venta): void
    {
        if ($animalIds === []) {
            return;
        }

        Animal::query()
            ->whereIn('id', $animalIds)
            ->where('estado', Animal::ESTADO_RESERVADO)
            ->update(['estado' => Animal::ESTADO_ACTIVO]);

        foreach ($animalIds as $animalId) {
            AnimalEvento::query()->create([
                'animal_id' => $animalId,
                'tipo' => AnimalEvento::TIPO_LIBERACION_VENTA,
                'fecha' => now()->toDateString(),
                'descripcion' => 'Reserva liberada de la venta '.$venta->cod_venta,
                'metadata' => [
                    'venta_id' => $venta->id,
                    'cod_venta' => $venta->cod_venta,
                ],
            ]);
        }
    }

    private function recalculateTotals(Venta $venta): void
    {
        $venta->load('detalles');
        $venta->total_peso = round((float) $venta->detalles->sum('peso'), 2);
        $venta->monto_total = round(max((float) $venta->detalles->sum('subtotal') - (float) $venta->descuento, 0), 2);
        $venta->save();
    }

    private function nextCodigo(): string
    {
        $year = now()->year;
        $prefix = "VEN-{$year}-";

        $ultimo = Venta::query()
            ->where('cod_venta', 'like', $prefix.'%')
            ->lockForUpdate()
            ->orderByDesc('cod_venta')
            ->value('cod_venta');

        $secuencia = 1;
        if ($ultimo && preg_match('/VEN-\d{4}-(\d+)/', $ultimo, $matches)) {
            $secuencia = ((int) $matches[1]) + 1;
        }

        return $prefix.str_pad((string) $secuencia, 4, '0', STR_PAD_LEFT);
    }

    private function assertCliente(int $clienteId): void
    {
        $existe = Persona::query()
            ->whereKey($clienteId)
            ->whereHas('tipos', fn (Builder $builder) => $builder->where('tipo.nombre', TipoPersona::CLIENTE))
            ->exists();

        if (! $existe) {
            throw ValidationException::withMessages([
                'cliente_id' => 'El socio seleccionado no es un cliente.',
            ]);
        }
    }

    private function assertModificable(Venta $venta): void
    {
        if (! $venta->esModificable()) {
            throw ValidationException::withMessages([
                'estado' => 'Solo una venta pendiente puede editarse.',
            ]);
        }
    }

    private function assertPendiente(Venta $venta): void
    {
        if (! $venta->estaPendiente()) {
            throw ValidationException::withMessages([
                'estado' => 'Solo una venta pendiente puede autorizarse o anularse.',
            ]);
        }
    }
}
