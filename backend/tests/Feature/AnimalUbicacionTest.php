<?php

namespace Tests\Feature;

use App\Models\Animal;
use App\Models\CategoriaAnimal;
use App\Models\DetallePesaje;
use App\Models\EstadoProductivo;
use App\Models\Potrero;
use App\Models\Pesaje;
use App\Models\Raza;
use App\Models\User;
use App\Services\Traspasos\TraspasoService;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class AnimalUbicacionTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();
        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function test_traspaso_actualiza_ubicacion_y_queda_en_el_historial(): void
    {
        $user = $this->userWithPermission();
        Sanctum::actingAs($user);

        [$origen, $destino] = $this->dosPotreros();
        $animal = $this->animalEn($origen, $user);

        app(TraspasoService::class)->create([
            'potrero_salida_id' => $origen->id,
            'potrero_ingreso_id' => $destino->id,
            'fecha_traspaso' => '2024-03-01',
            'observacion' => 'Cambio de potrero',
            'detalles' => [
                ['animal_id' => $animal->id],
            ],
        ]);

        $animal->refresh();
        $this->assertSame($destino->id, (int) $animal->potrero_id);

        $segundoOrigen = $destino;
        $segundoDestino = $origen;
        app(TraspasoService::class)->create([
            'potrero_salida_id' => $segundoOrigen->id,
            'potrero_ingreso_id' => $segundoDestino->id,
            'fecha_traspaso' => '2024-08-15',
            'observacion' => 'Regreso',
            'detalles' => [
                ['animal_id' => $animal->id],
            ],
        ]);

        $response = $this->getJson('/api/animales/'.$animal->id.'/ubicacion');
        $response->assertOk();
        $response->assertJsonPath('data.actual.ubicacion.potrero_id', $origen->id);
        $response->assertJsonPath('data.actual.fecha_ultimo_cambio', '2024-08-15');
        $response->assertJsonPath('data.historial.0.tipo', 'TRASLADO');
        $response->assertJsonPath('data.historial.0.fecha', '2024-03-01');
        $response->assertJsonPath('data.historial.0.origen.potrero_id', $origen->id);
        $response->assertJsonPath('data.historial.0.destino.potrero_id', $destino->id);
        $response->assertJsonPath('data.historial.0.observacion', 'Cambio de potrero');
        $response->assertJsonPath('data.historial.1.fecha', '2024-08-15');
        $response->assertJsonPath('data.historial.1.origen.potrero_id', $destino->id);
        $response->assertJsonPath('data.historial.1.destino.potrero_id', $origen->id);
        $this->assertCount(2, $response->json('data.historial'));
    }

    public function test_animal_sin_movimientos_conserva_la_ubicacion_actual(): void
    {
        $user = $this->userWithPermission();
        Sanctum::actingAs($user);
        $potrero = Potrero::query()->firstOrFail();
        $animal = $this->animalEn($potrero, $user);

        $response = $this->getJson('/api/animales/'.$animal->id.'/ubicacion');

        $response->assertOk();
        $response->assertJsonPath('data.actual.ubicacion.potrero_id', $potrero->id);
        $response->assertJsonPath('data.actual.fecha_ultimo_cambio', null);
        $response->assertJsonPath('data.historial', []);
    }

    public function test_ubicacion_sin_permiso_devuelve_403(): void
    {
        Permission::findOrCreate('animales.view', 'web');
        $user = User::factory()->create();
        $potrero = Potrero::query()->firstOrFail();
        $animal = $this->animalEn($potrero, $user);
        Sanctum::actingAs($user);

        $this->getJson('/api/animales/'.$animal->id.'/ubicacion')->assertForbidden();
    }

    public function test_traspaso_al_mismo_potrero_es_rechazado(): void
    {
        $user = $this->userWithPermission();
        Sanctum::actingAs($user);
        $potrero = Potrero::query()->firstOrFail();
        $animal = $this->animalEn($potrero, $user);

        $this->expectException(\Illuminate\Validation\ValidationException::class);

        app(TraspasoService::class)->create([
            'potrero_salida_id' => $potrero->id,
            'potrero_ingreso_id' => $potrero->id,
            'fecha_traspaso' => '2024-01-01',
            'detalles' => [
                ['animal_id' => $animal->id],
            ],
        ]);
    }

    private function animalEn(Potrero $potrero, User $user): Animal
    {
        $animal = Animal::factory()->create([
            'potrero_id' => $potrero->id,
            'categoria_id' => CategoriaAnimal::query()->value('id'),
            'estado_productivo_id' => EstadoProductivo::query()->value('id'),
            'raza_id' => Raza::query()->value('id'),
            'user_id' => $user->id,
            'estado' => Animal::ESTADO_ACTIVO,
            'precio_kilo' => 12,
        ]);

        $pesaje = Pesaje::factory()->create([
            'user_id' => $user->id,
            'fecha_pesaje' => '2024-01-01',
        ]);
        DetallePesaje::query()->create([
            'pesaje_id' => $pesaje->id,
            'animal_id' => $animal->id,
            'potrero_id' => $potrero->id,
            'peso' => 250,
        ]);

        return $animal;
    }

    /**
     * @return array{0: Potrero, 1: Potrero}
     */
    private function dosPotreros(): array
    {
        $origen = Potrero::query()->firstOrFail();
        $destino = Potrero::query()->where('id', '!=', $origen->id)->first();
        if ($destino === null) {
            $destino = Potrero::factory()->create([
                'parcela_id' => $origen->parcela_id,
                'codigo' => 'UB'.strtoupper(substr(uniqid(), -6)),
                'nombre' => 'Parcela destino',
            ]);
        }

        return [$origen, $destino];
    }

    private function userWithPermission(): User
    {
        $user = User::factory()->create();
        $user->givePermissionTo(Permission::findOrCreate('animales.view', 'web'));

        return $user;
    }
}
