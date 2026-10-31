<?php

namespace Tests\Feature;

use App\Models\InformeDiario;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class InformeDiarioTest extends TestCase
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

    public function test_trabajador_crea_informe_con_codigo_y_autor_propios(): void
    {
        $trabajador = $this->userWithRole('trabajador');
        Sanctum::actingAs($trabajador);

        $response = $this->postJson('/api/informes-diarios', [
            'fecha' => '2026-10-30',
            'detalle_informe' => 'Ronda de potreros y recuento de animales.',
            'user_trabajador_id' => 999999,
            'revisado' => 'SI',
            'codigo_informe' => 'INF-HACK',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.user_trabajador_id', $trabajador->id)
            ->assertJsonPath('data.revisado', InformeDiario::REVISADO_NO)
            ->assertJsonPath('data.fecha', '2026-10-30')
            ->assertJsonPath('data.detalle_informe', 'Ronda de potreros y recuento de animales.');

        $codigo = $response->json('data.codigo_informe');
        $this->assertIsString($codigo);
        $this->assertMatchesRegularExpression('/^INF-\d{6}$/', $codigo);
        $this->assertNotSame('INF-HACK', $codigo);
    }

    public function test_trabajador_edita_informe_propio_no_revisado(): void
    {
        $trabajador = $this->userWithRole('trabajador');
        $informe = $this->crearInforme($trabajador, 'INF-ED01');
        Sanctum::actingAs($trabajador);

        $this->putJson('/api/informes-diarios/'.$informe->id, [
            'fecha' => '2026-10-29',
            'detalle_informe' => 'Detalle actualizado.',
        ])->assertOk()
            ->assertJsonPath('data.fecha', '2026-10-29')
            ->assertJsonPath('data.detalle_informe', 'Detalle actualizado.')
            ->assertJsonPath('data.revisado', InformeDiario::REVISADO_NO);
    }

    public function test_trabajador_no_ve_ni_edita_informes_ajenos(): void
    {
        $autor = $this->userWithRole('trabajador');
        $otro = $this->userWithRole('trabajador');
        $propia = $this->crearInforme($autor, 'INF-OWN1');
        $ajena = $this->crearInforme($otro, 'INF-AJN1');

        Sanctum::actingAs($autor);
        $listado = $this->getJson('/api/informes-diarios')->assertOk();
        $ids = collect($listado->json('data'))->pluck('id');
        $this->assertTrue($ids->contains($propia->id));
        $this->assertFalse($ids->contains($ajena->id));

        $this->getJson('/api/informes-diarios/'.$ajena->id)->assertForbidden();
        $this->putJson('/api/informes-diarios/'.$ajena->id, [
            'fecha' => '2026-10-30',
            'detalle_informe' => 'Intento de edición ajena.',
        ])->assertForbidden();
    }

    public function test_administrador_y_gerencia_ven_todos_y_no_crean(): void
    {
        $autor = $this->userWithRole('trabajador');
        $informe = $this->crearInforme($autor, 'INF-ADM1');

        foreach (['administrador', 'gerencia'] as $rol) {
            $gestor = $this->userWithRole($rol);
            Sanctum::actingAs($gestor);

            $listado = $this->getJson('/api/informes-diarios')->assertOk();
            $ids = collect($listado->json('data'))->pluck('id');
            $this->assertTrue($ids->contains($informe->id), "El rol {$rol} debe ver todos los informes.");

            $this->getJson('/api/informes-diarios/'.$informe->id)->assertOk();
            $this->postJson('/api/informes-diarios', [
                'fecha' => '2026-10-30',
                'detalle_informe' => 'No debe crear.',
            ])->assertForbidden();
            $this->putJson('/api/informes-diarios/'.$informe->id, [
                'fecha' => '2026-10-30',
                'detalle_informe' => 'No debe editar.',
            ])->assertForbidden();
        }
    }

    public function test_gestor_revisa_informe_y_bloquea_edicion_posterior(): void
    {
        $autor = $this->userWithRole('trabajador');
        $gerencia = $this->userWithRole('gerencia');
        $informe = $this->crearInforme($autor, 'INF-REV1');

        Sanctum::actingAs($gerencia);
        $this->patchJson('/api/informes-diarios/'.$informe->id.'/revisar')
            ->assertOk()
            ->assertJsonPath('data.revisado', InformeDiario::REVISADO_SI)
            ->assertJsonPath('data.user_revisor_id', $gerencia->id);

        $this->patchJson('/api/informes-diarios/'.$informe->id.'/revisar')
            ->assertUnprocessable();

        Sanctum::actingAs($autor);
        $this->putJson('/api/informes-diarios/'.$informe->id, [
            'fecha' => '2026-10-28',
            'detalle_informe' => 'Ya no debería editarse.',
        ])->assertForbidden();
    }

    public function test_veterinario_no_accede_a_informes(): void
    {
        $autor = $this->userWithRole('trabajador');
        $informe = $this->crearInforme($autor, 'INF-VET1');
        $veterinario = $this->userWithRole('veterinario');
        Sanctum::actingAs($veterinario);

        $this->getJson('/api/informes-diarios')->assertForbidden();
        $this->getJson('/api/informes-diarios/'.$informe->id)->assertForbidden();
        $this->postJson('/api/informes-diarios', [
            'fecha' => '2026-10-30',
            'detalle_informe' => 'Veterinario no crea.',
        ])->assertForbidden();
        $this->getJson('/api/informes-diarios/pendientes')->assertForbidden();
        $this->patchJson('/api/informes-diarios/'.$informe->id.'/revisar')->assertForbidden();
    }

    public function test_notificaciones_incluyen_informe_pendiente_sin_duplicar(): void
    {
        $autor = $this->userWithRole('trabajador');
        $admin = $this->userWithRole('administrador');
        $informe = $this->crearInforme($autor, 'INF-NTF1');

        Sanctum::actingAs($admin);
        $me = $this->getJson('/api/auth/me')->assertOk();
        $tipos = collect($me->json('notificaciones'))->pluck('tipo');
        $tipo = 'informe_diario_pendiente_'.$informe->id;
        $this->assertSame(1, $tipos->filter(fn ($value) => $value === $tipo)->count());

        $pendientes = $this->getJson('/api/informes-diarios/pendientes')->assertOk();
        $ids = collect($pendientes->json('data'))->pluck('id');
        $this->assertTrue($ids->contains($informe->id));
        $this->assertSame($ids->unique()->count(), $ids->count());

        Sanctum::actingAs($autor);
        $workerMe = $this->getJson('/api/auth/me')->assertOk();
        $workerTipos = collect($workerMe->json('notificaciones'))->pluck('tipo');
        $this->assertFalse($workerTipos->contains($tipo));
        $this->getJson('/api/informes-diarios/pendientes')->assertForbidden();
    }

    public function test_informe_inexistente_responde_404(): void
    {
        Sanctum::actingAs($this->userWithRole('administrador'));

        $this->getJson('/api/informes-diarios/999999999')->assertNotFound();
    }

    private function crearInforme(User $trabajador, string $codigo): InformeDiario
    {
        return InformeDiario::query()->create([
            'user_trabajador_id' => $trabajador->id,
            'codigo_informe' => $codigo,
            'detalle_informe' => 'Informe de prueba.',
            'revisado' => InformeDiario::REVISADO_NO,
            'fecha' => '2026-10-30',
        ]);
    }

    private function userWithRole(string $role): User
    {
        $user = User::factory()->create();
        $user->assignRole($role);

        return $user;
    }
}
