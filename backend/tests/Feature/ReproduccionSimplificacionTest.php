<?php

namespace Tests\Feature;

use App\Models\Almacen;
use App\Models\Animal;
use App\Models\CategoriaAnimal;
use App\Models\Estancia;
use App\Models\EstadoProductivo;
use App\Models\Potrero;
use App\Models\Producto;
use App\Models\ProductoServicio;
use App\Models\Raza;
use App\Models\ServicioReproductivo;
use App\Models\User;
use App\Support\CategoriaAnimalReglas;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class ReproduccionSimplificacionTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();
        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function test_monta_natural_sin_insumos_y_codigo(): void
    {
        Sanctum::actingAs($this->userWithPermissions(['reproduccion.create', 'reproduccion.view']));
        [$hembra, $macho] = $this->pareja();

        $response = $this->postJson('/api/servicios-reproductivos', [
            'hembra_id' => $hembra->id,
            'macho_id' => $macho->id,
            'fecha_servicio' => now()->toDateString(),
            'tipo_servicio' => ServicioReproductivo::TIPO_MONTA_NATURAL,
            'observaciones' => 'Corral 2',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.tipo_servicio', ServicioReproductivo::TIPO_MONTA_NATURAL)
            ->assertJsonPath('data.resultado', ServicioReproductivo::RESULTADO_PENDIENTE);

        $this->assertSame(0, ProductoServicio::query()->where('servicio_id', $response->json('data.id'))->count());
        $this->assertMatchesRegularExpression('/^SRV-\d{6}$/', (string) $response->json('data.codigo_servicio'));
    }

    public function test_lote_ia_asocia_el_mismo_semen_a_varias_vacas(): void
    {
        Sanctum::actingAs($this->userWithPermissions(['reproduccion.create', 'reproduccion.view']));
        [$hembraA] = $this->pareja();
        [$hembraB] = $this->pareja();
        $producto = Producto::factory()->create();
        $this->almacen();

        $response = $this->postJson('/api/servicios-reproductivos/lote-ia', [
            'fecha_servicio' => now()->toDateString(),
            'observaciones' => 'Potrero de IA',
            'producto_id' => $producto->id,
            'hembras' => [$hembraA->id, $hembraB->id],
        ]);

        $response->assertCreated();
        $this->assertCount(2, $response->json('data'));
        $this->assertSame(2, ServicioReproductivo::query()
            ->where('tipo_servicio', ServicioReproductivo::TIPO_INSEMINACION_ARTIFICIAL)
            ->whereIn('hembra_id', [$hembraA->id, $hembraB->id])
            ->count());
        $this->assertSame(
            2,
            ProductoServicio::query()->where('producto_id', $producto->id)->count()
        );
    }

    public function test_lote_ia_rechaza_hembra_duplicada(): void
    {
        Sanctum::actingAs($this->userWithPermissions(['reproduccion.create']));
        [$hembra] = $this->pareja();
        $producto = Producto::factory()->create();
        $this->almacen();

        $this->postJson('/api/servicios-reproductivos/lote-ia', [
            'fecha_servicio' => now()->toDateString(),
            'producto_id' => $producto->id,
            'hembras' => [$hembra->id, $hembra->id],
        ])->assertStatus(422);
    }

    public function test_preview_excel_ia_y_plantilla(): void
    {
        Sanctum::actingAs($this->userWithPermissions(['reproduccion.create']));
        [$hembra] = $this->pareja(['arete' => 'AR-IA-XL']);

        $this->get('/api/servicios-reproductivos/plantilla-excel', [
            'Accept' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ])->assertOk()->assertHeader('content-disposition');

        $csv = implode("\n", [
            'codigo_arete',
            'AR-IA-XL',
            'AR-IA-XL',
            'NO-EXISTE',
        ]);
        $file = UploadedFile::fake()->createWithContent('ia.csv', $csv);

        $preview = $this->post('/api/servicios-reproductivos/vista-previa-excel', [
            'archivo' => $file,
        ], ['Accept' => 'application/json']);

        $preview->assertOk();
        $this->assertSame(1, $preview->json('data.validas'));
        $this->assertSame(2, $preview->json('data.con_errores'));
        $this->assertSame($hembra->id, $preview->json('data.filas.0.animal_id'));
        $this->assertFalse(ServicioReproductivo::query()->where('observaciones', 'Potrero Excel')->exists());
    }

    public function test_busca_hembra_y_macho_por_arete(): void
    {
        Sanctum::actingAs($this->userWithPermissions(['reproduccion.create']));
        [$hembra, $macho] = $this->pareja(['arete' => 'AR-SRCH-H'], ['arete' => 'AR-SRCH-M']);

        $this->getJson('/api/servicios-reproductivos/animales-disponibles?sexo=H&search=AR-SRCH-H')
            ->assertOk()
            ->assertJsonPath('data.0.id', $hembra->id);

        $this->getJson('/api/servicios-reproductivos/animales-disponibles?sexo=M&search=AR-SRCH-M')
            ->assertOk()
            ->assertJsonPath('data.0.id', $macho->id);
    }

    /**
     * @param  array<string, mixed>  $hembraAttrs
     * @param  array<string, mixed>  $machoAttrs
     * @return array{0: Animal, 1: Animal}
     */
    private function pareja(array $hembraAttrs = [], array $machoAttrs = []): array
    {
        $vacas = $this->categoria('VACAS');
        $toros = $this->categoria('TOROS');

        $hembra = Animal::factory()->create(array_merge([
            'sexo' => 'H',
            'castrado' => false,
            'categoria_id' => $vacas->id,
            'raza_id' => Raza::query()->value('id') ?? Raza::factory(),
            'estado_productivo_id' => EstadoProductivo::query()->value('id'),
            'potrero_id' => Potrero::query()->value('id'),
            'grupo_id' => null,
            'madre_id' => null,
            'padre_id' => null,
            'fecha_nacimiento' => now()->subMonths(36)->toDateString(),
            'estado' => Animal::ESTADO_ACTIVO,
        ], $hembraAttrs));

        $macho = Animal::factory()->create(array_merge([
            'sexo' => 'M',
            'castrado' => false,
            'categoria_id' => $toros->id,
            'raza_id' => Raza::query()->value('id') ?? Raza::factory(),
            'estado_productivo_id' => EstadoProductivo::query()->value('id'),
            'potrero_id' => Potrero::query()->value('id'),
            'grupo_id' => null,
            'madre_id' => null,
            'padre_id' => null,
            'fecha_nacimiento' => now()->subMonths(40)->toDateString(),
            'estado' => Animal::ESTADO_ACTIVO,
        ], $machoAttrs));

        return [$hembra, $macho];
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
