<?php

namespace Tests\Feature;

use App\Models\Animal;
use App\Models\AnimalEvento;
use App\Models\DetalleEventoSanitario;
use App\Models\DetalleIngreso;
use App\Models\DetallePesaje;
use App\Models\DetalleSalida;
use App\Models\DetalleTraspaso;
use App\Models\EventoSanitario;
use App\Models\Ingreso;
use App\Models\Lote;
use App\Models\Medicamento;
use App\Models\Pesaje;
use App\Models\Salida;
use App\Models\Traspaso;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class AnimalHistorialTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();
        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function test_historial_ordena_cronologicamente_y_no_duplica_ingreso_ni_salida(): void
    {
        $user = $this->userWithPermission();
        $animal = Animal::factory()->create();
        $loteDestino = Lote::factory()->create();

        $ingreso = Ingreso::factory()->create([
            'fecha_ingreso' => '2024-01-10',
            'lote_id' => $animal->lote_id,
            'user_id' => $user->id,
        ]);
        DetalleIngreso::query()->create([
            'ingreso_id' => $ingreso->id,
            'animal_id' => $animal->id,
            'peso_oc' => 200,
            'peso_ingreso' => 210,
            'precio_compra' => 1500,
        ]);
        AnimalEvento::query()->create([
            'animal_id' => $animal->id,
            'tipo' => AnimalEvento::TIPO_INGRESO,
            'fecha' => '2024-01-10',
            'descripcion' => 'Duplicado de ingreso',
        ]);

        $pesaje = Pesaje::factory()->create([
            'fecha_pesaje' => '2024-03-15',
            'user_id' => $user->id,
        ]);
        DetallePesaje::query()->create([
            'pesaje_id' => $pesaje->id,
            'animal_id' => $animal->id,
            'lote_id' => $animal->lote_id,
            'peso' => 280,
        ]);

        $evento = EventoSanitario::factory()->create([
            'fecha' => '2024-05-20',
            'user_id' => $user->id,
            'diagnostico' => 'Control sanitario',
            'tratamiento' => 'Aplicación',
        ]);
        DetalleEventoSanitario::query()->create([
            'evento_sanitario_id' => $evento->id,
            'animal_id' => $animal->id,
            'lote_id' => $animal->lote_id,
            'medicamento_id' => Medicamento::factory()->create()->id,
            'peso_animal' => 275,
            'precio_medicamento' => 40,
        ]);

        $traspaso = Traspaso::factory()->create([
            'user_id' => $user->id,
            'lote_salida_id' => $animal->lote_id,
            'lote_ingreso_id' => $loteDestino->id,
            'fecha_traspaso' => '2024-07-01',
            'total_peso' => 280,
            'monto_total' => 0,
        ]);
        DetalleTraspaso::query()->create([
            'traspaso_id' => $traspaso->id,
            'animal_id' => $animal->id,
            'cantidad' => 1,
            'peso' => 280,
            'precio' => 0,
            'subtotal' => 0,
        ]);

        $salida = Salida::factory()->create([
            'user_id' => $user->id,
            'fecha_salida' => '2024-09-12',
        ]);
        DetalleSalida::query()->create([
            'salida_id' => $salida->id,
            'animal_id' => $animal->id,
            'cantidad' => 1,
            'peso' => 300,
            'lote_id' => $loteDestino->id,
            'precio' => 0,
            'descuento' => 0,
            'subtotal' => 0,
        ]);
        AnimalEvento::query()->create([
            'animal_id' => $animal->id,
            'tipo' => AnimalEvento::TIPO_SALIDA,
            'fecha' => '2024-09-12',
            'descripcion' => 'Duplicado de salida',
        ]);

        Sanctum::actingAs($user);

        $response = $this->getJson("/api/animales/{$animal->id}/historial");

        $response->assertOk();
        $tipos = collect($response->json('data'))->pluck('tipo')->all();
        $fechas = collect($response->json('data'))->pluck('fecha')->all();

        $this->assertSame(
            ['SALIDA', 'TRASPASO', 'SANITARIO', 'PESAJE', 'INGRESO'],
            $tipos
        );
        $this->assertSame(
            ['2024-09-12', '2024-07-01', '2024-05-20', '2024-03-15', '2024-01-10'],
            $fechas
        );
        $this->assertCount(1, array_filter($tipos, fn (string $tipo) => $tipo === 'INGRESO'));
        $this->assertCount(1, array_filter($tipos, fn (string $tipo) => $tipo === 'SALIDA'));
        $this->assertSame(5, $response->json('meta.total'));
        $this->assertSame($animal->id, $response->json('meta.animal.id'));
    }

    public function test_historial_sin_permiso_devuelve_403(): void
    {
        Permission::findOrCreate('animales.view', 'web');
        $user = User::factory()->create();
        $animal = Animal::factory()->create(['user_id' => $user->id]);

        Sanctum::actingAs($user);

        $this->getJson("/api/animales/{$animal->id}/historial")->assertForbidden();
    }

    public function test_historial_de_animal_inexistente_devuelve_404(): void
    {
        $user = $this->userWithPermission();
        Sanctum::actingAs($user);

        $this->getJson('/api/animales/999999/historial')->assertNotFound();
    }

    private function userWithPermission(): User
    {
        $permission = Permission::findOrCreate('animales.view', 'web');
        $user = User::factory()->create();
        $user->givePermissionTo($permission);

        return $user;
    }
}
