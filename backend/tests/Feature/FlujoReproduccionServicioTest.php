<?php

namespace Tests\Feature;

use App\Models\Almacen;
use App\Models\AlmacenProducto;
use App\Models\Animal;
use App\Models\CategoriaAnimal;
use App\Models\Estancia;
use App\Models\EstadoProductivo;
use App\Models\Gestacion;
use App\Models\Potrero;
use App\Models\Producto;
use App\Models\MovimientoInventario;
use App\Models\Nacimiento;
use App\Models\Parto;
use App\Models\Raza;
use App\Models\ServicioReproductivo;
use App\Models\User;
use App\Services\Inventario\InventarioService;
use App\Support\CategoriaAnimalReglas;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class FlujoReproduccionServicioTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();
        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function test_monta_natural_exige_macho(): void
    {
        Sanctum::actingAs($this->userWithPermissions(['reproduccion.create', 'reproduccion.view']));
        [$hembra] = $this->parejaReproductora();

        $this->postJson('/api/servicios-reproductivos', [
            'hembra_id' => $hembra->id,
            'fecha_servicio' => now()->toDateString(),
            'tipo_servicio' => ServicioReproductivo::TIPO_MONTA_NATURAL,
            'resultado' => ServicioReproductivo::RESULTADO_PENDIENTE,
        ])->assertStatus(422)->assertJsonValidationErrors(['macho_id']);
    }

    public function test_inseminacion_exige_semen_del_catalogo(): void
    {
        Sanctum::actingAs($this->userWithPermissions(['reproduccion.create', 'reproduccion.view']));
        [$hembra] = $this->parejaReproductora();

        $this->postJson('/api/servicios-reproductivos', [
            'hembra_id' => $hembra->id,
            'fecha_servicio' => now()->toDateString(),
            'tipo_servicio' => ServicioReproductivo::TIPO_INSEMINACION_ARTIFICIAL,
            'resultado' => ServicioReproductivo::RESULTADO_PENDIENTE,
        ])->assertStatus(422)->assertJsonValidationErrors(['insumos']);
    }

    public function test_confirmar_gestacion_es_unica_activa_y_pone_prenada(): void
    {
        Sanctum::actingAs($this->userWithPermissions(['reproduccion.create', 'reproduccion.view']));
        $servicio = $this->crearMontaPendiente(now()->subDays(40)->toDateString());

        $primera = $this->postJson("/api/servicios-reproductivos/{$servicio->id}/confirmar-gestacion", [
            'fecha_confirmacion' => now()->subDays(10)->toDateString(),
            'observaciones' => 'Confirmada por tacto',
        ])->assertOk();

        $gestacionId = $primera->json('data.gestacion.id');
        $this->assertNotNull($gestacionId);
        $this->assertSame(Gestacion::ESTADO_ACTIVA, $primera->json('data.gestacion.estado'));
        $this->assertSame(ServicioReproductivo::RESULTADO_PRENADA, $primera->json('data.resultado'));
        $this->assertSame(1, Gestacion::query()->where('servicio_id', $servicio->id)->count());

        $segunda = $this->postJson("/api/servicios-reproductivos/{$servicio->id}/confirmar-gestacion", [
            'fecha_confirmacion' => now()->subDays(5)->toDateString(),
            'observaciones' => 'Actualización',
        ])->assertOk();

        $this->assertSame($gestacionId, $segunda->json('data.gestacion.id'));
        $this->assertSame(1, Gestacion::query()->where('servicio_id', $servicio->id)->count());
        $this->assertSame(Gestacion::ESTADO_ACTIVA, $segunda->json('data.gestacion.estado'));
    }

    public function test_ia_al_confirmar_gestacion_consume_inventario_una_vez(): void
    {
        Sanctum::actingAs($this->userWithPermissions(['reproduccion.create', 'reproduccion.view', 'reproduccion.update']));
        [$hembra] = $this->parejaReproductora();
        $almacen = $this->almacen();
        $producto = Producto::factory()->create();
        app(InventarioService::class)->registrar([
            'almacen_id' => $almacen->id,
            'producto_id' => $producto->id,
            'tipo' => MovimientoInventario::TIPO_INGRESO_COMPRA,
            'cantidad' => 3,
            'precio_unitario' => 12,
            'origen_type' => 'ingreso_producto',
            'origen_id' => 930001,
        ]);

        $servicio = $this->postJson('/api/servicios-reproductivos', [
            'hembra_id' => $hembra->id,
            'fecha_servicio' => now()->subDays(40)->toDateString(),
            'tipo_servicio' => ServicioReproductivo::TIPO_INSEMINACION_ARTIFICIAL,
            'resultado' => ServicioReproductivo::RESULTADO_PENDIENTE,
            'insumos' => [[
                'producto_id' => $producto->id,
                'almacen_id' => $almacen->id,
                'cantidad' => 1,
            ]],
        ])->assertCreated()->json('data');

        $this->assertEquals(3, (float) AlmacenProducto::query()
            ->where('almacen_id', $almacen->id)
            ->where('producto_id', $producto->id)
            ->value('stock'));

        $this->postJson("/api/servicios-reproductivos/{$servicio['id']}/confirmar-gestacion", [
            'fecha_confirmacion' => now()->subDays(10)->toDateString(),
        ])->assertOk();

        $this->assertEquals(2, (float) AlmacenProducto::query()
            ->where('almacen_id', $almacen->id)
            ->where('producto_id', $producto->id)
            ->value('stock'));

        $this->postJson("/api/servicios-reproductivos/{$servicio['id']}/confirmar-gestacion", [
            'fecha_confirmacion' => now()->subDays(8)->toDateString(),
        ])->assertOk();

        $this->assertEquals(2, (float) AlmacenProducto::query()
            ->where('almacen_id', $almacen->id)
            ->where('producto_id', $producto->id)
            ->value('stock'));
        $this->assertSame(1, Gestacion::query()->where('servicio_id', $servicio['id'])->count());
    }

    public function test_registrar_parto_y_nacimiento_unico_en_transaccion(): void
    {
        Sanctum::actingAs($this->userWithPermissions(['reproduccion.create', 'reproduccion.view']));
        $fechaServicio = now()->subDays(283)->toDateString();
        $servicio = $this->crearMontaPendiente($fechaServicio);

        $this->postJson("/api/servicios-reproductivos/{$servicio->id}/confirmar-gestacion", [
            'fecha_confirmacion' => now()->subDays(250)->toDateString(),
        ])->assertOk();

        $payload = [
            'fecha_parto' => now()->toDateString(),
            'observaciones' => 'Parto a término',
            'nacimiento' => [
                'sexo' => 'H',
                'estado_nacimiento' => Nacimiento::ESTADO_MUERTO,
                'causa_muerte' => 'Nacido muerto',
            ],
        ];

        $this->postJson("/api/servicios-reproductivos/{$servicio->id}/registrar-parto", $payload)
            ->assertCreated();

        $servicio->refresh();
        $gestacion = $servicio->gestacion()->first();
        $parto = $gestacion?->parto;
        $this->assertNotNull($parto);
        $this->assertSame(Parto::ESTADO_FINALIZADA, $parto->estado);
        $this->assertSame(Gestacion::ESTADO_FINALIZADA, $gestacion->fresh()->estado);
        $this->assertSame(1, Nacimiento::query()->where('parto_id', $parto->id)->count());

        $this->postJson("/api/servicios-reproductivos/{$servicio->id}/registrar-parto", $payload)
            ->assertStatus(422);
        $this->assertSame(1, Nacimiento::query()->where('parto_id', $parto->id)->count());
        $this->assertSame(1, Parto::query()->where('gestacion_id', $gestacion->id)->count());
    }

    public function test_registra_parto_fuera_del_intervalo_estimado_y_con_fecha_futura(): void
    {
        Sanctum::actingAs($this->userWithPermissions(['reproduccion.create', 'reproduccion.view']));
        $servicioCorto = $this->crearMontaPendiente(now()->subDays(20)->toDateString());
        $this->postJson("/api/servicios-reproductivos/{$servicioCorto->id}/confirmar-gestacion", [
            'fecha_confirmacion' => now()->subDays(10)->toDateString(),
        ])->assertOk();

        $this->postJson("/api/servicios-reproductivos/{$servicioCorto->id}/registrar-parto", [
            'fecha_parto' => now()->toDateString(),
            'nacimiento' => [
                'sexo' => 'M',
                'estado_nacimiento' => Nacimiento::ESTADO_MUERTO,
                'causa_muerte' => 'Fuera de intervalo estimado',
            ],
        ])->assertCreated();

        $servicioFuturo = $this->crearMontaPendiente(now()->subDays(15)->toDateString());
        $this->postJson("/api/servicios-reproductivos/{$servicioFuturo->id}/confirmar-gestacion", [
            'fecha_confirmacion' => now()->subDays(5)->toDateString(),
        ])->assertOk();

        $fechaFutura = now()->addDays(40)->toDateString();
        $this->postJson("/api/servicios-reproductivos/{$servicioFuturo->id}/registrar-parto", [
            'fecha_parto' => $fechaFutura,
            'nacimiento' => [
                'sexo' => 'H',
                'estado_nacimiento' => Nacimiento::ESTADO_MUERTO,
                'causa_muerte' => 'Fecha posterior a hoy',
            ],
        ])->assertCreated()->assertJsonPath('data.gestacion.parto.fecha_parto', $fechaFutura);
    }

    public function test_no_registra_parto_sin_gestacion_confirmada(): void
    {
        Sanctum::actingAs($this->userWithPermissions(['reproduccion.create', 'reproduccion.view']));
        $servicio = $this->crearMontaPendiente(now()->subDays(283)->toDateString());

        $this->postJson("/api/servicios-reproductivos/{$servicio->id}/registrar-parto", [
            'fecha_parto' => now()->toDateString(),
            'nacimiento' => [
                'sexo' => 'M',
                'estado_nacimiento' => Nacimiento::ESTADO_MUERTO,
                'causa_muerte' => 'Sin gestación',
            ],
        ])->assertStatus(422);
    }

    public function test_sin_permiso_create_no_confirma_ni_registra_parto(): void
    {
        Sanctum::actingAs($this->userWithPermissions(['reproduccion.view']));
        $servicio = $this->crearMontaPendiente(now()->subDays(40)->toDateString(), actingAs: false);

        $this->postJson("/api/servicios-reproductivos/{$servicio->id}/confirmar-gestacion", [
            'fecha_confirmacion' => now()->toDateString(),
        ])->assertForbidden();

        $this->postJson("/api/servicios-reproductivos/{$servicio->id}/registrar-parto", [
            'fecha_parto' => now()->toDateString(),
            'nacimiento' => [
                'sexo' => 'M',
                'estado_nacimiento' => Nacimiento::ESTADO_MUERTO,
                'causa_muerte' => 'N/A',
            ],
        ])->assertForbidden();
    }

    private function crearMontaPendiente(string $fecha, bool $actingAs = true): ServicioReproductivo
    {
        if ($actingAs === false) {
            $creator = $this->userWithPermissions(['reproduccion.create']);
            Sanctum::actingAs($creator);
        }

        [$hembra, $macho] = $this->parejaReproductora();
        $servicio = app(\App\Services\ServiciosReproductivos\ServicioReproductivoService::class)->create([
            'hembra_id' => $hembra->id,
            'macho_id' => $macho->id,
            'fecha_servicio' => $fecha,
            'tipo_servicio' => ServicioReproductivo::TIPO_MONTA_NATURAL,
            'resultado' => ServicioReproductivo::RESULTADO_PENDIENTE,
        ]);

        if ($actingAs === false) {
            Sanctum::actingAs($this->userWithPermissions(['reproduccion.view']));
        }

        return $servicio;
    }

    /**
     * @return array{0: Animal, 1: Animal}
     */
    private function parejaReproductora(): array
    {
        $vacas = $this->categoria('VACAS');
        $toros = $this->categoria('TOROS');

        $hembra = $this->animalReproductor([
            'sexo' => 'H',
            'castrado' => false,
            'categoria_id' => $vacas->id,
            'fecha_nacimiento' => now()->subMonths(36)->toDateString(),
            'edad_inicial' => 36,
            'edad_actual' => 36,
        ]);
        $macho = $this->animalReproductor([
            'sexo' => 'M',
            'castrado' => false,
            'categoria_id' => $toros->id,
            'fecha_nacimiento' => now()->subMonths(40)->toDateString(),
            'edad_inicial' => 40,
            'edad_actual' => 40,
        ]);

        return [$hembra, $macho];
    }

    /**
     * @param  array<string, mixed>  $attrs
     */
    private function animalReproductor(array $attrs): Animal
    {
        return Animal::factory()->create(array_merge([
            'raza_id' => Raza::query()->value('id'),
            'estado_productivo_id' => EstadoProductivo::query()->value('id'),
            'potrero_id' => Potrero::query()->value('id'),
            'grupo_id' => null,
            'madre_id' => null,
            'padre_id' => null,
        ], $attrs));
    }

    private function categoria(string $codigo): CategoriaAnimal
    {
        $regla = CategoriaAnimalReglas::para($codigo);

        return CategoriaAnimal::query()->updateOrCreate(
            ['codigo' => $codigo],
            [
                'nombre' => $regla['nombre'],
                'descripcion' => $regla['descripcion'],
                'activo' => true,
            ]
        );
    }

    private function almacen(): Almacen
    {
        $estancia = Estancia::query()->firstOrFail();

        return Almacen::query()->firstOrCreate(
            ['estancia_id' => $estancia->id],
            ['nombre' => 'Almacén '.$estancia->nombre, 'activo' => true]
        );
    }

    /**
     * @param  list<string>  $permissions
     */
    private function userWithPermissions(array $permissions): User
    {
        $user = User::factory()->create();
        foreach ($permissions as $permission) {
            $user->givePermissionTo(Permission::findOrCreate($permission, 'web'));
        }

        return $user;
    }
}
