<?php

namespace Tests\Feature;

use App\Models\Animal;
use App\Models\CategoriaAnimal;
use App\Models\EstadoProductivo;
use App\Models\Gestacion;
use App\Models\Potrero;
use App\Models\Raza;
use App\Models\ServicioReproductivo;
use App\Models\User;
use App\Services\Gestaciones\GestacionService;
use App\Services\Partos\PartoService;
use App\Services\ServiciosReproductivos\ServicioReproductivoService;
use App\Support\CategoriaAnimalReglas;
use App\Support\ReglasReproductivas;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class ReglasReproductivasTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();
        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function test_rechaza_servicio_con_fecha_futura(): void
    {
        Sanctum::actingAs($this->userWithPermissions(['reproduccion.create']));
        [$hembra, $macho] = $this->parejaReproductora();

        $this->expectException(ValidationException::class);
        app(ServicioReproductivoService::class)->create([
            'hembra_id' => $hembra->id,
            'macho_id' => $macho->id,
            'fecha_servicio' => now()->addDay()->toDateString(),
            'tipo_servicio' => 'MONTA_NATURAL',
            'resultado' => ServicioReproductivo::RESULTADO_PENDIENTE,
        ]);
    }

    public function test_confirmacion_de_gestacion_no_puede_ser_anterior_al_servicio(): void
    {
        Sanctum::actingAs($this->userWithPermissions(['reproduccion.create']));
        $servicio = $this->servicioPrenada(now()->subMonths(3)->toDateString());

        $this->expectException(ValidationException::class);
        app(GestacionService::class)->create([
            'servicio_id' => $servicio->id,
            'fecha_confirmacion' => now()->subMonths(4)->toDateString(),
            'fecha_probable_parto' => now()->addMonths(6)->toDateString(),
            'estado' => Gestacion::ESTADO_ACTIVA,
        ]);
    }

    public function test_parto_fuera_del_intervalo_estimado_se_registra(): void
    {
        Sanctum::actingAs($this->userWithPermissions(['reproduccion.create']));
        $servicio = $this->servicioPrenada(now()->subDays(30)->toDateString());
        $gestacion = app(GestacionService::class)->create([
            'servicio_id' => $servicio->id,
            'fecha_confirmacion' => now()->subDays(20)->toDateString(),
            'fecha_probable_parto' => now()->addMonths(8)->toDateString(),
            'estado' => Gestacion::ESTADO_ACTIVA,
        ]);

        $parto = app(PartoService::class)->create([
            'gestacion_id' => $gestacion->id,
            'fecha_parto' => now()->toDateString(),
        ]);

        $this->assertSame(now()->toDateString(), $parto->fecha_parto->format('Y-m-d'));
        $this->assertSame(Gestacion::ESTADO_FINALIZADA, $gestacion->fresh()->estado);
    }

    public function test_parto_con_fecha_futura_se_registra(): void
    {
        Sanctum::actingAs($this->userWithPermissions(['reproduccion.create']));
        $servicio = $this->servicioPrenada(now()->subDays(10)->toDateString());
        $gestacion = app(GestacionService::class)->create([
            'servicio_id' => $servicio->id,
            'fecha_confirmacion' => now()->subDays(5)->toDateString(),
            'fecha_probable_parto' => now()->addMonths(9)->toDateString(),
            'estado' => Gestacion::ESTADO_ACTIVA,
        ]);

        $fechaFutura = now()->addDays(20)->toDateString();
        $parto = app(PartoService::class)->create([
            'gestacion_id' => $gestacion->id,
            'fecha_parto' => $fechaFutura,
        ]);

        $this->assertSame($fechaFutura, $parto->fecha_parto->format('Y-m-d'));
    }

    public function test_gestacion_abortada_no_genera_parto(): void
    {
        Sanctum::actingAs($this->userWithPermissions(['reproduccion.create']));
        $servicio = $this->servicioPrenada(now()->subMonths(4)->toDateString());
        $gestacion = app(GestacionService::class)->create([
            'servicio_id' => $servicio->id,
            'fecha_confirmacion' => now()->subMonths(3)->toDateString(),
            'fecha_probable_parto' => now()->addMonths(5)->toDateString(),
            'estado' => Gestacion::ESTADO_ABORTADA,
        ]);

        $this->expectException(ValidationException::class);
        app(PartoService::class)->create([
            'gestacion_id' => $gestacion->id,
            'fecha_parto' => now()->toDateString(),
        ]);
    }

    public function test_fecha_probable_informativa_usa_media_bovina(): void
    {
        $this->assertSame(283, ReglasReproductivas::DIAS_GESTACION_MEDIA);
        $this->assertSame(
            now()->addDays(283)->toDateString(),
            ReglasReproductivas::fechaProbableParto(now()->toDateString())
        );
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

    private function servicioPrenada(string $fecha): ServicioReproductivo
    {
        [$hembra, $macho] = $this->parejaReproductora();

        return app(ServicioReproductivoService::class)->create([
            'hembra_id' => $hembra->id,
            'macho_id' => $macho->id,
            'fecha_servicio' => $fecha,
            'tipo_servicio' => 'MONTA_NATURAL',
            'resultado' => ServicioReproductivo::RESULTADO_PRENADA,
        ]);
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
