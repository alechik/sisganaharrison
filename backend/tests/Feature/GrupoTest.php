<?php

namespace Tests\Feature;

use App\Models\CategoriaAnimal;
use App\Models\Grupo;
use App\Models\Lote;
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
        $lote = Lote::query()->firstOrFail();

        $create = $this->postJson('/api/grupos', [
            'lote_id' => $lote->id,
            'nombre' => 'Grupo Alpha '.uniqid(),
            'observaciones' => 'Lote de recría',
        ]);
        $create->assertCreated();
        $id = $create->json('data.id');

        $this->getJson('/api/grupos/'.$id)
            ->assertOk()
            ->assertJsonPath('data.lote_id', $lote->id);

        $this->putJson('/api/grupos/'.$id, [
            'lote_id' => $lote->id,
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
        $lote = Lote::query()->firstOrFail();
        $nombre = 'Duplicado '.uniqid();
        Grupo::factory()->create(['lote_id' => $lote->id, 'nombre' => $nombre]);

        $this->postJson('/api/grupos', [
            'lote_id' => $lote->id,
            'nombre' => $nombre,
        ])->assertStatus(422);
    }

    public function test_animal_rechaza_grupo_de_otro_lote(): void
    {
        $user = $this->userWithPermissions(['animales.create', 'animales.update']);
        Sanctum::actingAs($user);
        [$loteA, $loteB] = $this->dosLotes();
        $grupoB = Grupo::factory()->create(['lote_id' => $loteB->id]);

        $this->expectException(ValidationException::class);
        app(AnimalService::class)->create([
            'sexo' => 'M',
            'categoria_id' => CategoriaAnimal::query()->value('id'),
            'lote_id' => $loteA->id,
            'grupo_id' => $grupoB->id,
            'user_id' => $user->id,
        ]);
    }

    public function test_nacimiento_persiste_grupo_del_potrero(): void
    {
        $user = $this->userWithPermissions(['animales.create']);
        Sanctum::actingAs($user);
        $lote = Lote::query()->firstOrFail();
        $grupo = Grupo::factory()->create(['lote_id' => $lote->id]);

        $animal = app(AnimalService::class)->asegurarDesdeNacimiento(null, [
            'sexo' => 'M',
            'lote_id' => $lote->id,
            'grupo_id' => $grupo->id,
            'user_id' => $user->id,
        ]);

        $this->assertSame($grupo->id, (int) $animal->grupo_id);
        $this->assertSame($lote->id, (int) $animal->lote_id);
    }

    public function test_nacimiento_rechaza_grupo_de_otro_lote(): void
    {
        $user = $this->userWithPermissions(['animales.create']);
        Sanctum::actingAs($user);
        [$loteA, $loteB] = $this->dosLotes();
        $grupoB = Grupo::factory()->create(['lote_id' => $loteB->id]);

        $this->expectException(ValidationException::class);
        app(AnimalService::class)->asegurarDesdeNacimiento(null, [
            'sexo' => 'M',
            'lote_id' => $loteA->id,
            'grupo_id' => $grupoB->id,
            'user_id' => $user->id,
        ]);
    }

    public function test_ingreso_rechaza_grupo_de_otro_lote(): void
    {
        [$loteA, $loteB] = $this->dosLotes();
        $grupoB = Grupo::factory()->create(['lote_id' => $loteB->id]);

        $this->expectException(ValidationException::class);
        Grupo::assertCompatibleConLote($grupoB->id, $loteA->id);
    }

    public function test_listado_sin_permiso_devuelve_403(): void
    {
        Permission::findOrCreate('grupos.view', 'web');
        Sanctum::actingAs(User::factory()->create());
        $this->getJson('/api/grupos')->assertForbidden();
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
                'codigo' => 'GR'.strtoupper(substr(uniqid(), -6)),
                'nombre' => 'Potrero grupo destino',
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
