<?php

namespace Tests\Feature;

use App\Models\Animal;
use App\Models\CategoriaAnimal;
use App\Models\DetallePesaje;
use App\Models\Lote;
use App\Models\Pesaje;
use App\Models\Raza;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class PesajeFisicoTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();
        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function test_registra_pesaje_manual_y_codigo_correlativo(): void
    {
        $user = $this->userWithPermissions(['pesajes.view', 'pesajes.create']);
        Sanctum::actingAs($user);
        $animalA = $this->animalActivo(['arete' => 'AR-PES-001']);
        $animalB = $this->animalActivo(['arete' => 'AR-PES-002']);
        $codigo = $this->siguienteCodigo();

        $response = $this->postJson('/api/pesajes', [
            'fecha_pesaje' => now()->toDateString(),
            'observacion' => 'Sesión de control',
            'detalles' => [
                ['animal_id' => $animalA->id, 'peso' => 320.5],
                ['animal_id' => $animalB->id, 'peso' => 210],
            ],
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.codigo_pesaje', $codigo)
            ->assertJsonPath('data.cantidad_animales', 2)
            ->assertJsonPath('data.user_id', $user->id);

        $this->assertEquals(530.5, (float) $response->json('data.total_peso'));
        $this->assertSame(2, DetallePesaje::query()->where('pesaje_id', $response->json('data.id'))->count());
        $this->assertSame($animalA->lote_id, DetallePesaje::query()->where('animal_id', $animalA->id)->value('lote_id'));

        $segundo = $this->postJson('/api/pesajes', [
            'fecha_pesaje' => now()->toDateString(),
            'detalles' => [
                ['animal_id' => $animalA->id, 'peso' => 325],
            ],
        ]);
        $segundo->assertCreated()->assertJsonPath('data.codigo_pesaje', $this->siguienteCodigoDesde($codigo));
    }

    public function test_rechaza_duplicado_peso_invalido_e_inactivo(): void
    {
        $user = $this->userWithPermissions(['pesajes.create']);
        Sanctum::actingAs($user);
        $activo = $this->animalActivo(['arete' => 'AR-PES-DUP']);
        $inactivo = $this->animalActivo(['arete' => 'AR-PES-INA', 'estado' => Animal::ESTADO_VENDIDO]);

        $this->postJson('/api/pesajes', [
            'fecha_pesaje' => now()->toDateString(),
            'detalles' => [
                ['animal_id' => $activo->id, 'peso' => 180],
                ['animal_id' => $activo->id, 'peso' => 190],
            ],
        ])->assertStatus(422);

        $this->postJson('/api/pesajes', [
            'fecha_pesaje' => now()->toDateString(),
            'detalles' => [
                ['animal_id' => $activo->id, 'peso' => 0],
            ],
        ])->assertStatus(422);

        $this->postJson('/api/pesajes', [
            'fecha_pesaje' => now()->toDateString(),
            'detalles' => [
                ['animal_id' => $inactivo->id, 'peso' => 180],
            ],
        ])->assertStatus(422);
    }

    public function test_transaccion_no_deja_pesaje_parcial(): void
    {
        $user = $this->userWithPermissions(['pesajes.create']);
        Sanctum::actingAs($user);
        $valido = $this->animalActivo(['arete' => 'AR-PES-TX1']);
        $inactivo = $this->animalActivo(['arete' => 'AR-PES-TX2', 'estado' => Animal::ESTADO_MUERTO]);
        $antes = Pesaje::query()->count();

        $this->postJson('/api/pesajes', [
            'fecha_pesaje' => now()->toDateString(),
            'detalles' => [
                ['animal_id' => $valido->id, 'peso' => 200],
                ['animal_id' => $inactivo->id, 'peso' => 210],
            ],
        ])->assertStatus(422);

        $this->assertSame($antes, Pesaje::query()->count());
        $this->assertFalse(DetallePesaje::query()->where('animal_id', $valido->id)->where('peso', 200)->exists());
    }

    public function test_preview_excel_y_plantilla(): void
    {
        Sanctum::actingAs($this->userWithPermissions(['pesajes.create']));
        $animal = $this->animalActivo(['arete' => 'AR-PES-XL']);

        $this->get('/api/pesajes/plantilla-excel', ['Accept' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'])
            ->assertOk()
            ->assertHeader('content-disposition');

        $csv = implode("\n", [
            'codigo_arete,peso_kg',
            'AR-PES-XL,275.5',
            'AR-PES-XL,180',
            'NO-EXISTE,200',
            'AR-PES-XL-2,abc',
        ]);
        $file = UploadedFile::fake()->createWithContent('pesajes.csv', $csv);

        $preview = $this->post('/api/pesajes/vista-previa-excel', [
            'archivo' => $file,
        ], ['Accept' => 'application/json']);

        $preview->assertOk();
        $this->assertSame(1, $preview->json('data.validas'));
        $this->assertSame(3, $preview->json('data.con_errores'));
        $this->assertSame($animal->id, $preview->json('data.filas.0.animal_id'));
        $this->assertSame($animal->lote?->nombre, $preview->json('data.filas.0.lote_nombre'));
        $this->assertFalse(Pesaje::query()->where('observacion', 'Sesión Excel')->exists());
    }

    public function test_busca_animal_por_arete(): void
    {
        Sanctum::actingAs($this->userWithPermissions(['pesajes.create']));
        $animal = $this->animalActivo(['arete' => 'AR-PES-SRC']);

        $this->getJson('/api/pesajes/animales-disponibles?search=AR-PES-SRC')
            ->assertOk()
            ->assertJsonPath('data.0.id', $animal->id)
            ->assertJsonPath('data.0.lote_nombre', $animal->lote?->nombre);
    }

    public function test_sin_permiso_no_registra_pesaje(): void
    {
        Sanctum::actingAs($this->userWithPermissions(['pesajes.view']));
        $animal = $this->animalActivo(['arete' => 'AR-PES-403']);

        $this->postJson('/api/pesajes', [
            'fecha_pesaje' => now()->toDateString(),
            'detalles' => [
                ['animal_id' => $animal->id, 'peso' => 150],
            ],
        ])->assertForbidden();
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    private function animalActivo(array $attributes = []): Animal
    {
        $lote = Lote::query()->first();
        if ($lote) {
            $lote->capacidad_animales = max((int) $lote->capacidad_animales, 500);
            $lote->activo = true;
            $lote->save();
        }

        return Animal::factory()->create(array_merge([
            'lote_id' => $lote?->id,
            'categoria_id' => CategoriaAnimal::query()->value('id') ?? CategoriaAnimal::factory(),
            'raza_id' => Raza::query()->value('id') ?? Raza::factory(),
            'estado_productivo_id' => null,
            'estado' => Animal::ESTADO_ACTIVO,
            'fecha_nacimiento' => now()->subMonths(12)->toDateString(),
        ], $attributes))->load('lote.potrero');
    }

    private function siguienteCodigo(): string
    {
        $prefix = 'PES-'.now()->year.'-';
        $ultimo = Pesaje::query()
            ->where('codigo_pesaje', 'like', $prefix.'%')
            ->orderByDesc('codigo_pesaje')
            ->value('codigo_pesaje');

        $secuencia = 1;
        if ($ultimo && preg_match('/PES-\d{4}-(\d+)/', $ultimo, $matches)) {
            $secuencia = ((int) $matches[1]) + 1;
        }

        return $prefix.str_pad((string) $secuencia, 4, '0', STR_PAD_LEFT);
    }

    private function siguienteCodigoDesde(string $codigo): string
    {
        if (! preg_match('/^(PES-\d{4}-)(\d+)$/', $codigo, $matches)) {
            return $codigo;
        }

        return $matches[1].str_pad((string) (((int) $matches[2]) + 1), 4, '0', STR_PAD_LEFT);
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
