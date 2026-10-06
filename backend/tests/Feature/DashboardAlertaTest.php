<?php

namespace Tests\Feature;

use App\Models\Animal;
use App\Models\CategoriaAnimal;
use App\Models\EstadoProductivo;
use App\Models\Gestacion;
use App\Models\Lote;
use App\Models\Parto;
use App\Models\Raza;
use App\Models\ServicioReproductivo;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class DashboardAlertaTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();
        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function test_dashboard_sin_sesion_no_expone_alertas(): void
    {
        $this->getJson('/api/dashboard')->assertUnauthorized();
    }

    public function test_sin_permiso_de_alertas_no_expone_el_listado(): void
    {
        $hembra = $this->animal(['sexo' => 'H', 'estado' => Animal::ESTADO_ACTIVO]);
        $this->gestacion($hembra, now()->addDays(2)->toDateString(), Gestacion::ESTADO_ACTIVA);

        Sanctum::actingAs(User::factory()->create());

        $this->getJson('/api/dashboard')->assertOk()->assertJsonPath('data.alertas', null);
    }

    public function test_permiso_de_alertas_sin_modulo_devuelve_lista_vacia(): void
    {
        $hembra = $this->animal(['sexo' => 'H', 'estado' => Animal::ESTADO_ACTIVO]);
        $this->gestacion($hembra, now()->addDay()->toDateString(), Gestacion::ESTADO_ACTIVA);
        $this->animal(['estado' => Animal::ESTADO_ENFERMO]);

        Sanctum::actingAs($this->userWithPermissions(['alertas.view']));

        $this->getJson('/api/dashboard')->assertOk()->assertJsonPath('data.alertas', []);
    }

    public function test_genera_alertas_reales_y_omite_las_que_no_aplican(): void
    {
        $hembra = $this->animal(['sexo' => 'H', 'estado' => Animal::ESTADO_ACTIVO]);
        $proxima = $this->gestacion($hembra, now()->addDays(3)->toDateString(), Gestacion::ESTADO_ACTIVA);

        $atrasadaHembra = $this->animal(['sexo' => 'H', 'estado' => Animal::ESTADO_ACTIVO]);
        $atrasada = $this->gestacion($atrasadaHembra, now()->subDay()->toDateString(), Gestacion::ESTADO_ACTIVA);

        $lejana = $this->gestacion(
            $this->animal(['sexo' => 'H', 'estado' => Animal::ESTADO_ACTIVO]),
            now()->addDays(40)->toDateString(),
            Gestacion::ESTADO_ACTIVA
        );
        $finalizada = $this->gestacion(
            $this->animal(['sexo' => 'H', 'estado' => Animal::ESTADO_ACTIVO]),
            now()->addDays(2)->toDateString(),
            Gestacion::ESTADO_FINALIZADA
        );
        $vendida = $this->gestacion(
            $this->animal(['sexo' => 'H', 'estado' => Animal::ESTADO_VENDIDO]),
            now()->addDay()->toDateString(),
            Gestacion::ESTADO_ACTIVA
        );
        $muerta = $this->gestacion(
            $this->animal(['sexo' => 'H', 'estado' => Animal::ESTADO_MUERTO]),
            now()->addDay()->toDateString(),
            Gestacion::ESTADO_ACTIVA
        );

        $conParto = $this->gestacion(
            $this->animal(['sexo' => 'H', 'estado' => Animal::ESTADO_ACTIVO]),
            now()->addDays(2)->toDateString(),
            Gestacion::ESTADO_ACTIVA
        );
        $parto = Parto::factory()->create([
            'gestacion_id' => $conParto->id,
            'fecha_parto' => now()->subDays(1)->toDateString(),
            'estado' => Parto::ESTADO_PENDIENTE,
        ]);
        Parto::factory()->create([
            'gestacion_id' => $this->gestacion(
                $this->animal(['sexo' => 'H', 'estado' => Animal::ESTADO_ACTIVO]),
                now()->subDays(3)->toDateString(),
                Gestacion::ESTADO_FINALIZADA
            )->id,
            'fecha_parto' => now()->subDays(3)->toDateString(),
            'estado' => Parto::ESTADO_FINALIZADA,
        ]);

        $pendiente = ServicioReproductivo::factory()->create([
            'hembra_id' => $hembra->id,
            'macho_id' => null,
            'fecha_servicio' => now()->subDays(20)->toDateString(),
            'tipo_servicio' => 'MONTA_NATURAL',
            'resultado' => 'PENDIENTE',
        ]);
        $prenada = ServicioReproductivo::factory()->create([
            'hembra_id' => $atrasadaHembra->id,
            'macho_id' => null,
            'fecha_servicio' => now()->subDays(10)->toDateString(),
            'tipo_servicio' => 'MONTA_NATURAL',
            'resultado' => ServicioReproductivo::RESULTADO_PRENADA,
        ]);
        ServicioReproductivo::factory()->create([
            'hembra_id' => $this->animal(['sexo' => 'H', 'estado' => Animal::ESTADO_VENDIDO])->id,
            'macho_id' => null,
            'fecha_servicio' => now()->subDays(5)->toDateString(),
            'tipo_servicio' => 'MONTA_NATURAL',
            'resultado' => 'PENDIENTE',
        ]);

        $enfermo = $this->animal(['estado' => Animal::ESTADO_ENFERMO]);
        $otroEnfermo = $this->animal(['estado' => Animal::ESTADO_ENFERMO]);
        $eliminado = $this->animal(['estado' => Animal::ESTADO_ENFERMO]);
        $eliminado->delete();
        $activo = $this->animal(['estado' => Animal::ESTADO_ACTIVO]);

        Sanctum::actingAs($this->userWithPermissions(['alertas.view', 'reproduccion.view', 'animales.view']));
        $alertas = collect($this->getJson('/api/dashboard')->assertOk()->json('data.alertas'));

        $proximaAlerta = $this->porReferencia($alertas, 'gestacion', $proxima->id);
        $this->assertNotNull($proximaAlerta);
        $this->assertSame('PARTO_PROXIMO', $proximaAlerta['tipo']);
        $this->assertSame('warning', $proximaAlerta['nivel']);
        $this->assertSame($hembra->id, $proximaAlerta['animal']['id']);
        $this->assertSame(now()->addDays(3)->toDateString(), $proximaAlerta['fecha']);

        $atrasadaAlerta = $this->porReferencia($alertas, 'gestacion', $atrasada->id);
        $this->assertNotNull($atrasadaAlerta);
        $this->assertSame('error', $atrasadaAlerta['nivel']);

        $this->assertNull($this->porReferencia($alertas, 'gestacion', $lejana->id));
        $this->assertNull($this->porReferencia($alertas, 'gestacion', $finalizada->id));
        $this->assertNull($this->porReferencia($alertas, 'gestacion', $vendida->id));
        $this->assertNull($this->porReferencia($alertas, 'gestacion', $muerta->id));
        $this->assertNull($this->porReferencia($alertas, 'gestacion', $conParto->id));

        $partoAlerta = $this->porReferencia($alertas, 'parto', $parto->id);
        $this->assertNotNull($partoAlerta);
        $this->assertSame('PARTO_PENDIENTE', $partoAlerta['tipo']);
        $this->assertSame('error', $partoAlerta['nivel']);

        $servicioAlerta = $this->porReferencia($alertas, 'servicio', $pendiente->id);
        $this->assertNotNull($servicioAlerta);
        $this->assertSame('SERVICIO_PENDIENTE', $servicioAlerta['tipo']);
        $this->assertSame('info', $servicioAlerta['nivel']);
        $this->assertNull($this->porReferencia($alertas, 'servicio', $prenada->id));

        $this->assertNotNull($this->porReferencia($alertas, 'animal', $enfermo->id));
        $this->assertNotNull($this->porReferencia($alertas, 'animal', $otroEnfermo->id));
        $this->assertNull($this->porReferencia($alertas, 'animal', $eliminado->id));
        $this->assertNull($this->porReferencia($alertas, 'animal', $activo->id));

        $proxima->update(['estado' => Gestacion::ESTADO_FINALIZADA]);
        $resueltas = collect($this->getJson('/api/dashboard')->assertOk()->json('data.alertas'));
        $this->assertNull($this->porReferencia($resueltas, 'gestacion', $proxima->id));
    }

    public function test_reproduccion_no_se_muestra_sin_permiso_del_modulo(): void
    {
        $hembra = $this->animal(['sexo' => 'H', 'estado' => Animal::ESTADO_ACTIVO]);
        $gestacion = $this->gestacion($hembra, now()->addDay()->toDateString(), Gestacion::ESTADO_ACTIVA);
        $enfermo = $this->animal(['estado' => Animal::ESTADO_ENFERMO]);

        Sanctum::actingAs($this->userWithPermissions(['alertas.view', 'animales.view']));
        $alertas = collect($this->getJson('/api/dashboard')->assertOk()->json('data.alertas'));

        $this->assertNull($this->porReferencia($alertas, 'gestacion', $gestacion->id));
        $this->assertNotNull($this->porReferencia($alertas, 'animal', $enfermo->id));
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

    private function gestacion(Animal $hembra, string $fecha, string $estado): Gestacion
    {
        $servicio = ServicioReproductivo::factory()->create([
            'hembra_id' => $hembra->id,
            'macho_id' => null,
            'fecha_servicio' => now()->subDays(60)->toDateString(),
            'tipo_servicio' => 'INSEMINACION_ARTIFICIAL',
            'resultado' => ServicioReproductivo::RESULTADO_PRENADA,
        ]);

        return Gestacion::factory()->create([
            'servicio_id' => $servicio->id,
            'estado' => $estado,
            'fecha_probable_parto' => $fecha,
        ]);
    }

    /**
     * @param  \Illuminate\Support\Collection<int, array<string, mixed>>  $alertas
     * @return array<string, mixed>|null
     */
    private function porReferencia($alertas, string $proceso, int $id): ?array
    {
        $alerta = $alertas->first(
            fn (array $item) => $item['referencia']['proceso'] === $proceso && $item['referencia']['id'] === $id
        );

        return $alerta;
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
