<?php

namespace Tests\Feature;

use App\Models\Animal;
use App\Models\CategoriaAnimal;
use App\Models\DetallePesaje;
use App\Models\DetalleSalida;
use App\Models\Lote;
use App\Models\Persona;
use App\Models\Pesaje;
use App\Models\Raza;
use App\Models\Salida;
use App\Models\TipoSalida;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class SalidaFisicaTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();
        app(PermissionRegistrar::class)->forgetCachedPermissions();
        $this->seedTipos();
    }

    public function test_crud_tipo_salida(): void
    {
        Sanctum::actingAs($this->userWithPermissions([
            'tipos_salidas.view',
            'tipos_salidas.create',
            'tipos_salidas.update',
            'tipos_salidas.delete',
        ]));

        $create = $this->postJson('/api/tipos-salidas', [
            'nombre' => 'Donación controlada',
            'codigo' => 'DONACION',
            'iniciales' => 'DN',
            'descripcion' => 'Prueba',
            'requiere_cliente' => false,
        ]);
        $create->assertCreated();
        $id = $create->json('data.id');

        $this->getJson('/api/tipos-salidas/'.$id)
            ->assertOk()
            ->assertJsonPath('data.iniciales', 'DN')
            ->assertJsonPath('data.requiere_cliente', false);

        $this->putJson('/api/tipos-salidas/'.$id, [
            'nombre' => 'Donación actualizada',
            'codigo' => 'DONACION',
            'iniciales' => 'DN',
            'descripcion' => 'Actualizado',
            'requiere_cliente' => true,
        ])->assertOk()->assertJsonPath('data.requiere_cliente', true);

        $this->deleteJson('/api/tipos-salidas/'.$id)->assertOk();
        $this->assertSoftDeleted('tipos_salidas', ['id' => $id]);
    }

    public function test_venta_registra_detalle_codigo_y_estado_vendido(): void
    {
        $user = $this->userWithPermissions(['salidas.view', 'salidas.create']);
        Sanctum::actingAs($user);
        $tipo = TipoSalida::query()->where('codigo', 'VENTA')->firstOrFail();
        $cliente = Persona::factory()->create();
        $animalA = $this->animalActivo(['arete' => 'AR-SAL-V1', 'fecha_nacimiento' => now()->subMonths(14)->toDateString()]);
        $animalB = $this->animalActivo(['arete' => 'AR-SAL-V2', 'fecha_nacimiento' => now()->subMonths(18)->toDateString()]);
        $this->pesaje($user, $animalA, 320);
        $this->pesaje($user, $animalB, 340);
        $codigoVenta = $this->siguienteCodigo('SV');

        $response = $this->postJson('/api/salidas', [
            'tipo_salida_id' => $tipo->id,
            'fecha_salida' => now()->toDateString(),
            'cliente_id' => $cliente->id,
            'descuento' => 50,
            'detalles' => [
                ['animal_id' => $animalA->id, 'peso' => 320, 'precio' => 1500],
                ['animal_id' => $animalB->id, 'peso' => 340, 'precio' => 1600],
            ],
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.codigo', $codigoVenta)
            ->assertJsonPath('data.cantidad_total', 2)
            ->assertJsonPath('data.user_id', $user->id)
            ->assertJsonPath('data.venta_id', null);

        $this->assertSame(2, DetalleSalida::query()->where('salida_id', $response->json('data.id'))->count());
        $this->assertEquals(3050.0, (float) $response->json('data.monto_total'));
        $this->assertSame(Animal::ESTADO_VENDIDO, $animalA->fresh()->estado);
        $this->assertSame(Animal::ESTADO_VENDIDO, $animalB->fresh()->estado);

        $segundo = $this->postJson('/api/salidas', [
            'tipo_salida_id' => $tipo->id,
            'fecha_salida' => now()->toDateString(),
            'cliente_id' => $cliente->id,
            'detalles' => [
                [
                    'animal_id' => $this->animalConPeso($user, 'AR-SAL-V3', 210)->id,
                    'peso' => 210,
                    'precio' => 900,
                ],
            ],
        ]);
        $segundo->assertCreated()->assertJsonPath('data.codigo', $this->siguienteCodigoDesde($codigoVenta));
    }

    public function test_perdida_robo_y_muerte_actualizan_estado(): void
    {
        $user = $this->userWithPermissions(['salidas.create']);
        Sanctum::actingAs($user);

        $casos = [
            ['PERDIDA', 'SP', Animal::ESTADO_OTRO],
            ['ROBO', 'SR', Animal::ESTADO_OTRO],
            ['MUERTE', 'SM', Animal::ESTADO_MUERTO],
        ];

        foreach ($casos as [$codigo, $prefijo, $estado]) {
            $tipo = TipoSalida::query()->where('codigo', $codigo)->firstOrFail();
            $animal = $this->animalConPeso($user, 'AR-'.$codigo, 250);
            $esperado = $this->siguienteCodigo($prefijo);

            $this->postJson('/api/salidas', [
                'tipo_salida_id' => $tipo->id,
                'fecha_salida' => now()->toDateString(),
                'detalles' => [
                    ['animal_id' => $animal->id, 'peso' => 250, 'precio' => 999],
                ],
            ])->assertCreated()
                ->assertJsonPath('data.codigo', $esperado)
                ->assertJsonPath('data.monto_total', 0);

            $this->assertSame($estado, $animal->fresh()->estado);
        }
    }

    public function test_venta_exige_cliente_y_precio(): void
    {
        $user = $this->userWithPermissions(['salidas.create']);
        Sanctum::actingAs($user);
        $tipo = TipoSalida::query()->where('codigo', 'VENTA')->firstOrFail();
        $animal = $this->animalConPeso($user, 'AR-SAL-ERR', 200);

        $this->postJson('/api/salidas', [
            'tipo_salida_id' => $tipo->id,
            'fecha_salida' => now()->toDateString(),
            'detalles' => [
                ['animal_id' => $animal->id, 'peso' => 200, 'precio' => 800],
            ],
        ])->assertStatus(422)->assertJsonValidationErrors(['cliente_id']);

        $this->postJson('/api/salidas', [
            'tipo_salida_id' => $tipo->id,
            'fecha_salida' => now()->toDateString(),
            'cliente_id' => Persona::factory()->create()->id,
            'detalles' => [
                ['animal_id' => $animal->id, 'peso' => 200, 'precio' => 0],
            ],
        ])->assertStatus(422)->assertJsonValidationErrors(['detalles.0.precio']);
    }

    public function test_rechaza_inactivo_duplicado_y_ya_salido(): void
    {
        $user = $this->userWithPermissions(['salidas.create']);
        Sanctum::actingAs($user);
        $tipo = TipoSalida::query()->where('codigo', 'ROBO')->firstOrFail();
        $activo = $this->animalConPeso($user, 'AR-SAL-DUP', 180);
        $inactivo = $this->animalActivo(['arete' => 'AR-SAL-INA', 'estado' => Animal::ESTADO_MUERTO]);
        $this->pesaje($user, $inactivo, 180);

        $this->postJson('/api/salidas', [
            'tipo_salida_id' => $tipo->id,
            'fecha_salida' => now()->toDateString(),
            'detalles' => [
                ['animal_id' => $inactivo->id, 'peso' => 180, 'precio' => 0],
            ],
        ])->assertStatus(422);

        $this->postJson('/api/salidas', [
            'tipo_salida_id' => $tipo->id,
            'fecha_salida' => now()->toDateString(),
            'detalles' => [
                ['animal_id' => $activo->id, 'peso' => 180, 'precio' => 0],
                ['animal_id' => $activo->id, 'peso' => 180, 'precio' => 0],
            ],
        ])->assertStatus(422);

        $this->postJson('/api/salidas', [
            'tipo_salida_id' => $tipo->id,
            'fecha_salida' => now()->toDateString(),
            'detalles' => [
                ['animal_id' => $activo->id, 'peso' => 180],
            ],
        ])->assertCreated();

        $this->postJson('/api/salidas', [
            'tipo_salida_id' => $tipo->id,
            'fecha_salida' => now()->toDateString(),
            'detalles' => [
                ['animal_id' => $activo->id, 'peso' => 180],
            ],
        ])->assertStatus(422);
    }

    public function test_transaccion_no_deja_salida_parcial(): void
    {
        $user = $this->userWithPermissions(['salidas.create']);
        Sanctum::actingAs($user);
        $tipo = TipoSalida::query()->where('codigo', 'MUERTE')->firstOrFail();
        $valido = $this->animalConPeso($user, 'AR-SAL-TX1', 200);
        $inactivo = $this->animalActivo(['arete' => 'AR-SAL-TX2', 'estado' => Animal::ESTADO_VENDIDO]);
        $this->pesaje($user, $inactivo, 210);

        $antes = Salida::query()->count();

        $this->postJson('/api/salidas', [
            'tipo_salida_id' => $tipo->id,
            'fecha_salida' => now()->toDateString(),
            'detalles' => [
                ['animal_id' => $valido->id, 'peso' => 200],
                ['animal_id' => $inactivo->id, 'peso' => 210],
            ],
        ])->assertStatus(422);

        $this->assertSame($antes, Salida::query()->count());
        $this->assertSame(Animal::ESTADO_ACTIVO, $valido->fresh()->estado);
        $this->assertFalse(DetalleSalida::query()->where('animal_id', $valido->id)->exists());
    }

    public function test_preview_excel_y_plantilla(): void
    {
        $user = $this->userWithPermissions(['salidas.create']);
        Sanctum::actingAs($user);
        $tipo = TipoSalida::query()->where('codigo', 'VENTA')->firstOrFail();
        $animal = $this->animalConPeso($user, 'AR-XL-SAL', 275);

        $this->get('/api/salidas/plantilla-excel')
            ->assertOk()
            ->assertHeader('content-disposition');

        $csv = implode("\n", [
            'codigo_arete,precio',
            'AR-XL-SAL,1200',
            'AR-XL-SAL,800',
            'NO-EXISTE,500',
        ]);
        $file = UploadedFile::fake()->createWithContent('salidas.csv', $csv);

        $preview = $this->post('/api/salidas/vista-previa-excel', [
            'archivo' => $file,
            'tipo_salida_id' => $tipo->id,
        ], ['Accept' => 'application/json']);

        $preview->assertOk();
        $this->assertSame(1, $preview->json('data.validas'));
        $this->assertSame(2, $preview->json('data.con_errores'));
        $this->assertSame($animal->id, $preview->json('data.filas.0.animal_id'));
        $this->assertSame(275, (int) $preview->json('data.filas.0.peso'));
        $this->assertSame(Animal::ESTADO_ACTIVO, $animal->fresh()->estado);
    }

    public function test_sin_permiso_no_registra_salida(): void
    {
        Sanctum::actingAs($this->userWithPermissions(['salidas.view']));
        $tipo = TipoSalida::query()->where('codigo', 'ROBO')->firstOrFail();
        $animal = $this->animalActivo(['arete' => 'AR-SAL-403']);

        $this->postJson('/api/salidas', [
            'tipo_salida_id' => $tipo->id,
            'fecha_salida' => now()->toDateString(),
            'detalles' => [
                ['animal_id' => $animal->id, 'peso' => 100, 'precio' => 0],
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
            'edad_inicial' => 8,
            'edad_actual' => 12,
        ], $attributes));
    }

    private function animalConPeso(User $user, string $arete, float $peso): Animal
    {
        $animal = $this->animalActivo(['arete' => $arete]);
        $this->pesaje($user, $animal, $peso);

        return $animal;
    }

    private function pesaje(User $user, Animal $animal, float $peso): void
    {
        $pesaje = Pesaje::factory()->create([
            'user_id' => $user->id,
            'total_peso' => $peso,
        ]);
        DetallePesaje::query()->create([
            'pesaje_id' => $pesaje->id,
            'animal_id' => $animal->id,
            'lote_id' => $animal->lote_id,
            'peso' => $peso,
        ]);
    }

    private function siguienteCodigo(string $prefix): string
    {
        $ultimo = Salida::query()
            ->where('codigo', 'like', $prefix.'%')
            ->orderByDesc('codigo')
            ->value('codigo');

        $secuencia = 1;
        if ($ultimo && preg_match('/^'.preg_quote($prefix, '/').'(\d+)$/', $ultimo, $matches)) {
            $secuencia = ((int) $matches[1]) + 1;
        }

        return $prefix.str_pad((string) $secuencia, 6, '0', STR_PAD_LEFT);
    }

    private function siguienteCodigoDesde(string $codigo): string
    {
        if (! preg_match('/^(S[A-Z]+)(\d+)$/', $codigo, $matches)) {
            return $codigo;
        }

        return $matches[1].str_pad((string) (((int) $matches[2]) + 1), 6, '0', STR_PAD_LEFT);
    }

    private function seedTipos(): void
    {
        foreach ([
            ['Venta', 'VENTA', 'V', true],
            ['Pérdida', 'PERDIDA', 'P', false],
            ['Robo', 'ROBO', 'R', false],
            ['Muerte', 'MUERTE', 'M', false],
        ] as [$nombre, $codigo, $iniciales, $requiere]) {
            TipoSalida::query()->updateOrCreate(
                ['codigo' => $codigo],
                [
                    'nombre' => $nombre,
                    'iniciales' => $iniciales,
                    'requiere_cliente' => $requiere,
                    'estado' => true,
                    'deleted_at' => null,
                ]
            );
        }
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
