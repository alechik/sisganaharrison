<?php

namespace Tests\Feature;

use App\Models\Animal;
use App\Models\CategoriaAnimal;
use App\Models\Nacimiento;
use App\Models\TipoPersona;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class RegistradorUsuarioTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();
        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function test_crear_animal_ignora_user_id_del_cliente(): void
    {
        $actor = $this->userWithPermissions(['animales.create']);
        $ajeno = User::factory()->create();
        Sanctum::actingAs($actor);

        $response = $this->postJson('/api/animales', [
            'sexo' => 'M',
            'categoria_id' => CategoriaAnimal::query()->value('id'),
            'user_id' => $ajeno->id,
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.user_id', $actor->id)
            ->assertJsonPath('data.usuario_nombre', trim($actor->nombre.' '.$actor->apellido));
    }

    public function test_editar_animal_no_cambia_el_registrador(): void
    {
        $creador = $this->userWithPermissions(['animales.create', 'animales.update']);
        $editor = $this->userWithPermissions(['animales.update']);
        Sanctum::actingAs($creador);

        $created = $this->postJson('/api/animales', [
            'sexo' => 'H',
            'categoria_id' => CategoriaAnimal::query()->value('id'),
            'user_id' => $editor->id,
        ])->assertCreated();
        $id = $created->json('data.id');
        $codigo = $created->json('data.codigo');

        Sanctum::actingAs($editor);
        $this->putJson('/api/animales/'.$id, [
            'codigo' => $codigo,
            'sexo' => 'H',
            'categoria_id' => CategoriaAnimal::query()->value('id'),
            'nombre' => 'Editado',
            'user_id' => $editor->id,
        ])->assertOk()
            ->assertJsonPath('data.nombre', 'Editado')
            ->assertJsonPath('data.user_id', $creador->id);

        $this->assertSame($creador->id, (int) Animal::query()->findOrFail($id)->user_id);
    }

    public function test_crear_socio_ignora_user_id_del_cliente(): void
    {
        $actor = $this->userWithPermissions(['socios.create']);
        $ajeno = User::factory()->create();
        Sanctum::actingAs($actor);

        $this->postJson('/api/socios', [
            'razon_social' => 'Socio spoof '.uniqid(),
            'tipo_ids' => [TipoPersona::query()->value('id')],
            'user_id' => $ajeno->id,
        ])->assertCreated()
            ->assertJsonPath('data.user_id', $actor->id);
    }

    public function test_editar_nacimiento_conserva_registrado_por(): void
    {
        $autor = User::factory()->create();
        $editor = $this->userWithPermissions(['reproduccion.update']);
        $nacimiento = Nacimiento::factory()->muerto()->create([
            'registrado_por' => $autor->id,
        ]);

        Sanctum::actingAs($editor);
        $this->putJson('/api/nacimientos/'.$nacimiento->id, [
            'parto_id' => $nacimiento->parto_id,
            'sexo' => $nacimiento->sexo,
            'estado_nacimiento' => Nacimiento::ESTADO_MUERTO,
            'causa_muerte' => 'Actualizada en prueba',
            'registrado_por' => $editor->id,
        ])->assertOk()
            ->assertJsonPath('data.registrado_por', $autor->id)
            ->assertJsonPath('data.causa_muerte', 'Actualizada en prueba');
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
