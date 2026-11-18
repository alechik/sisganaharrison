<?php

namespace Tests\Feature;

use App\Models\CategoriaAnimal;
use App\Models\Grupo;
use App\Models\Potrero;
use App\Models\User;
use App\Services\Animales\AnimalService;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class GrupoTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();
        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function test_crud_de_grupo_por_potrero(): void
    {
        $user = $this->userWithPermissions(['grupos.view', 'grupos.create', 'grupos.update', 'grupos.delete', 'grupos.activate']);
        Sanctum::actingAs($user);
        $potrero = Potrero::query()->firstOrFail();

        $create = $this->postJson('/api/grupos', [
            'potrero_id' => $potrero->id,
            'nombre' => 'Grupo Alpha '.uniqid(),
            'observaciones' => 'Potrero de recría',
        ]);
        $create->assertCreated();
        $id = $create->json('data.id');

        $this->getJson('/api/grupos/'.$id)
            ->assertOk()
            ->assertJsonPath('data.potrero_id', $potrero->id);

        $this->putJson('/api/grupos/'.$id, [
            'potrero_id' => $potrero->id,
            'nombre' => 'Grupo Beta '.uniqid(),
            'observaciones' => 'Actualizado',
        ])->assertOk();

        $this->patchJson('/api/grupos/'.$id.'/estado')->assertOk();
        $this->deleteJson('/api/grupos/'.$id)->assertOk();
        $this->assertSoftDeleted('grupos', ['id' => $id]);
    }

    public function test_rechaza_nombre_duplicado_en_el_mismo_potrero(): void
    {
        $user = $this->userWithPermissions(['grupos.create']);
        Sanctum::actingAs($user);
        $potrero = Potrero::query()->firstOrFail();
        $nombre = 'Duplicado '.uniqid();
        Grupo::factory()->create(['potrero_id' => $potrero->id, 'nombre' => $nombre]);

        $this->postJson('/api/grupos', [
            'potrero_id' => $potrero->id,
            'nombre' => $nombre,
        ])->assertStatus(422);
    }

    public function test_animal_rechaza_grupo_de_otro_potrero(): void
    {
        $user = $this->userWithPermissions(['animales.create', 'animales.update']);
        Sanctum::actingAs($user);
        [$potreroA, $potreroB] = $this->dosPotreros();
        $grupoB = Grupo::factory()->create(['potrero_id' => $potreroB->id]);

        $this->expectException(ValidationException::class);
        app(AnimalService::class)->create([
            'sexo' => 'M',
            'categoria_id' => CategoriaAnimal::query()->value('id'),
            'potrero_id' => $potreroA->id,
            'grupo_id' => $grupoB->id,
            'user_id' => $user->id,
        ]);
    }

    public function test_nacimiento_persiste_grupo_del_potrero(): void
    {
        $user = $this->userWithPermissions(['animales.create']);
        Sanctum::actingAs($user);
        $potrero = Potrero::query()->firstOrFail();
        $grupo = Grupo::factory()->create(['potrero_id' => $potrero->id]);

        $animal = app(AnimalService::class)->asegurarDesdeNacimiento(null, [
            'sexo' => 'M',
            'potrero_id' => $potrero->id,
            'grupo_id' => $grupo->id,
            'user_id' => $user->id,
        ]);

        $this->assertSame($grupo->id, (int) $animal->grupo_id);
        $this->assertSame($potrero->id, (int) $animal->potrero_id);
    }

    public function test_nacimiento_rechaza_grupo_de_otro_potrero(): void
    {
        $user = $this->userWithPermissions(['animales.create']);
        Sanctum::actingAs($user);
        [$potreroA, $potreroB] = $this->dosPotreros();
        $grupoB = Grupo::factory()->create(['potrero_id' => $potreroB->id]);

        $this->expectException(ValidationException::class);
        app(AnimalService::class)->asegurarDesdeNacimiento(null, [
            'sexo' => 'M',
            'potrero_id' => $potreroA->id,
            'grupo_id' => $grupoB->id,
            'user_id' => $user->id,
        ]);
    }

    public function test_ingreso_rechaza_grupo_de_otro_potrero(): void
    {
        [$potreroA, $potreroB] = $this->dosPotreros();
        $grupoB = Grupo::factory()->create(['potrero_id' => $potreroB->id]);

        $this->expectException(ValidationException::class);
        Grupo::assertCompatibleConPotrero($grupoB->id, $potreroA->id);
    }

    public function test_listado_sin_permiso_devuelve_403(): void
    {
        Permission::findOrCreate('grupos.view', 'web');
        Sanctum::actingAs(User::factory()->create());
        $this->getJson('/api/grupos')->assertForbidden();
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
                'codigo' => 'GR'.strtoupper(substr(uniqid(), -6)),
                'nombre' => 'Parcela grupo destino',
            ]);
        }

        return [$origen, $destino];
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
