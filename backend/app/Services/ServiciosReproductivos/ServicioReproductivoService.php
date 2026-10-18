<?php

namespace App\Services\ServiciosReproductivos;

use App\Models\Almacen;
use App\Models\Animal;
use App\Models\Medicamento;
use App\Models\MovimientoInventario;
use App\Models\ServicioReproductivo;
use App\Services\Documentos\PdfGenerator;
use App\Services\Inventario\InventarioService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ServicioReproductivoService
{
    private const SORTABLE_COLUMNS = ['fecha_servicio', 'tipo_servicio', 'created_at'];

    private const RELATIONS = [
        'hembra:id,codigo,arete,sexo',
        'macho:id,codigo,arete,sexo',
        'usuario:id,nombre,apellido',
        'insumos.medicamento:id,codigo,nombre,precio',
        'insumos.almacen:id,nombre',
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

    public function find(int $id): ServicioReproductivo
    {
        return ServicioReproductivo::query()
            ->with(self::RELATIONS)
            ->findOrFail($id);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): ServicioReproductivo
    {
        $this->assertAnimalesValidos($data);
        $insumos = $this->normalizeInsumos($data['insumos'] ?? []);

        return DB::transaction(function () use ($data, $insumos) {
            unset($data['insumos']);
            $data['user_id'] = Auth::id();
            $data['codigo_servicio'] = $this->nextCodigo();
            $data['total'] = $this->totalInsumos($insumos);

            $servicio = ServicioReproductivo::query()->create($data);
            foreach ($insumos as $linea) {
                $servicio->insumos()->create($linea);
            }

            $servicio = $servicio->fresh(self::RELATIONS);
            $this->aplicarInventarioSiCorresponde($servicio);

            return $servicio->fresh(self::RELATIONS);
        });
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(ServicioReproductivo $servicio, array $data): ServicioReproductivo
    {
        $this->assertAnimalesValidos($data);
        $insumos = array_key_exists('insumos', $data)
            ? $this->normalizeInsumos($data['insumos'] ?? [])
            : null;

        return DB::transaction(function () use ($servicio, $data, $insumos) {
            unset($data['insumos'], $data['user_id'], $data['codigo_servicio']);

            if ($insumos !== null) {
                if ($servicio->inventario_aplicado_at) {
                    throw ValidationException::withMessages([
                        'insumos' => 'No se pueden modificar insumos de un servicio que ya consumió inventario.',
                    ]);
                }
                $servicio->insumos()->delete();
                foreach ($insumos as $linea) {
                    $servicio->insumos()->create($linea);
                }
                $data['total'] = $this->totalInsumos($insumos);
            }

            $servicio->update($data);
            $servicio = $servicio->fresh(self::RELATIONS);
            $this->aplicarInventarioSiCorresponde($servicio);

            return $servicio->fresh(self::RELATIONS);
        });
    }

    public function pdf(ServicioReproductivo $servicio): Response
    {
        $servicio->load(self::RELATIONS);

        return $this->pdfGenerator->download(
            'documentos.servicio-reproductivo',
            [
                'titulo' => 'Servicio Reproductivo',
                'servicio' => $servicio,
            ],
            ($servicio->codigo_servicio ?? 'SRV-'.$servicio->id).'.pdf'
        );
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return Builder<ServicioReproductivo>
     */
    private function buildQuery(array $filters): Builder
    {
        $query = ServicioReproductivo::query()->with(self::RELATIONS);

        if (! empty($filters['search'])) {
            $search = (string) $filters['search'];

            $query->where(function (Builder $builder) use ($search) {
                $builder->where('tipo_servicio', 'like', "%{$search}%")
                    ->orWhere('resultado', 'like', "%{$search}%")
                    ->orWhere('codigo_servicio', 'like', "%{$search}%")
                    ->orWhere('observaciones', 'like', "%{$search}%")
                    ->orWhereHas('hembra', function (Builder $hembraQuery) use ($search) {
                        $hembraQuery->where('codigo', 'like', "%{$search}%")
                            ->orWhere('arete', 'like', "%{$search}%");
                    })
                    ->orWhereHas('macho', function (Builder $machoQuery) use ($search) {
                        $machoQuery->where('codigo', 'like', "%{$search}%")
                            ->orWhere('arete', 'like', "%{$search}%");
                    });
            });
        }

        if (! empty($filters['hembra_id'])) {
            $query->where('hembra_id', (int) $filters['hembra_id']);
        }

        if (! empty($filters['macho_id'])) {
            $query->where('macho_id', (int) $filters['macho_id']);
        }

        if (! empty($filters['tipo_servicio'])) {
            $query->where('tipo_servicio', (string) $filters['tipo_servicio']);
        }

        if (! empty($filters['resultado'])) {
            $query->where('resultado', (string) $filters['resultado']);
        }

        if (! empty($filters['sin_gestacion'])) {
            $incluirId = ! empty($filters['incluir_id']) ? (int) $filters['incluir_id'] : null;

            $query->where(function (Builder $builder) use ($incluirId) {
                $builder->whereDoesntHave('gestacion');
                if ($incluirId) {
                    $builder->orWhereKey($incluirId);
                }
            });
        }

        if (! empty($filters['fecha_desde'])) {
            $query->whereDate('fecha_servicio', '>=', $filters['fecha_desde']);
        }

        if (! empty($filters['fecha_hasta'])) {
            $query->whereDate('fecha_servicio', '<=', $filters['fecha_hasta']);
        }

        $sortBy = in_array($filters['sort_by'] ?? '', self::SORTABLE_COLUMNS, true)
            ? $filters['sort_by']
            : 'fecha_servicio';

        $sortDir = strtolower((string) ($filters['sort_dir'] ?? 'desc')) === 'asc' ? 'asc' : 'desc';

        return $query->orderBy($sortBy, $sortDir);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function assertAnimalesValidos(array $data): void
    {
        $hembra = $this->assertAnimalActivoPorSexo((int) $data['hembra_id'], 'H', 'hembra_id');
        $this->assertAreteValido($hembra, 'hembra_id');

        if (! empty($data['macho_id'])) {
            $machoId = (int) $data['macho_id'];

            if ($machoId === $hembra->id) {
                throw ValidationException::withMessages([
                    'macho_id' => 'La hembra y el macho no pueden ser el mismo animal.',
                ]);
            }

            $macho = $this->assertAnimalActivoPorSexo($machoId, 'M', 'macho_id');
            $this->assertAreteValido($macho, 'macho_id');
        }
    }

    private function assertAreteValido(Animal $animal, string $field): void
    {
        if ($animal->tieneAreteValido()) {
            return;
        }

        $label = $field === 'hembra_id' ? 'hembra' : 'macho';

        throw ValidationException::withMessages([
            $field => "El animal seleccionado como {$label} debe tener un arete asignado y válido.",
        ]);
    }

    private function assertAnimalActivoPorSexo(int $animalId, string $sexo, string $field): Animal
    {
        $animal = Animal::query()
            ->where('id', $animalId)
            ->where('sexo', $sexo)
            ->where('estado', Animal::ESTADO_ACTIVO)
            ->whereNull('deleted_at')
            ->first();

        if (! $animal) {
            $label = $sexo === 'H' ? 'hembra' : 'macho';

            throw ValidationException::withMessages([
                $field => "El animal seleccionado como {$label} no está activo, no existe o no tiene el sexo correcto.",
            ]);
        }

        return $animal;
    }

    /**
     * @param  array<int, array<string, mixed>>  $insumos
     * @return list<array{medicamento_id:int, almacen_id:int, precio:float, cantidad:int}>
     */
    private function normalizeInsumos(array $insumos): array
    {
        $normalizados = [];
        $vistos = [];
        foreach ($insumos as $index => $linea) {
            $productoId = (int) ($linea['medicamento_id'] ?? 0);
            $almacenId = (int) ($linea['almacen_id'] ?? 0);
            $cantidad = (int) ($linea['cantidad'] ?? 0);
            if ($productoId < 1 || $almacenId < 1 || $cantidad < 1) {
                throw ValidationException::withMessages([
                    "insumos.$index.medicamento_id" => 'Cada insumo requiere producto, almacén y cantidad.',
                ]);
            }
            $clave = $productoId.'-'.$almacenId;
            if (in_array($clave, $vistos, true)) {
                throw ValidationException::withMessages([
                    "insumos.$index.medicamento_id" => 'El mismo producto no puede repetirse para el mismo almacén.',
                ]);
            }
            $producto = Medicamento::query()->whereKey($productoId)->where('activo', true)->whereNull('deleted_at')->first();
            $almacen = Almacen::query()->whereKey($almacenId)->where('activo', true)->whereNull('deleted_at')->first();
            if (! $producto || ! $almacen) {
                throw ValidationException::withMessages([
                    "insumos.$index.medicamento_id" => 'El producto o el almacén no están activos.',
                ]);
            }
            $vistos[] = $clave;
            $normalizados[] = [
                'medicamento_id' => $producto->id,
                'almacen_id' => $almacen->id,
                'precio' => round((float) $producto->precio, 2),
                'cantidad' => $cantidad,
            ];
        }

        return $normalizados;
    }

    /**
     * @param  list<array{precio:float, cantidad:int}>  $insumos
     */
    private function totalInsumos(array $insumos): float
    {
        $total = 0;
        foreach ($insumos as $linea) {
            $total += $linea['precio'] * $linea['cantidad'];
        }

        return round($total, 2);
    }

    private function aplicarInventarioSiCorresponde(ServicioReproductivo $servicio): void
    {
        if ($servicio->inventario_aplicado_at || ! $servicio->debeConsumirInventario()) {
            return;
        }

        foreach ($servicio->insumos as $insumo) {
            $this->inventarioService->registrar([
                'almacen_id' => (int) $insumo->almacen_id,
                'medicamento_id' => (int) $insumo->medicamento_id,
                'tipo' => MovimientoInventario::TIPO_CONSUMO_REPRODUCTIVO,
                'cantidad' => -1 * (int) $insumo->cantidad,
                'precio_unitario' => (float) $insumo->precio,
                'origen_type' => 'servicio_reproductivo',
                'origen_id' => $insumo->id,
                'observaciones' => 'Consumo '.$servicio->codigo_servicio,
            ]);
        }

        $servicio->inventario_aplicado_at = now();
        $servicio->save();
    }

    private function nextCodigo(): string
    {
        $ultimo = ServicioReproductivo::query()->lockForUpdate()->orderByDesc('id')->value('codigo_servicio');
        $n = 1;
        if (is_string($ultimo) && preg_match('/(\d+)$/', $ultimo, $m)) {
            $n = (int) $m[1] + 1;
        }

        return 'SRV-'.str_pad((string) $n, 6, '0', STR_PAD_LEFT);
    }
}
