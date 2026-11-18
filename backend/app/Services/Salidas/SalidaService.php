<?php

namespace App\Services\Salidas;

use App\Models\Animal;
use App\Models\AnimalEvento;
use App\Models\DetalleSalida;
use App\Models\Persona;
use App\Models\Salida;
use App\Models\TipoSalida;
use App\Services\Documentos\PdfGenerator;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Response;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SalidaService
{
    private const SORTABLE_COLUMNS = ['codigo', 'fecha_salida', 'estado', 'monto_total', 'created_at'];

    private const RELATIONS = [
        'cliente:id,razon_social,nit',
        'creador:id,nombre,apellido',
        'tipoSalida:id,nombre,codigo,iniciales,requiere_cliente',
        'venta:id,cod_venta,cliente_id,fecha_venta',
        'detalles.animal:id,codigo,arete,sexo,categoria_id,potrero_id,grupo_id,estado,fecha_nacimiento,edad_inicial,edad_actual',
        'detalles.animal.grupo:id,nombre',
        'detalles.grupo:id,nombre',
        'detalles.animal.categoria:id,codigo,nombre',
        'detalles.animal.potrero:id,nombre,codigo,parcela_id',
        'detalles.animal.potrero.parcela:id,nombre',
        'detalles.potrero:id,nombre,codigo,parcela_id',
        'detalles.potrero.parcela:id,nombre',
    ];

    public function __construct(
        private readonly PdfGenerator $pdfGenerator,
        private readonly SalidaExcelService $excelService
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
                'potrero:id,nombre,codigo,parcela_id',
                'potrero.parcela:id,nombre',
                'grupo:id,nombre',
                'detallesPesaje' => fn ($builder) => $builder->latest('id')->limit(1),
            ])
            ->whereNull('deleted_at')
            ->disponiblesParaSalida()
            ->whereNotIn('id', DetalleSalida::query()->select('animal_id'))
            ->where(function (Builder $builder) use ($search) {
                $builder->where('arete', 'ilike', "%{$search}%")
                    ->orWhere('codigo', 'ilike', "%{$search}%");
            })
            ->orderBy('arete')
            ->limit(20)
            ->get();
    }

    /**
     * @return array{filename: string, content: string, mime: string}
     */
    public function plantillaExcel(): array
    {
        return $this->excelService->plantilla();
    }

    public function descargarPlantilla(): StreamedResponse
    {
        $plantilla = $this->plantillaExcel();

        return response()->streamDownload(function () use ($plantilla) {
            echo $plantilla['content'];
        }, $plantilla['filename'], [
            'Content-Type' => $plantilla['mime'],
        ]);
    }

    /**
     * @return array{filas: list<array<string, mixed>>, validas: int, con_errores: int}
     */
    public function previewExcel(UploadedFile $file, ?int $tipoSalidaId = null): array
    {
        $tipo = $tipoSalidaId
            ? TipoSalida::query()->whereNull('deleted_at')->find($tipoSalidaId)
            : null;
        $exigePrecio = $tipo?->esVenta() ?? false;
        $crudas = $this->excelService->parse($file);
        $filas = [];
        $aretes = [];
        $validas = 0;
        $conErrores = 0;

        foreach ($crudas as $cruda) {
            $normalizada = $this->normalizarFilaExcel($cruda, $aretes, $exigePrecio);
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
     */
    public function create(array $data): Salida
    {
        return DB::transaction(function () use ($data) {
            $tipo = TipoSalida::query()
                ->where('estado', true)
                ->whereNull('deleted_at')
                ->lockForUpdate()
                ->findOrFail((int) $data['tipo_salida_id']);

            $this->assertCliente($tipo, $data['cliente_id'] ?? null);
            $detalles = $this->normalizeDetalles($data['detalles'] ?? [], $tipo);
            $this->assertAnimalesDisponibles($detalles);

            $salida = Salida::query()->create([
                'cliente_id' => $this->nullableId($data['cliente_id'] ?? null),
                'user_id' => Auth::id(),
                'venta_id' => null,
                'tipo_salida_id' => $tipo->id,
                'codigo' => $this->nextCodigo($tipo),
                'fecha_salida' => $data['fecha_salida'] ?? now()->toDateString(),
                'estado' => Salida::ESTADO_REGISTRADO,
                'descuento' => (float) ($data['descuento'] ?? 0),
                'observaciones' => $data['observaciones'] ?? null,
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

    private function assertCliente(TipoSalida $tipo, mixed $clienteId): void
    {
        $id = $this->nullableId($clienteId);

        if ($tipo->esVenta() && $id === null) {
            throw ValidationException::withMessages([
                'cliente_id' => 'Debe seleccionar el cliente o persona relacionada para una venta.',
            ]);
        }

        if ($id !== null && ! Persona::query()->whereKey($id)->whereNull('deleted_at')->exists()) {
            throw ValidationException::withMessages([
                'cliente_id' => 'La persona seleccionada no existe.',
            ]);
        }
    }

    /**
     * @param  array<int, array<string, mixed>>  $detalles
     * @return list<array<string, mixed>>
     */
    private function normalizeDetalles(array $detalles, TipoSalida $tipo): array
    {
        if ($detalles === []) {
            throw ValidationException::withMessages([
                'detalles' => 'Debe registrar al menos un animal.',
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

            if ($tipo->esVenta() && $precio < 0.01) {
                throw ValidationException::withMessages([
                    "detalles.$index.precio" => 'El precio de salida es obligatorio para una venta.',
                ]);
            }

            if (! $tipo->esVenta()) {
                $precio = 0;
                $descuento = 0;
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
                'observaciones' => isset($linea['observaciones']) ? (string) $linea['observaciones'] : null,
            ];
        }

        return $normalizados;
    }

    /**
     * @param  list<array<string, mixed>>  $detalles
     */
    private function assertAnimalesDisponibles(array $detalles): void
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
                    "detalles.$index.animal_id" => 'El animal ya tiene una salida registrada.',
                ]);
            }

            if (! $animal->estaDisponibleParaSalida()) {
                throw ValidationException::withMessages([
                    "detalles.$index.animal_id" => 'Solo se pueden seleccionar animales activos.',
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
                'potrero_id' => $animal?->potrero_id,
                'grupo_id' => $animal?->grupo_id,
                'precio' => $linea['precio'],
                'descuento' => $linea['descuento'],
                'subtotal' => $linea['subtotal'],
                'observaciones' => $linea['observaciones'] ?: null,
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
                    'tipo_salida_codigo' => $tipo->codigo,
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

    private function nextCodigo(TipoSalida $tipo): string
    {
        TipoSalida::query()->whereKey($tipo->id)->lockForUpdate()->first();
        $prefix = $tipo->prefijoCodigo();

        $ultimo = Salida::query()
            ->where('codigo', 'like', $prefix.'%')
            ->lockForUpdate()
            ->orderByDesc('codigo')
            ->value('codigo');

        $secuencia = 1;
        if ($ultimo && preg_match('/^'.preg_quote($prefix, '/').'(\d+)$/', $ultimo, $matches)) {
            $secuencia = ((int) $matches[1]) + 1;
        }

        return $prefix.str_pad((string) $secuencia, 6, '0', STR_PAD_LEFT);
    }

    /**
     * @param  array<string, mixed>  $cruda
     * @param  array<string, int>  $aretes
     * @return array<string, mixed>
     */
    private function normalizarFilaExcel(array $cruda, array &$aretes, bool $exigePrecio): array
    {
        $linea = (int) ($cruda['linea'] ?? 0);
        $arete = strtoupper(trim((string) ($cruda['codigo_arete'] ?? $cruda['arete'] ?? '')));
        $precioRaw = trim((string) ($cruda['precio'] ?? ''));
        $precio = $precioRaw === '' ? 0.0 : round((float) str_replace(',', '.', $precioRaw), 2);
        $errores = [];

        if ($arete === '') {
            $errores[] = 'El código de arete es obligatorio.';
        } elseif (isset($aretes[$arete])) {
            $errores[] = 'El arete está duplicado en el archivo (línea '.$aretes[$arete].').';
        } else {
            $aretes[$arete] = $linea;
        }

        if ($exigePrecio && $precio < 0.01) {
            $errores[] = 'El precio es obligatorio para una venta.';
        }

        if (! $exigePrecio) {
            $precio = 0.0;
        }

        $animal = $arete !== ''
            ? Animal::query()
                ->with([
                    'categoria:id,codigo,nombre',
                    'potrero:id,nombre,codigo,parcela_id',
                    'potrero.parcela:id,nombre',
                    'grupo:id,nombre',
                    'detallesPesaje' => fn ($builder) => $builder->latest('id')->limit(1),
                ])
                ->whereNull('deleted_at')
                ->whereRaw('UPPER(BTRIM(arete)) = ?', [$arete])
                ->first()
            : null;

        if ($arete !== '' && ! $animal) {
            $errores[] = 'No existe un animal con ese arete.';
        }

        if ($animal && ! $animal->estaDisponibleParaSalida()) {
            $errores[] = 'El animal no está activo.';
        }

        if ($animal && DetalleSalida::query()->where('animal_id', $animal->id)->exists()) {
            $errores[] = 'El animal ya tiene una salida registrada.';
        }

        $peso = $animal?->ultimoPeso();
        if ($animal && ($peso === null || $peso < 0.01)) {
            $errores[] = 'El animal no tiene un pesaje registrado.';
        }

        return [
            'linea' => $linea,
            'codigo_arete' => $arete,
            'precio' => $precio,
            'animal_id' => $animal?->id,
            'animal_codigo' => $animal?->codigo,
            'sexo' => $animal?->sexo,
            'edad_meses' => $animal?->calcularEdadMeses(),
            'peso' => $peso,
            'categoria_id' => $animal?->categoria_id,
            'categoria_codigo' => $animal?->categoria?->codigo,
            'categoria_nombre' => $animal?->categoria?->nombre,
            'potrero_id' => $animal?->potrero_id,
            'potrero_nombre' => $animal?->potrero?->nombre,
            'grupo_id' => $animal?->grupo_id,
            'grupo_nombre' => $animal?->grupo?->nombre,
            'parcela_nombre' => $animal?->potrero?->parcela?->nombre,
            'errores' => $errores,
            'valida' => $errores === [],
        ];
    }

    private function nullableId(mixed $value): ?int
    {
        if ($value === '' || $value === null) {
            return null;
        }

        $id = (int) $value;

        return $id > 0 ? $id : null;
    }
}
