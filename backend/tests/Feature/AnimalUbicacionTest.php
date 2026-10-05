<?php

namespace Tests\Feature;

use App\Models\Animal;
use App\Models\CategoriaAnimal;
use App\Models\DetallePesaje;
use App\Models\EstadoProductivo;
use App\Models\Lote;
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

        [$origen, $destino] = $this->dosLotes();
        $animal = $this->animalEn($origen, $user);

        app(TraspasoService::class)->create([
            'lote_salida_id' => $origen->id,
            'lote_ingreso_id' => $destino->id,
            'fecha_traspaso' => '2024-03-01',
            'observacion' => 'Cambio de potrero',
            'detalles' => [
                ['animal_id' => $animal->id],
            ],
        ]);

        $animal->refresh();
        $this->assertSame($destino->id, (int) $animal->lote_id);

        $segundoOrigen = $destino;
        $segundoDestino = $origen;
        app(TraspasoService::class)->create([
            'lote_salida_id' => $segundoOrigen->id,
            'lote_ingreso_id' => $segundoDestino->id,
            'fecha_traspaso' => '2024-08-15',
            'observacion' => 'Regreso',
            'detalles' => [
                ['animal_id' => $animal->id],
            ],
        ]);

        $response = $this->getJson('/api/animales/'.$animal->id.'/ubicacion');
        $response->assertOk();
        $response->assertJsonPath('data.actual.ubicacion.lote_id', $origen->id);
        $response->assertJsonPath('data.actual.fecha_ultimo_cambio', '2024-08-15');
        $response->assertJsonPath('data.historial.0.tipo', 'TRASLADO');
        $response->assertJsonPath('data.historial.0.fecha', '2024-03-01');
        $response->assertJsonPath('data.historial.0.origen.lote_id', $origen->id);
        $response->assertJsonPath('data.historial.0.destino.lote_id', $destino->id);
        $response->assertJsonPath('data.historial.0.observacion', 'Cambio de potrero');
        $response->assertJsonPath('data.historial.1.fecha', '2024-08-15');
        $response->assertJsonPath('data.historial.1.origen.lote_id', $destino->id);
        $response->assertJsonPath('data.historial.1.destino.lote_id', $origen->id);
        $this->assertCount(2, $response->json('data.historial'));
    }

    public function test_animal_sin_movimientos_conserva_la_ubicacion_actual(): void
    {
        $user = $this->userWithPermission();
        Sanctum::actingAs($user);
        $lote = Lote::query()->firstOrFail();
        $animal = $this->animalEn($lote, $user);

        $response = $this->getJson('/api/animales/'.$animal->id.'/ubicacion');

        $response->assertOk();
        $response->assertJsonPath('data.actual.ubicacion.lote_id', $lote->id);
        $response->assertJsonPath('data.actual.fecha_ultimo_cambio', null);
        $response->assertJsonPath('data.historial', []);
    }

    public function test_ubicacion_sin_permiso_devuelve_403(): void
    {
        Permission::findOrCreate('animales.view', 'web');
        $user = User::factory()->create();
        $lote = Lote::query()->firstOrFail();
        $animal = $this->animalEn($lote, $user);
        Sanctum::actingAs($user);

        $this->getJson('/api/animales/'.$animal->id.'/ubicacion')->assertForbidden();
    }

    public function test_traspaso_al_mismo_potrero_es_rechazado(): void
    {
        $user = $this->userWithPermission();
        Sanctum::actingAs($user);
        $lote = Lote::query()->firstOrFail();
        $animal = $this->animalEn($lote, $user);

        $this->expectException(\Illuminate\Validation\ValidationException::class);

        app(TraspasoService::class)->create([
            'lote_salida_id' => $lote->id,
            'lote_ingreso_id' => $lote->id,
            'fecha_traspaso' => '2024-01-01',
            'detalles' => [
                ['animal_id' => $animal->id],
            ],
        ]);
    }

    private function animalEn(Lote $lote, User $user): Animal
    {
        $animal = Animal::factory()->create([
            'lote_id' => $lote->id,
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
            'lote_id' => $lote->id,
            'peso' => 250,
        ]);

        return $animal;
    }

    /**
     * @return array{0: Lote, 1: Lote}
     */
    private function dosLotes(): array
    {
        $origen = Lote::query()->firstOrFail();
        $destino = Lote::query()->where('id', '!=', $origen->id)->first();
        if ($destino === null) {
            $destino = Lote::factory()->create([
                'potrero_id' => $origen->potrero_id,
                'codigo' => 'UB'.strtoupper(substr(uniqid(), -6)),
                'nombre' => 'Potrero destino',
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
