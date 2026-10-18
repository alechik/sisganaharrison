<?php

namespace Tests\Feature;

use App\Models\Almacen;
use App\Models\AlmacenProducto;
use App\Models\Animal;
use App\Models\CategoriaAnimal;
use App\Models\DetallePesaje;
use App\Models\Establecimiento;
use App\Models\EstadoProductivo;
use App\Models\Lote;
use App\Models\Medicamento;
use App\Models\MovimientoInventario;
use App\Models\Pesaje;
use App\Models\OrdenCompraProducto;
use App\Models\Persona;
use App\Models\Raza;
use App\Models\ServicioReproductivo;
use App\Models\TipoEventoSanitario;
use App\Models\TipoPersona;
use App\Models\User;
use App\Services\ComprasProductos\IngresoProductoService;
use App\Services\ComprasProductos\OrdenCompraProductoService;
use App\Services\EventosSanitarios\EventoSanitarioService;
use App\Services\Inventario\InventarioService;
use App\Services\ServiciosReproductivos\ServicioReproductivoService;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class InventarioProductoTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();
        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function test_crud_categorias_y_subcategorias(): void
    {
        $user = $this->userWithPermissions([
            'categorias_productos.view', 'categorias_productos.create',
            'subcategorias_productos.view', 'subcategorias_productos.create',
        ]);
        Sanctum::actingAs($user);

        $cat = $this->postJson('/api/categorias-productos', ['nombre' => 'Cat Test '.uniqid()])->assertCreated();
        $this->postJson('/api/subcategorias-productos', [
            'categoria_producto_id' => $cat->json('data.id'),
            'nombre' => 'Sub Test '.uniqid(),
        ])->assertCreated();

        $this->postJson('/api/subcategorias-productos', [
            'categoria_producto_id' => 999999,
            'nombre' => 'Invalida',
        ])->assertStatus(422);
    }

    public function test_almacen_unico_por_estancia_y_stock_independiente(): void
    {
        $user = $this->userWithPermissions(['almacenes.view', 'almacenes.create']);
        Sanctum::actingAs($user);
        $estancia = Establecimiento::query()->firstOrFail();
        Almacen::query()->firstOrCreate(
            ['establecimiento_id' => $estancia->id],
            ['nombre' => 'Almacén '.$estancia->nombre, 'activo' => true]
        );

        $this->postJson('/api/almacenes', [
            'establecimiento_id' => $estancia->id,
            'nombre' => 'Duplicado',
        ])->assertStatus(422);

        $almacen = Almacen::query()->where('establecimiento_id', $estancia->id)->firstOrFail();
        $producto = Medicamento::factory()->create();
        app(InventarioService::class)->registrar([
            'almacen_id' => $almacen->id,
            'medicamento_id' => $producto->id,
            'tipo' => MovimientoInventario::TIPO_INGRESO_COMPRA,
            'cantidad' => 10,
            'precio_unitario' => 5,
            'origen_type' => 'ingreso_producto',
            'origen_id' => 900001,
        ]);

        $this->assertEquals(10, (float) AlmacenProducto::query()->where('almacen_id', $almacen->id)->where('medicamento_id', $producto->id)->value('stock'));
    }

    public function test_promedio_ponderado_y_consumo_sin_duplicados(): void
    {
        Sanctum::actingAs($this->userWithPermissions(['movimientos.view']));
        $almacen = $this->almacen();
        $producto = Medicamento::factory()->create(['precio' => 0, 'cantidad_acumulada' => 0, 'valor_acumulado' => 0]);
        $inventario = app(InventarioService::class);

        $inventario->registrar([
            'almacen_id' => $almacen->id,
            'medicamento_id' => $producto->id,
            'tipo' => MovimientoInventario::TIPO_INGRESO_COMPRA,
            'cantidad' => 10,
            'precio_unitario' => 10,
            'origen_type' => 'ingreso_producto',
            'origen_id' => 910001,
        ]);
        $inventario->registrar([
            'almacen_id' => $almacen->id,
            'medicamento_id' => $producto->id,
            'tipo' => MovimientoInventario::TIPO_INGRESO_COMPRA,
            'cantidad' => 10,
            'precio_unitario' => 20,
            'origen_type' => 'ingreso_producto',
            'origen_id' => 910002,
        ]);

        $producto->refresh();
        $this->assertEquals(15.0, (float) $producto->precio);

        $inventario->registrar([
            'almacen_id' => $almacen->id,
            'medicamento_id' => $producto->id,
            'tipo' => MovimientoInventario::TIPO_CONSUMO_SANITARIO,
            'cantidad' => -4,
            'precio_unitario' => 15,
            'origen_type' => 'evento_sanitario',
            'origen_id' => 910003,
        ]);
        $producto->refresh();
        $this->assertEquals(15.0, (float) $producto->precio);
        $this->assertEquals(16.0, (float) AlmacenProducto::query()->where('almacen_id', $almacen->id)->where('medicamento_id', $producto->id)->value('stock'));

        $this->expectException(ValidationException::class);
        $inventario->registrar([
            'almacen_id' => $almacen->id,
            'medicamento_id' => $producto->id,
            'tipo' => MovimientoInventario::TIPO_CONSUMO_SANITARIO,
            'cantidad' => -4,
            'precio_unitario' => 15,
            'origen_type' => 'evento_sanitario',
            'origen_id' => 910003,
        ]);
    }

    public function test_orden_pendiente_autorizacion_gerencia_e_ingreso(): void
    {
        $creador = $this->userWithPermissions(['compras_productos.view', 'compras_productos.create', 'compras_productos.update']);
        Sanctum::actingAs($creador);
        $proveedor = $this->proveedor();
        $producto = Medicamento::factory()->create();

        $orden = app(OrdenCompraProductoService::class)->create([
            'proveedor_id' => $proveedor->id,
            'fecha' => now()->toDateString(),
            'descuento' => 0,
            'detalles' => [['medicamento_id' => $producto->id, 'cantidad' => 5, 'precio' => 8, 'descuento' => 0]],
        ]);
        $this->assertSame(OrdenCompraProducto::ESTADO_PENDIENTE, $orden->estado);

        $this->postJson('/api/compras-productos/ordenes/'.$orden->id.'/autorizar')->assertForbidden();

        $gerencia = User::factory()->create();
        $role = Role::firstOrCreate(['name' => 'gerencia', 'guard_name' => 'web']);
        $gerencia->assignRole($role);
        $gerencia->givePermissionTo(Permission::findOrCreate('compras_productos.authorize', 'web'));
        $gerencia->givePermissionTo(Permission::findOrCreate('compras_productos.view', 'web'));
        $gerencia->givePermissionTo(Permission::findOrCreate('compras_productos.create', 'web'));
        Sanctum::actingAs($gerencia);

        $this->postJson('/api/compras-productos/ordenes/'.$orden->id.'/autorizar')->assertOk()
            ->assertJsonPath('data.estado', OrdenCompraProducto::ESTADO_AUTORIZADO);

        $almacen = $this->almacen();
        $ingreso = app(IngresoProductoService::class)->create([
            'orden_compra_id' => $orden->id,
            'almacen_id' => $almacen->id,
            'fecha' => now()->toDateString(),
            'detalles' => [['medicamento_id' => $producto->id, 'cantidad' => 3, 'precio' => 8]],
        ]);
        $this->assertEquals(3, (float) AlmacenProducto::query()->where('almacen_id', $almacen->id)->where('medicamento_id', $producto->id)->value('stock'));
        $this->get('/api/compras-productos/ingresos/'.$ingreso->id.'/pdf')->assertOk();
        $this->get('/api/compras-productos/ordenes/'.$orden->id.'/pdf')->assertOk();
    }

    public function test_rechaza_ingreso_desde_orden_pendiente_y_stock_insuficiente(): void
    {
        $user = $this->userWithPermissions(['compras_productos.create', 'compras_productos.view']);
        Sanctum::actingAs($user);
        $orden = app(OrdenCompraProductoService::class)->create([
            'proveedor_id' => $this->proveedor()->id,
            'fecha' => now()->toDateString(),
            'detalles' => [['medicamento_id' => Medicamento::factory()->create()->id, 'cantidad' => 2, 'precio' => 4, 'descuento' => 0]],
        ]);

        $this->expectException(ValidationException::class);
        app(IngresoProductoService::class)->create([
            'orden_compra_id' => $orden->id,
            'almacen_id' => $this->almacen()->id,
            'fecha' => now()->toDateString(),
            'detalles' => [['medicamento_id' => $orden->detalles->first()->medicamento_id, 'cantidad' => 1, 'precio' => 4]],
        ]);
    }

    public function test_evento_sanitario_descuenta_stock_una_sola_vez_y_genera_pdf(): void
    {
        $user = $this->userWithPermissions(['sanitario.view', 'sanitario.create']);
        Sanctum::actingAs($user);
        $almacen = $this->almacen();
        $producto = Medicamento::factory()->create();
        app(InventarioService::class)->registrar([
            'almacen_id' => $almacen->id,
            'medicamento_id' => $producto->id,
            'tipo' => MovimientoInventario::TIPO_INGRESO_COMPRA,
            'cantidad' => 8,
            'precio_unitario' => 12,
            'origen_type' => 'ingreso_producto',
            'origen_id' => 920001,
        ]);

        $tipo = TipoEventoSanitario::query()->where('activo', true)->first()
            ?? TipoEventoSanitario::factory()->create(['activo' => true]);
        $animal = $this->animalActivo();
        $pesaje = Pesaje::factory()->create(['user_id' => $user->id, 'fecha_pesaje' => now()->toDateString()]);
        DetallePesaje::query()->create([
            'pesaje_id' => $pesaje->id,
            'animal_id' => $animal->id,
            'lote_id' => $animal->lote_id,
            'peso' => 280,
        ]);

        $evento = app(EventoSanitarioService::class)->create([
            'tipo_evento_id' => $tipo->id,
            'fecha' => now()->toDateString(),
            'detalles' => [[
                'animal_id' => $animal->id,
                'medicamento_id' => $producto->id,
                'almacen_id' => $almacen->id,
                'cantidad' => 2,
            ]],
        ]);

        $this->assertEquals(6, (float) AlmacenProducto::query()->where('almacen_id', $almacen->id)->where('medicamento_id', $producto->id)->value('stock'));
        $this->assertSame(1, MovimientoInventario::query()->where('tipo', MovimientoInventario::TIPO_CONSUMO_SANITARIO)->where('origen_type', 'evento_sanitario')->where('origen_id', $evento->detalles->first()->id)->count());
        $this->get('/api/eventos-sanitarios/'.$evento->id.'/pdf')->assertOk();
    }

    public function test_servicio_pendiente_no_consume_e_insumo_confirmado_descuenta_una_vez(): void
    {
        $user = $this->userWithPermissions(['reproduccion.view', 'reproduccion.create', 'reproduccion.update']);
        Sanctum::actingAs($user);
        $almacen = $this->almacen();
        $producto = Medicamento::factory()->create();
        app(InventarioService::class)->registrar([
            'almacen_id' => $almacen->id,
            'medicamento_id' => $producto->id,
            'tipo' => MovimientoInventario::TIPO_INGRESO_COMPRA,
            'cantidad' => 5,
            'precio_unitario' => 9,
            'origen_type' => 'ingreso_producto',
            'origen_id' => 920002,
        ]);

        $hembra = $this->animalActivo(['sexo' => 'H']);
        $servicio = app(ServicioReproductivoService::class)->create([
            'hembra_id' => $hembra->id,
            'fecha_servicio' => now()->toDateString(),
            'tipo_servicio' => 'INSEMINACION_ARTIFICIAL',
            'resultado' => ServicioReproductivo::RESULTADO_PENDIENTE,
            'insumos' => [['medicamento_id' => $producto->id, 'almacen_id' => $almacen->id, 'cantidad' => 1]],
        ]);

        $this->assertEquals(5, (float) AlmacenProducto::query()->where('almacen_id', $almacen->id)->where('medicamento_id', $producto->id)->value('stock'));
        $this->assertNull($servicio->inventario_aplicado_at);

        $servicio = app(ServicioReproductivoService::class)->update($servicio, [
            'hembra_id' => $hembra->id,
            'fecha_servicio' => $servicio->fecha_servicio->toDateString(),
            'tipo_servicio' => $servicio->tipo_servicio,
            'resultado' => ServicioReproductivo::RESULTADO_PRENADA,
        ]);
        $this->assertNotNull($servicio->inventario_aplicado_at);
        $this->assertEquals(4, (float) AlmacenProducto::query()->where('almacen_id', $almacen->id)->where('medicamento_id', $producto->id)->value('stock'));

        $servicio = app(ServicioReproductivoService::class)->update($servicio, [
            'hembra_id' => $hembra->id,
            'fecha_servicio' => $servicio->fecha_servicio->toDateString(),
            'tipo_servicio' => $servicio->tipo_servicio,
            'resultado' => ServicioReproductivo::RESULTADO_PRENADA,
            'observaciones' => 'sin recargo de inventario',
        ]);
        $this->assertEquals(4, (float) AlmacenProducto::query()->where('almacen_id', $almacen->id)->where('medicamento_id', $producto->id)->value('stock'));
        $this->get('/api/servicios-reproductivos/'.$servicio->id.'/pdf')->assertOk();
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    private function animalActivo(array $attributes = []): Animal
    {
        return Animal::factory()->create(array_merge([
            'lote_id' => Lote::query()->value('id') ?? Lote::factory(),
            'categoria_id' => CategoriaAnimal::query()->value('id'),
            'estado_productivo_id' => EstadoProductivo::query()->value('id'),
            'raza_id' => Raza::query()->value('id'),
            'estado' => Animal::ESTADO_ACTIVO,
            'sexo' => 'H',
        ], $attributes));
    }

    private function almacen(): Almacen
    {
        $estancia = Establecimiento::query()->firstOrFail();

        return Almacen::query()->firstOrCreate(
            ['establecimiento_id' => $estancia->id],
            ['nombre' => 'Almacén '.$estancia->nombre, 'activo' => true]
        );
    }

    private function proveedor(): Persona
    {
        $persona = Persona::query()->whereHas('tipos', fn ($q) => $q->where('tipo.nombre', TipoPersona::PROVEEDOR))->first();
        if ($persona) {
            return $persona;
        }
        $persona = Persona::factory()->create();
        $tipo = TipoPersona::query()->where('nombre', TipoPersona::PROVEEDOR)->firstOrFail();
        $persona->tipos()->attach($tipo->id);

        return $persona;
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
