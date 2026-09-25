<?php

namespace App\Services\Salidas;

use App\Models\Animal;
use App\Models\AnimalEvento;
use App\Models\DetalleSalida;
use App\Models\Salida;
use App\Models\TipoSalida;
use App\Models\Venta;
use App\Services\Documentos\PdfGenerator;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Response;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SalidaService
{
    private const SORTABLE_COLUMNS = ['codigo', 'fecha_salida', 'estado', 'monto_total', 'created_at'];

    private const RELATIONS = [
        'cliente:id,razon_social,nit',
        'creador:id,nombre,apellido',
        'tipoSalida:id,nombre',
        'venta:id,cod_venta,cliente_id,fecha_venta',
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
    public function paginate(array $filters = []): LengthAwarePaginator
    {
        return $this->buildQuery($filters)
            ->paginate((int) ($filters['per_page'] ?? 10));
    }

    public function find(int $id): Salida
    {
        return Salida::query()
            ->with(self::RELATIONS)
            ->findOrFail($id);
    }

    /**
     * @return Collection<int, Venta>
     */
    public function ventasDisponibles(): Collection
    {
        return Venta::query()
            ->with('cliente:id,razon_social')
            ->where('estado', Venta::ESTADO_AUTORIZADA)
            ->whereDoesntHave('salida')
            ->orderByDesc('fecha_venta')
            ->get();
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return Collection<int, Animal>
     */
    public function animalesDisponibles(array $filters = []): Collection
    {
        $search = trim((string) ($filters['search'] ?? ''));
        if (mb_strlen($search) < 2) {
            return collect();
        }

        return Animal::query()
            ->with([
                'categoria:id,codigo,nombre',
                'lote:id,nombre,codigo,potrero_id',
                'lote.potrero:id,nombre',
                'pesajes' => fn ($builder) => $builder->orderByDesc('fecha')->orderByDesc('id')->limit(1),
            ])
            ->whereNull('deleted_at')
            ->disponiblesParaSalida()
            ->whereNotIn('id', DetalleSalida::query()->select('animal_id'))
            ->where(function (Builder $builder) use ($search) {
                $builder->where('codigo', 'ilike', "%{$search}%")
                    ->orWhere('arete', 'ilike', "%{$search}%");
            })
            ->orderBy('codigo')
            ->limit(20)
            ->get();
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Salida
    {
        return DB::transaction(function () use ($data) {
            $tipo = TipoSalida::query()->lockForUpdate()->findOrFail((int) $data['tipo_salida_id']);
            $venta = $this->resolverVenta($tipo, $data['venta_id'] ?? null);
            $detalles = $this->normalizeDetalles($data['detalles'] ?? [], $tipo, $venta);
            $this->assertAnimalesDisponibles($detalles, $tipo, $venta);

            $salida = Salida::query()->create([
                'cliente_id' => $venta?->cliente_id ?? ($data['cliente_id'] ?? null),
                'user_id' => Auth::id(),
                'venta_id' => $venta?->id,
                'tipo_salida_id' => $tipo->id,
                'codigo' => $this->nextCodigo(),
                'fecha_salida' => $data['fecha_salida'] ?? now()->toDateString(),
                'estado' => Salida::ESTADO_REGISTRADO,
                'descuento' => (float) ($data['descuento'] ?? ($venta?->descuento ?? 0)),
                'total_peso' => 0,
                'monto_total' => 0,
            ]);

            $this->persistirDetalles($salida, $detalles);
            $this->actualizarEstadosAnimales($salida, $tipo);
            $this->recalculateTotals($salida);

            return $salida->fresh(self::RELATIONS);
        });
    }

    public function pdf(Salida $salida, bool $inline = false): Response
    {
        $salida->load(self::RELATIONS);

        $payload = [
            'titulo' => 'Salida',
            'salida' => $salida,
            'estado_label' => $salida->estado === Salida::ESTADO_REGISTRADO ? 'Registrada' : $salida->estado,
        ];

        $filename = $salida->codigo.'.pdf';

        return $inline
            ? $this->pdfGenerator->stream('documentos.salida', $payload, $filename)
            : $this->pdfGenerator->download('documentos.salida', $payload, $filename);
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return Builder<Salida>
     */
    private function buildQuery(array $filters): Builder
    {
        $query = Salida::query()->with(self::RELATIONS);

        if (! empty($filters['codigo'])) {
            $query->where('codigo', 'like', '%'.$filters['codigo'].'%');
        }

        if (! empty($filters['tipo_salida_id'])) {
            $query->where('tipo_salida_id', (int) $filters['tipo_salida_id']);
        }

        if (! empty($filters['estado'])) {
            $query->where('estado', strtoupper((string) $filters['estado']));
        }

        if (! empty($filters['cliente'])) {
            $search = (string) $filters['cliente'];
            $query->whereHas('cliente', fn (Builder $builder) => $builder->where('razon_social', 'like', "%{$search}%"));
        }

        if (! empty($filters['fecha_desde'])) {
            $query->whereDate('fecha_salida', '>=', $filters['fecha_desde']);
        }

        if (! empty($filters['fecha_hasta'])) {
            $query->whereDate('fecha_salida', '<=', $filters['fecha_hasta']);
        }

        $sortBy = in_array($filters['sort_by'] ?? '', self::SORTABLE_COLUMNS, true)
            ? $filters['sort_by']
            : 'created_at';

        $sortDir = strtolower((string) ($filters['sort_dir'] ?? 'desc')) === 'asc' ? 'asc' : 'desc';

        return $query->orderBy($sortBy, $sortDir);
    }

    private function resolverVenta(TipoSalida $tipo, mixed $ventaId): ?Venta
    {
        if ($tipo->esVenta()) {
            if (empty($ventaId)) {
                throw ValidationException::withMessages([
                    'venta_id' => 'Debe seleccionar una venta autorizada.',
                ]);
            }

            $venta = Venta::query()
                ->with('detalles')
                ->lockForUpdate()
                ->find((int) $ventaId);
            if (! $venta) {
                throw ValidationException::withMessages([
                    'venta_id' => 'La venta seleccionada no existe.',
                ]);
            }

            if ($venta->estado !== Venta::ESTADO_AUTORIZADA) {
                throw ValidationException::withMessages([
                    'venta_id' => 'Solo una venta autorizada puede generar una salida.',
                ]);
            }

            if ($venta->salida()->exists()) {
                throw ValidationException::withMessages([
                    'venta_id' => 'Esta venta ya tiene una salida registrada.',
                ]);
            }

            return $venta;
        }

        if (! empty($ventaId)) {
            throw ValidationException::withMessages([
                'venta_id' => 'venta_id solo aplica cuando el tipo de salida es Venta.',
            ]);
        }

        return null;
    }

    /**
     * @param  array<int, array<string, mixed>>  $detalles
     * @return list<array<string, mixed>>
     */
    private function normalizeDetalles(array $detalles, TipoSalida $tipo, ?Venta $venta): array
    {
        if ($detalles === []) {
            throw ValidationException::withMessages([
                'detalles' => 'Debe agregar al menos un animal a la salida.',
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
                    "detalles.$index.animal_id" => 'El mismo animal no puede repetirse en la salida.',
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

        if ($tipo->esVenta() && $venta) {
            $idsVenta = $venta->detalles->pluck('animal_id')->map(fn ($id) => (int) $id)->sort()->values()->all();
            $idsEnviados = collect($vistos)->sort()->values()->all();
            if ($idsVenta !== $idsEnviados) {
                throw ValidationException::withMessages([
                    'detalles' => 'La salida de venta debe incluir exactamente los animales de la venta seleccionada.',
                ]);
            }
        }

        return $normalizados;
    }

    /**
     * @param  list<array<string, mixed>>  $detalles
     */
    private function assertAnimalesDisponibles(array $detalles, TipoSalida $tipo, ?Venta $venta): void
    {
        $animalIds = array_map(fn (array $linea) => (int) $linea['animal_id'], $detalles);
        $animales = Animal::query()
            ->whereIn('id', $animalIds)
            ->lockForUpdate()
            ->get()
            ->keyBy('id');

        $yaSalieron = DetalleSalida::query()
            ->whereIn('animal_id', $animalIds)
            ->pluck('animal_id')
            ->all();

        foreach ($animalIds as $index => $animalId) {
            /** @var Animal|null $animal */
            $animal = $animales->get($animalId);
            if (! $animal || $animal->trashed()) {
                throw ValidationException::withMessages([
                    "detalles.$index.animal_id" => 'El animal seleccionado no existe.',
                ]);
            }

            if (in_array($animalId, $yaSalieron, true)) {
                throw ValidationException::withMessages([
                    "detalles.$index.animal_id" => 'El animal ya fue utilizado en otra salida.',
                ]);
            }

            if ($tipo->esVenta()) {
                if ($animal->estado !== Animal::ESTADO_RESERVADO) {
                    throw ValidationException::withMessages([
                        "detalles.$index.animal_id" => 'El animal de la venta no está reservado.',
                    ]);
                }
            } elseif (! $animal->estaDisponibleParaSalida()) {
                throw ValidationException::withMessages([
                    "detalles.$index.animal_id" => 'El animal no está disponible para una salida.',
                ]);
            }
        }
    }

    /**
     * @param  list<array<string, mixed>>  $detalles
     */
    private function persistirDetalles(Salida $salida, array $detalles): void
    {
        $ids = array_map(fn (array $linea) => (int) $linea['animal_id'], $detalles);
        $animales = Animal::query()->whereIn('id', $ids)->get()->keyBy('id');

        foreach ($detalles as $linea) {
            $animal = $animales->get($linea['animal_id']);
            $salida->detalles()->create([
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

    private function actualizarEstadosAnimales(Salida $salida, TipoSalida $tipo): void
    {
        $estado = $tipo->estadoAnimalResultante();
        $ids = $salida->detalles()->pluck('animal_id')->all();

        Animal::query()->whereIn('id', $ids)->update(['estado' => $estado]);

        foreach ($ids as $animalId) {
            AnimalEvento::query()->create([
                'animal_id' => $animalId,
                'tipo' => AnimalEvento::TIPO_SALIDA,
                'fecha' => $salida->fecha_salida?->format('Y-m-d') ?? now()->toDateString(),
                'descripcion' => 'Salida '.$salida->codigo.' ('.$tipo->nombre.')',
                'metadata' => [
                    'salida_id' => $salida->id,
                    'codigo' => $salida->codigo,
                    'tipo_salida_id' => $tipo->id,
                    'tipo_salida' => $tipo->nombre,
                    'venta_id' => $salida->venta_id,
                    'estado' => $estado,
                ],
            ]);
        }
    }

    private function recalculateTotals(Salida $salida): void
    {
        $salida->load('detalles');
        $salida->total_peso = round((float) $salida->detalles->sum('peso'), 2);
        $salida->monto_total = round(max((float) $salida->detalles->sum('subtotal') - (float) $salida->descuento, 0), 2);
        $salida->save();
    }

    private function nextCodigo(): string
    {
        $year = now()->year;
        $prefix = "SAL-{$year}-";

        $ultimo = Salida::query()
            ->where('codigo', 'like', $prefix.'%')
            ->lockForUpdate()
            ->orderByDesc('codigo')
            ->value('codigo');

        $secuencia = 1;
        if ($ultimo && preg_match('/SAL-\d{4}-(\d+)/', $ultimo, $matches)) {
            $secuencia = ((int) $matches[1]) + 1;
        }

        return $prefix.str_pad((string) $secuencia, 4, '0', STR_PAD_LEFT);
    }
}
