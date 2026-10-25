<?php

namespace Tests\Feature;

use App\Models\Tarea;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class RoleTareaRouteTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();
        app(PermissionRegistrar::class)->forgetCachedPermissions();
        foreach (['administrador', 'gerencia', 'trabajador', 'veterinario'] as $name) {
            Role::findOrCreate($name, 'web');
        }
    }

    public function test_listado_de_tareas_responde_ok(): void
    {
        $admin = $this->userWithRole('administrador');
        Sanctum::actingAs($admin);

        $this->getJson('/api/tareas')
            ->assertOk()
            ->assertJsonStructure(['data', 'meta', 'links']);
    }

    public function test_asignables_responde_ok_para_gestor(): void
    {
        $admin = $this->userWithRole('administrador');
        $trabajador = $this->userWithRole('trabajador');
        Sanctum::actingAs($admin);

        $this->getJson('/api/tareas/asignables')
            ->assertOk()
            ->assertJsonPath('data.0.id', $trabajador->id);
    }

    public function test_detalle_de_rol_existente_responde_ok(): void
    {
        $admin = $this->userWithRole('administrador');
        Sanctum::actingAs($admin);
        $role = Role::query()->where('name', 'administrador')->where('guard_name', 'web')->firstOrFail();

        $this->getJson('/api/roles/'.$role->id)
            ->assertOk()
            ->assertJsonPath('data.id', $role->id)
            ->assertJsonPath('data.name', 'administrador');
    }

    public function test_rol_inexistente_responde_404(): void
    {
        Sanctum::actingAs($this->userWithRole('administrador'));

        $this->getJson('/api/roles/999999999')
            ->assertNotFound();
    }

    public function test_trabajador_no_ve_tareas_ajenas(): void
    {
        $gestor = $this->userWithRole('administrador');
        $asignado = $this->userWithRole('trabajador');
        $otro = $this->userWithRole('veterinario');

        $propia = Tarea::query()->create([
            'user_gerencia_id' => $gestor->id,
            'user_trabajador_id' => $asignado->id,
            'codigo_tarea' => 'TAR-TEST1',
            'indicacion' => 'Revisar potrero',
            'visto' => Tarea::VISTA_NO,
            'estado' => Tarea::ESTADO_EMITIDO,
            'fecha_inicio' => now(),
        ]);
        $ajena = Tarea::query()->create([
            'user_gerencia_id' => $gestor->id,
            'user_trabajador_id' => $otro->id,
            'codigo_tarea' => 'TAR-TEST2',
            'indicacion' => 'Tarea ajena',
            'visto' => Tarea::VISTA_NO,
            'estado' => Tarea::ESTADO_EMITIDO,
            'fecha_inicio' => now(),
        ]);

        Sanctum::actingAs($asignado);
        $listado = $this->getJson('/api/tareas')->assertOk();
        $ids = collect($listado->json('data'))->pluck('id');
        $this->assertTrue($ids->contains($propia->id));
        $this->assertFalse($ids->contains($ajena->id));

        $this->getJson('/api/tareas/'.$ajena->id)->assertForbidden();
        $this->getJson('/api/tareas/'.$propia->id)->assertOk();
    }

    public function test_tarea_inexistente_responde_404(): void
    {
        Sanctum::actingAs($this->userWithRole('administrador'));

        $this->getJson('/api/tareas/999999999')->assertNotFound();
    }

    private function userWithRole(string $role): User
    {
        $user = User::factory()->create();
        $user->assignRole($role);

        return $user;
    }
}
