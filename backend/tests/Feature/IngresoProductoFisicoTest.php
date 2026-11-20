<?php

namespace Tests\Feature;

use App\Models\Almacen;
use App\Models\AlmacenProducto;
use App\Models\Estancia;
use App\Models\IngresoProducto;
use App\Models\Producto;
use App\Models\MovimientoInventario;
use App\Models\OrdenCompraProducto;
use App\Models\Persona;
use App\Models\TipoPersona;
use App\Models\User;
use App\Services\ComprasProductos\OrdenCompraProductoService;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class IngresoProductoFisicoTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();
        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function test_ingreso_directo_genera_codigo_inco_actualiza_stock_y_usuario(): void
    {
        $user = $this->userWithPermissions(['compras_productos.view', 'compras_productos.create']);
        Sanctum::actingAs($user);
        $producto = Producto::factory()->create(['precio' => 0, 'cantidad_acumulada' => 0, 'valor_acumulado' => 0]);
        $almacen = $this->almacen();
        $proveedor = $this->proveedor();

        $response = $this->postJson('/api/compras-productos/ingresos', [
            'proveedor_id' => $proveedor->id,
            'almacen_id' => $almacen->id,
            'fecha' => now()->toDateString(),
            'descuento' => 5,
            'detalles' => [
                ['producto_id' => $producto->id, 'cantidad' => 10, 'precio' => 8],
            ],
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.monto_total', 75)
            ->assertJsonPath('data.descuento', 5)
            ->assertJsonPath('data.orden_compra_id', null);
        $this->assertMatchesRegularExpression('/^INCO\d{6}$/', (string) $response->json('data.cod_ingreso'));

        $ingreso = IngresoProducto::query()->with('detalles')->findOrFail($response->json('data.id'));
        $this->assertSame($user->id, (int) $ingreso->user_id);
        $this->assertEquals(10, (float) AlmacenProducto::query()
            ->where('almacen_id', $almacen->id)
            ->where('producto_id', $producto->id)
            ->value('stock'));
        $this->assertSame(1, MovimientoInventario::query()
            ->where('tipo', MovimientoInventario::TIPO_INGRESO_COMPRA)
            ->where('origen_type', 'ingreso_producto')
            ->whereIn('origen_id', $ingreso->detalles->pluck('id'))
            ->count());
        $producto->refresh();
        $this->assertEquals(8.0, (float) $producto->precio);
        $this->get('/api/compras-productos/ingresos/'.$ingreso->id.'/pdf')->assertOk();
    }

    public function test_recalcula_totales_en_backend_y_rechaza_duplicados(): void
    {
        Sanctum::actingAs($this->userWithPermissions(['compras_productos.view', 'compras_productos.create']));
        $producto = Producto::factory()->create();
        $otro = Producto::factory()->create();

        $this->postJson('/api/compras-productos/ingresos', [
            'proveedor_id' => $this->proveedor()->id,
            'almacen_id' => $this->almacen()->id,
            'fecha' => now()->toDateString(),
            'descuento' => 9999,
            'detalles' => [
                ['producto_id' => $producto->id, 'cantidad' => 2, 'precio' => 10, 'subtotal' => 1],
            ],
        ])->assertStatus(422);

        $this->postJson('/api/compras-productos/ingresos', [
            'proveedor_id' => $this->proveedor()->id,
            'almacen_id' => $this->almacen()->id,
            'fecha' => now()->toDateString(),
            'descuento' => 0,
            'detalles' => [
                ['producto_id' => $producto->id, 'cantidad' => 2, 'precio' => 10],
                ['producto_id' => $producto->id, 'cantidad' => 1, 'precio' => 10],
            ],
        ])->assertStatus(422);

        $ok = $this->postJson('/api/compras-productos/ingresos', [
            'proveedor_id' => $this->proveedor()->id,
            'almacen_id' => $this->almacen()->id,
            'fecha' => now()->toDateString(),
            'descuento' => 4,
            'detalles' => [
                ['producto_id' => $producto->id, 'cantidad' => 2, 'precio' => 10, 'subtotal' => 1],
                ['producto_id' => $otro->id, 'cantidad' => 1, 'precio' => 5, 'subtotal' => 99],
            ],
        ]);
        $ok->assertCreated()->assertJsonPath('data.monto_total', 21);
        $this->assertEquals(25, (float) $ok->json('data.detalles.0.subtotal') + (float) $ok->json('data.detalles.1.subtotal'));
    }

    public function test_transaccion_no_deja_parcial_si_falla_una_linea(): void
    {
        Sanctum::actingAs($this->userWithPermissions(['compras_productos.create', 'compras_productos.view']));
        $producto = Producto::factory()->create();
        $antesIngresos = IngresoProducto::query()->count();
        $antesMov = MovimientoInventario::query()->count();

        $this->postJson('/api/compras-productos/ingresos', [
            'proveedor_id' => $this->proveedor()->id,
            'almacen_id' => $this->almacen()->id,
            'fecha' => now()->toDateString(),
            'detalles' => [
                ['producto_id' => $producto->id, 'cantidad' => 2, 'precio' => 4],
                ['producto_id' => 999999, 'cantidad' => 1, 'precio' => 4],
            ],
        ])->assertStatus(422);

        $this->assertSame($antesIngresos, IngresoProducto::query()->count());
        $this->assertSame($antesMov, MovimientoInventario::query()->count());
        $this->assertEquals(0, (float) (AlmacenProducto::query()
            ->where('producto_id', $producto->id)
            ->value('stock') ?? 0));
    }

    public function test_preview_excel_y_plantilla_no_persisten(): void
    {
        Sanctum::actingAs($this->userWithPermissions(['compras_productos.create', 'compras_productos.view']));
        $producto = Producto::factory()->create(['codigo' => 'MED-XL-001']);
        $antesIngresos = IngresoProducto::query()->count();

        $this->get('/api/compras-productos/ingresos/plantilla-excel')
            ->assertOk()
            ->assertHeader('content-disposition');

        $csv = implode("\n", [
            'codigo_producto,cantidad,precio',
            'MED-XL-001,4,12.5',
            'NO-EXISTE,2,3',
            'MED-XL-001,1,8',
        ]);
        $file = UploadedFile::fake()->createWithContent('productos.csv', $csv);

        $preview = $this->post('/api/compras-productos/ingresos/vista-previa-excel', [
            'archivo' => $file,
        ], ['Accept' => 'application/json']);

        $preview->assertOk();
        $this->assertSame(1, $preview->json('data.validas'));
        $this->assertSame(2, $preview->json('data.con_errores'));
        $this->assertSame($antesIngresos, IngresoProducto::query()->count());
        $this->assertEquals(0, (float) (AlmacenProducto::query()
            ->where('producto_id', $producto->id)
            ->value('stock') ?? 0));
    }

    public function test_busca_productos_y_proveedores_por_codigo_y_nombre(): void
    {
        $user = $this->userWithPermissions(['compras_productos.view', 'compras_productos.create']);
        Sanctum::actingAs($user);
        $producto = Producto::factory()->create(['codigo' => 'ABC-99', 'nombre' => 'Ivermectina Forte']);
        $proveedor = $this->proveedor(['razon_social' => 'Agro Norte SRL '.uniqid(), 'nit' => 'NIT'.uniqid()]);

        $this->getJson('/api/compras-productos/ingresos/productos-disponibles?search=ABC')
            ->assertOk()
            ->assertJsonPath('data.0.id', $producto->id);
        $this->getJson('/api/compras-productos/ingresos/productos-disponibles?search=Ivermectina')
            ->assertOk()
            ->assertJsonPath('data.0.id', $producto->id);
        $this->getJson('/api/compras-productos/ingresos/proveedores-disponibles?search='.$proveedor->nit)
            ->assertOk()
            ->assertJsonPath('data.0.id', $proveedor->id);
        $this->getJson('/api/compras-productos/ingresos/almacenes-disponibles')
            ->assertOk();
    }

    public function test_conserva_ingreso_desde_orden_autorizada_y_rechaza_pendiente(): void
    {
        $creador = $this->userWithPermissions(['compras_productos.view', 'compras_productos.create', 'compras_productos.update']);
        Sanctum::actingAs($creador);
        $producto = Producto::factory()->create();
        $orden = app(OrdenCompraProductoService::class)->create([
            'proveedor_id' => $this->proveedor()->id,
            'fecha' => now()->toDateString(),
            'detalles' => [['producto_id' => $producto->id, 'cantidad' => 5, 'precio' => 8, 'descuento' => 0]],
        ]);

        $this->postJson('/api/compras-productos/ingresos', [
            'proveedor_id' => $orden->proveedor_id,
            'almacen_id' => $this->almacen()->id,
            'fecha' => now()->toDateString(),
            'orden_compra_id' => $orden->id,
            'detalles' => [['producto_id' => $producto->id, 'cantidad' => 1, 'precio' => 8]],
        ])->assertStatus(422);

        $orden->estado = OrdenCompraProducto::ESTADO_AUTORIZADO;
        $orden->save();

        $response = $this->postJson('/api/compras-productos/ingresos', [
            'proveedor_id' => $orden->proveedor_id,
            'almacen_id' => $this->almacen()->id,
            'fecha' => now()->toDateString(),
            'orden_compra_id' => $orden->id,
            'detalles' => [['producto_id' => $producto->id, 'cantidad' => 2, 'precio' => 8]],
        ]);
        $response->assertCreated()->assertJsonPath('data.orden_compra_id', $orden->id);
        $this->assertStringStartsWith('INCO', (string) $response->json('data.cod_ingreso'));
    }

    public function test_sin_permiso_no_puede_crear(): void
    {
        Sanctum::actingAs($this->userWithPermissions(['compras_productos.view']));
        $this->postJson('/api/compras-productos/ingresos', [
            'proveedor_id' => $this->proveedor()->id,
            'almacen_id' => $this->almacen()->id,
            'fecha' => now()->toDateString(),
            'detalles' => [['producto_id' => Producto::factory()->create()->id, 'cantidad' => 1, 'precio' => 2]],
        ])->assertForbidden();
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
     * @param  array<string, mixed>  $attributes
     */
    private function proveedor(array $attributes = []): Persona
    {
        $persona = Persona::query()
            ->whereHas('tipos', fn ($q) => $q->where('tipo.nombre', TipoPersona::PROVEEDOR))
            ->when(isset($attributes['nit']), fn ($q) => $q->where('nit', $attributes['nit']))
            ->first();
        if ($persona && $attributes === []) {
            return $persona;
        }
        $persona = Persona::factory()->create($attributes);
        $tipo = TipoPersona::query()->where('nombre', TipoPersona::PROVEEDOR)->firstOrFail();
        $persona->tipos()->syncWithoutDetaching([$tipo->id]);

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
