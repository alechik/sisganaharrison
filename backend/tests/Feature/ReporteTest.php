<?php

namespace Tests\Feature;

use App\Models\Animal;
use App\Models\CategoriaAnimal;
use App\Models\DetalleEventoSanitario;
use App\Models\EstadoProductivo;
use App\Models\EventoSanitario;
use App\Models\Gestacion;
use App\Models\Lote;
use App\Models\Medicamento;
use App\Models\Nacimiento;
use App\Models\Parto;
use App\Models\Raza;
use App\Models\ServicioReproductivo;
use App\Models\TipoEventoSanitario;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class ReporteTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();
        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function test_inventario_excluye_muertos_y_respeta_filtro_de_raza(): void
    {
        Sanctum::actingAs($this->userWithPermissions(['reportes.view']));

        $raza = Raza::factory()->create([
            'codigo' => 'RF'.strtoupper(substr(uniqid(), -6)),
            'nombre' => 'Raza reporte',
        ]);
        $vivo = $this->animal([
            'sexo' => 'H',
            'estado' => Animal::ESTADO_ACTIVO,
            'raza_id' => $raza->id,
        ]);
        $this->animal([
            'sexo' => 'M',
            'estado' => Animal::ESTADO_MUERTO,
            'raza_id' => $raza->id,
            'categoria_id' => $vivo->categoria_id,
        ]);

        $response = $this->getJson('/api/reportes/inventario?raza_id='.$raza->id);

        $response->assertOk();
        $response->assertJsonPath('data.tipo', 'inventario');
        $response->assertJsonPath('data.totales.0.etiqueta', 'Animales');
        $response->assertJsonPath('data.totales.0.valor', '1');
        $response->assertJsonPath('data.detalle.meta.total', 1);
    }

    public function test_sanidad_en_rango_vacio_devuelve_ceros_y_con_evento_cuenta_la_aplicacion(): void
    {
        Sanctum::actingAs($this->userWithPermissions(['reportes.view']));
        $tipo = TipoEventoSanitario::factory()->create([
            'codigo' => 'TS'.strtoupper(substr(uniqid(), -6)),
            'nombre' => 'Tipo reporte',
        ]);

        $vacio = $this->getJson('/api/reportes/sanidad?desde=1990-01-01&hasta=1990-01-02&tipo_evento_id='.$tipo->id);
        $vacio->assertOk();
        $vacio->assertJsonPath('data.totales.0.valor', '0');
        $vacio->assertJsonPath('data.detalle.meta.total', 0);

        $user = User::factory()->create();
        $animal = $this->animal(['user_id' => $user->id]);
        $evento = EventoSanitario::factory()->create([
            'tipo_evento_id' => $tipo->id,
            'user_id' => $user->id,
            'fecha' => '1991-04-04',
        ]);
        DetalleEventoSanitario::query()->create([
            'evento_sanitario_id' => $evento->id,
            'animal_id' => $animal->id,
            'lote_id' => $animal->lote_id,
            'medicamento_id' => Medicamento::factory()->create()->id,
            'peso_animal' => 220,
            'precio_medicamento' => 15,
        ]);

        $conDatos = $this->getJson('/api/reportes/sanidad?desde=1991-04-04&hasta=1991-04-04&tipo_evento_id='.$tipo->id);
        $conDatos->assertOk();
        $conDatos->assertJsonPath('data.totales.0.etiqueta', 'Eventos');
        $conDatos->assertJsonPath('data.totales.0.valor', '1');
        $conDatos->assertJsonPath('data.totales.1.valor', '1');
        $conDatos->assertJsonPath('data.totales.2.valor', '1');
        $conDatos->assertJsonPath('data.detalle.filas.0.1', $animal->codigo);
    }

    public function test_productividad_cuenta_nacidos_vivos_del_periodo(): void
    {
        Sanctum::actingAs($this->userWithPermissions(['reportes.view']));

        $hembra = $this->animal(['sexo' => 'H']);
        $servicio = ServicioReproductivo::factory()->create([
            'hembra_id' => $hembra->id,
            'macho_id' => null,
            'fecha_servicio' => '1992-01-01',
            'tipo_servicio' => 'INSEMINACION_ARTIFICIAL',
            'resultado' => ServicioReproductivo::RESULTADO_PRENADA,
        ]);
        $gestacion = Gestacion::factory()->create([
            'servicio_id' => $servicio->id,
            'estado' => Gestacion::ESTADO_FINALIZADA,
        ]);
        $parto = Parto::factory()->create([
            'gestacion_id' => $gestacion->id,
            'fecha_parto' => '1992-06-15',
            'estado' => Parto::ESTADO_FINALIZADA,
        ]);
        Nacimiento::factory()->vivo()->create([
            'parto_id' => $parto->id,
        ]);

        $response = $this->getJson('/api/reportes/productividad?desde=1992-06-15&hasta=1992-06-15');
        $response->assertOk();

        $totales = collect($response->json('data.totales'));
        $this->assertSame('1', $totales->firstWhere('etiqueta', 'Nacidos vivos')['valor']);
        $this->assertSame('0', $totales->firstWhere('etiqueta', 'Crías muertas al nacer')['valor']);
    }

    public function test_movimientos_en_rango_sin_registros_devuelve_ceros(): void
    {
        Sanctum::actingAs($this->userWithPermissions(['reportes.view']));

        $response = $this->getJson('/api/reportes/movimientos?desde=1989-01-01&hasta=1989-01-02');

        $response->assertOk();
        $response->assertJsonPath('data.totales.0.valor', '0');
        $response->assertJsonPath('data.totales.1.valor', '0');
        $response->assertJsonPath('data.totales.2.valor', '0');
        $response->assertJsonPath('data.detalle.meta.total', 0);
    }

    public function test_reproduccion_en_rango_sin_servicios_responde_ok(): void
    {
        Sanctum::actingAs($this->userWithPermissions(['reportes.view']));

        $response = $this->getJson('/api/reportes/reproduccion?desde=1988-01-01&hasta=1988-01-02');

        $response->assertOk();
        $response->assertJsonPath('data.totales.0.etiqueta', 'Servicios');
        $response->assertJsonPath('data.totales.0.valor', '0');
    }

    public function test_reproduccion_exige_periodo_valido(): void
    {
        Sanctum::actingAs($this->userWithPermissions(['reportes.view']));

        $this->getJson('/api/reportes/reproduccion?desde=2026-05-02&hasta=2026-05-01')
            ->assertStatus(422);
    }

    public function test_reporte_sin_permiso_devuelve_403_y_tipo_invalido_404(): void
    {
        Permission::findOrCreate('reportes.view', 'web');
        Sanctum::actingAs(User::factory()->create());

        $this->getJson('/api/reportes/inventario')->assertForbidden();

        Sanctum::actingAs($this->userWithPermissions(['reportes.view']));
        $this->getJson('/api/reportes/no-existe')->assertNotFound();
    }

    public function test_pdf_exige_permiso_de_exportacion(): void
    {
        Sanctum::actingAs($this->userWithPermissions(['reportes.view']));
        $this->get('/api/reportes/inventario/pdf')->assertForbidden();

        Sanctum::actingAs($this->userWithPermissions(['reportes.view', 'reportes.export']));
        $response = $this->get('/api/reportes/inventario/pdf');
        $response->assertOk();
        $this->assertStringContainsString('pdf', (string) $response->headers->get('content-type'));
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    private function animal(array $attributes = []): Animal
    {
        return Animal::factory()->create(array_merge([
            'lote_id' => Lote::query()->value('id'),
            'categoria_id' => CategoriaAnimal::query()->value('id'),
            'estado_productivo_id' => EstadoProductivo::query()->value('id'),
            'raza_id' => Raza::query()->value('id'),
        ], $attributes));
    }

    /**
     * @param  list<string>  $names
     */
    private function userWithPermissions(array $names): User
    {
        $user = User::factory()->create();
        foreach ($names as $name) {
            $user->givePermissionTo(Permission::findOrCreate($name, 'web'));
        }

        return $user;
    }
}
