<?php

namespace App\Services\ServiciosReproductivos;

use App\Models\Almacen;
use App\Models\AlmacenProducto;
use App\Models\Animal;
use App\Models\Gestacion;
use App\Models\Medicamento;
use App\Models\MovimientoInventario;
use App\Models\ServicioReproductivo;
use App\Services\Documentos\PdfGenerator;
use App\Services\Gestaciones\GestacionService;
use App\Services\Inventario\InventarioService;
use App\Services\Nacimientos\NacimientoService;
use App\Services\Partos\PartoService;
use App\Support\ReglasReproductivas;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Response;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ServicioReproductivoService
{
    private const SORTABLE_COLUMNS = ['fecha_servicio', 'tipo_servicio', 'created_at'];

    private const RELATIONS = [
        'hembra:id,codigo,arete,sexo',
        'macho:id,codigo,arete,sexo',
        'usuario:id,nombre,apellido',
        'insumos.medicamento:id,codigo,nombre,precio',
        'insumos.almacen:id,nombre',
        'gestacion:id,servicio_id,estado,fecha_confirmacion,fecha_probable_parto,observaciones',
        'gestacion.parto:id,gestacion_id,fecha_parto,estado,observaciones',
        'gestacion.parto.nacimientos:id,parto_id,estado_nacimiento,sexo,arete,animal_id',
    ];

    public function __construct(
        private readonly InventarioService $inventarioService,
        private readonly PdfGenerator $pdfGenerator,
        private readonly GestacionService $gestacionService,
        private readonly PartoService $partoService,
        private readonly NacimientoService $nacimientoService,
        private readonly ServicioReproductivoExcelService $excelService
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
    /**
     * @param  array<string, mixed>  $filters
     * @return Collection<int, Animal>
     */
    public function animalesDisponibles(array $filters = []): Collection
    {
        $search = trim((string) ($filters['search'] ?? ''));
        if (mb_strlen($search) < 1) {
            return collect();
        }

        $sexo = strtoupper(trim((string) ($filters['sexo'] ?? '')));

        return Animal::query()
            ->with([
                'categoria:id,codigo,nombre',
                'lote:id,nombre,codigo,potrero_id',
                'lote.potrero:id,nombre',
                'detallesPesaje' => fn ($builder) => $builder->latest('id')->limit(1),
            ])
            ->whereNull('deleted_at')
            ->where('estado', Animal::ESTADO_ACTIVO)
            ->when(in_array($sexo, ['H', 'M'], true), fn (Builder $builder) => $builder->where('sexo', $sexo))
            ->tap(fn (Builder $builder) => Animal::aplicarFiltroAreteValido($builder))
            ->where(function (Builder $builder) use ($search) {
                $builder->where('arete', 'ilike', "%{$search}%")
                    ->orWhere('codigo', 'ilike', "%{$search}%");
            })
            ->orderBy('arete')
            ->limit(20)
            ->get();
    }

    /**
     * @return Collection<int, Medicamento>
     */
    public function semenDisponible(array $filters = []): Collection
    {
        $search = trim((string) ($filters['search'] ?? ''));

        return Medicamento::query()
            ->where('activo', true)
            ->whereNull('deleted_at')
            ->when($search !== '', function (Builder $builder) use ($search) {
                $builder->where(function (Builder $inner) use ($search) {
                    $inner->where('nombre', 'ilike', "%{$search}%")
                        ->orWhere('codigo', 'ilike', "%{$search}%");
                });
            })
            ->orderBy('nombre')
            ->limit(30)
            ->get(['id', 'codigo', 'nombre', 'precio']);
    }

    public function descargarPlantilla(): StreamedResponse
    {
        $plantilla = $this->excelService->plantilla();

        return response()->streamDownload(function () use ($plantilla) {
            echo $plantilla['content'];
        }, $plantilla['filename'], [
            'Content-Type' => $plantilla['mime'],
        ]);
    }

    /**
     * @return array{filas: list<array<string, mixed>>, validas: int, con_errores: int}
     */
    public function previewExcel(UploadedFile $file): array
    {
        $crudas = $this->excelService->parse($file);
        $filas = [];
        $aretes = [];
        $validas = 0;
        $conErrores = 0;

        foreach ($crudas as $cruda) {
            $normalizada = $this->normalizarFilaExcel($cruda, $aretes);
            if (($normalizada['errores'] ?? []) === []) {
                $validas++;
            } else {
                $conErrores++;
            }
            $filas[] = $normalizada;
        }

        return [
            'filas' => $filas,
            'validas' => $validas,
            'con_errores' => $conErrores,
        ];
    }

    /**
     * @param  array<string, mixed>  $data
     * @return list<ServicioReproductivo>
     */
    public function createLoteInseminacion(array $data): array
    {
        $hembras = collect($data['hembras'] ?? [])
            ->map(fn ($id) => (int) $id)
            ->filter(fn (int $id) => $id > 0)
            ->unique()
            ->values();

        if ($hembras->isEmpty()) {
            throw ValidationException::withMessages([
                'hembras' => 'Debe seleccionar al menos una vaca.',
            ]);
        }

        $this->assertFechaServicio($data);
        $insumo = $this->insumoSemen((int) ($data['medicamento_id'] ?? 0));

        return DB::transaction(function () use ($data, $hembras, $insumo) {
            $servicios = [];
            foreach ($hembras as $hembraId) {
                $servicios[] = $this->create([
                    'hembra_id' => $hembraId,
                    'macho_id' => null,
                    'fecha_servicio' => $data['fecha_servicio'],
                    'tipo_servicio' => ServicioReproductivo::TIPO_INSEMINACION_ARTIFICIAL,
                    'resultado' => ServicioReproductivo::RESULTADO_PENDIENTE,
                    'observaciones' => $data['observaciones'] ?? null,
                    'insumos' => [$insumo],
                ]);
            }

            return $servicios;
        });
    }

    public function create(array $data): ServicioReproductivo
    {
        $this->assertAnimalesValidos($data);
        $this->assertFechaServicio($data);
        $this->assertReglasPorTipo($data);
        if (($data['tipo_servicio'] ?? '') !== ServicioReproductivo::TIPO_INSEMINACION_ARTIFICIAL) {
            $data['insumos'] = [];
        }
        $insumos = $this->normalizeInsumos($data['insumos'] ?? []);
        if (! isset($data['resultado']) || $data['resultado'] === '' || $data['resultado'] === null) {
            $data['resultado'] = ServicioReproductivo::RESULTADO_PENDIENTE;
        }

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
        $this->assertFechaServicio($data);
        $this->assertReglasPorTipo($data, $servicio);
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

    /**
     * @param  array<string, mixed>  $data
     */
    public function confirmarGestacion(ServicioReproductivo $servicio, array $data): ServicioReproductivo
    {
        if (in_array($servicio->resultado, ['VACIA', 'ABORTO'], true)) {
            throw ValidationException::withMessages([
                'servicio_id' => 'No se puede confirmar gestación de un servicio con resultado VACÍA o ABORTO.',
            ]);
        }

        $servicio->loadMissing('gestacion.parto');

        if ($servicio->gestacion?->parto) {
            throw ValidationException::withMessages([
                'servicio_id' => 'Este servicio ya tiene un parto registrado. No se puede modificar la confirmación.',
            ]);
        }

        $fechaConfirmacion = (string) $data['fecha_confirmacion'];
        $fechaProbable = $data['fecha_probable_parto'] ?? null;
        if ($fechaProbable === null || $fechaProbable === '') {
            $fechaProbable = ReglasReproductivas::fechaProbableParto($fechaConfirmacion);
        }

        return DB::transaction(function () use ($servicio, $data, $fechaConfirmacion, $fechaProbable) {
            if ($servicio->resultado !== ServicioReproductivo::RESULTADO_PRENADA) {
                $this->update($servicio, [
                    'hembra_id' => $servicio->hembra_id,
                    'macho_id' => $servicio->macho_id,
                    'fecha_servicio' => $servicio->fecha_servicio?->format('Y-m-d'),
                    'tipo_servicio' => $servicio->tipo_servicio,
                    'resultado' => ServicioReproductivo::RESULTADO_PRENADA,
                    'observaciones' => $servicio->observaciones,
                ]);
                $servicio->refresh();
            }

            $payload = [
                'servicio_id' => $servicio->id,
                'fecha_confirmacion' => $fechaConfirmacion,
                'fecha_probable_parto' => $fechaProbable,
                'estado' => Gestacion::ESTADO_ACTIVA,
                'observaciones' => $data['observaciones'] ?? null,
            ];

            if ($servicio->gestacion) {
                $this->gestacionService->update($servicio->gestacion, $payload);
            } else {
                $this->gestacionService->create($payload);
            }

            return $servicio->fresh(self::RELATIONS);
        });
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function registrarPartoYNacimiento(ServicioReproductivo $servicio, array $data): ServicioReproductivo
    {
        $servicio->loadMissing('gestacion.parto.nacimientos');
        $gestacion = $servicio->gestacion;

        if ($gestacion?->parto) {
            throw ValidationException::withMessages([
                'fecha_parto' => 'Ya existe un parto registrado para esta gestación.',
            ]);
        }

        if (! $gestacion || ! $gestacion->esActiva()) {
            throw ValidationException::withMessages([
                'servicio_id' => 'Debe confirmar la gestación antes de registrar el parto.',
            ]);
        }

        return DB::transaction(function () use ($gestacion, $data, $servicio) {
            $parto = $this->partoService->create([
                'gestacion_id' => $gestacion->id,
                'fecha_parto' => $data['fecha_parto'],
                'observaciones' => $data['observaciones'] ?? null,
            ]);

            $nacimiento = is_array($data['nacimiento'] ?? null) ? $data['nacimiento'] : [];
            $nacimiento['parto_id'] = $parto->id;
            $this->nacimientoService->create($nacimiento);
            $this->partoService->finalizar($parto);

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
    private function assertReglasPorTipo(array $data, ?ServicioReproductivo $existente = null): void
    {
        $tipo = (string) ($data['tipo_servicio'] ?? $existente?->tipo_servicio ?? '');

        if ($tipo === ServicioReproductivo::TIPO_MONTA_NATURAL && empty($data['macho_id'])) {
            throw ValidationException::withMessages([
                'macho_id' => 'La monta natural requiere un macho.',
            ]);
        }

        if ($tipo !== ServicioReproductivo::TIPO_INSEMINACION_ARTIFICIAL) {
            return;
        }

        if (array_key_exists('insumos', $data)) {
            $insumos = $data['insumos'] ?? [];
            if (! is_array($insumos) || $insumos === []) {
                throw ValidationException::withMessages([
                    'insumos' => 'La inseminación artificial requiere el semen (producto en frasco) y el almacén.',
                ]);
            }

            return;
        }

        if ($existente && $existente->insumos()->exists()) {
            return;
        }

        throw ValidationException::withMessages([
            'insumos' => 'La inseminación artificial requiere el semen (producto en frasco) y el almacén.',
        ]);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function assertFechaServicio(array $data): void
    {
        ReglasReproductivas::assertFechaOcurrida(
            'fecha_servicio',
            $data['fecha_servicio'] ?? null,
            'La fecha de servicio no puede ser futura.'
        );
    }

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

    /**
     * @return array{medicamento_id: int, almacen_id: int, cantidad: int}
     */
    private function insumoSemen(int $medicamentoId): array
    {
        if ($medicamentoId < 1) {
            throw ValidationException::withMessages([
                'medicamento_id' => 'Debe seleccionar el semen.',
            ]);
        }

        $producto = Medicamento::query()
            ->whereKey($medicamentoId)
            ->where('activo', true)
            ->whereNull('deleted_at')
            ->first();

        if (! $producto) {
            throw ValidationException::withMessages([
                'medicamento_id' => 'El semen seleccionado no está activo.',
            ]);
        }

        $almacenId = AlmacenProducto::query()
            ->where('medicamento_id', $producto->id)
            ->where('stock', '>', 0)
            ->orderByDesc('stock')
            ->value('almacen_id');

        if (! $almacenId) {
            $almacenId = Almacen::query()
                ->where('activo', true)
                ->whereNull('deleted_at')
                ->orderBy('id')
                ->value('id');
        }

        if (! $almacenId) {
            throw ValidationException::withMessages([
                'medicamento_id' => 'No hay un almacén activo para asociar el semen.',
            ]);
        }

        return [
            'medicamento_id' => $producto->id,
            'almacen_id' => (int) $almacenId,
            'cantidad' => 1,
        ];
    }

    /**
     * @param  array<string, mixed>  $cruda
     * @param  array<string, int>  $aretes
     * @return array<string, mixed>
     */
    private function normalizarFilaExcel(array $cruda, array &$aretes): array
    {
        $linea = (int) ($cruda['linea'] ?? 0);
        $arete = strtoupper(trim((string) ($cruda['codigo_arete'] ?? $cruda['arete'] ?? '')));
        $errores = [];

        if ($arete === '') {
            $errores[] = 'El código de arete es obligatorio.';
        } elseif (isset($aretes[$arete])) {
            $errores[] = 'El arete está duplicado en el archivo (línea '.$aretes[$arete].').';
        } else {
            $aretes[$arete] = $linea;
        }

        $animal = $arete !== ''
            ? Animal::query()
                ->with([
                    'categoria:id,codigo,nombre',
                    'lote:id,nombre,codigo,potrero_id',
                    'detallesPesaje' => fn ($builder) => $builder->latest('id')->limit(1),
                ])
                ->whereNull('deleted_at')
                ->whereRaw('UPPER(BTRIM(arete)) = ?', [$arete])
                ->first()
            : null;

        if ($arete !== '' && ! $animal) {
            $errores[] = 'No existe un animal con ese arete.';
        }

        if ($animal && $animal->sexo !== 'H') {
            $errores[] = 'El animal no es una hembra.';
        }

        if ($animal && $animal->estado !== Animal::ESTADO_ACTIVO) {
            $errores[] = 'El animal no está activo.';
        }

        if ($animal && ! $animal->tieneAreteValido()) {
            $errores[] = 'El arete del animal no es válido.';
        }

        $ultimoPeso = $animal?->relationLoaded('detallesPesaje')
            ? $animal->detallesPesaje->first()?->peso
            : null;

        return [
            'linea' => $linea,
            'codigo_arete' => $arete,
            'animal_id' => $animal?->id,
            'animal_codigo' => $animal?->codigo,
            'categoria_nombre' => $animal?->categoria?->nombre,
            'lote_id' => $animal?->lote_id,
            'lote_nombre' => $animal?->lote?->nombre,
            'peso' => $ultimoPeso !== null ? (float) $ultimoPeso : null,
            'errores' => $errores,
            'valida' => $errores === [],
        ];
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
