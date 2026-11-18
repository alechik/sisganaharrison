<?php

namespace Tests\Feature;

use App\Models\Animal;
use App\Models\CategoriaAnimal;
use App\Models\Grupo;
use App\Models\Ingreso;
use App\Models\Potrero;
use App\Models\Persona;
use App\Models\Raza;
use App\Models\TipoIngreso;
use App\Models\User;
use App\Support\CategoriaAnimalReglas;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class IngresoFisicoTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();
        app(PermissionRegistrar::class)->forgetCachedPermissions();
        $this->seedTipos();
    }

    public function test_crud_tipo_ingreso(): void
    {
        Sanctum::actingAs($this->userWithPermissions([
            'tipos_ingresos.view',
            'tipos_ingresos.create',
            'tipos_ingresos.update',
            'tipos_ingresos.delete',
            'tipos_ingresos.activate',
        ]));

        $create = $this->postJson('/api/tipos-ingresos', [
            'nombre' => 'Hallazgo controlado',
            'codigo' => 'HALLAZGO',
            'iniciales' => 'HA',
            'descripcion' => 'Prueba',
            'requiere_proveedor' => false,
        ]);
        $create->assertCreated();
        $id = $create->json('data.id');

        $this->getJson('/api/tipos-ingresos/'.$id)
            ->assertOk()
            ->assertJsonPath('data.iniciales', 'HA');

        $this->putJson('/api/tipos-ingresos/'.$id, [
            'nombre' => 'Hallazgo actualizado',
            'codigo' => 'HALLAZGO',
            'iniciales' => 'HA',
            'descripcion' => 'Actualizado',
            'requiere_proveedor' => false,
        ])->assertOk();

        $this->patchJson('/api/tipos-ingresos/'.$id.'/estado')->assertOk();
        $this->deleteJson('/api/tipos-ingresos/'.$id)->assertOk();
        $this->assertSoftDeleted('tipos_ingresos', ['id' => $id]);
    }

    public function test_ingreso_compra_crea_animales_y_codigo_correlativo(): void
    {
        $user = $this->userWithPermissions(['compras.view', 'compras.create']);
        Sanctum::actingAs($user);
        $tipo = TipoIngreso::query()->where('codigo', 'COMPRA')->firstOrFail();
        $potrero = $this->potreroConCapacidad();
        $grupo = Grupo::factory()->create(['potrero_id' => $potrero->id]);
        $categoria = $this->categoria('DESTETES');
        $raza = Raza::query()->first() ?? Raza::factory()->create();
        $proveedor = Persona::factory()->create();

        $response = $this->postJson('/api/compras/ingresos', [
            'tipo_ingreso_id' => $tipo->id,
            'proveedor_id' => $proveedor->id,
            'potrero_id' => $potrero->id,
            'grupo_id' => $grupo->id,
            'fecha_ingreso' => now()->toDateString(),
            'descuento' => 50,
            'detalles' => [
                $this->detalle('AR-IN-001', 'H', 8, 180, 1500, $categoria->id, $raza->id),
                $this->detalle('AR-IN-002', 'M', 9, 190, 1600, $categoria->id, $raza->id),
            ],
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.codigo', 'INCO000001')
            ->assertJsonPath('data.cantidad_total', 2)
            ->assertJsonPath('data.user_id', $user->id);

        $ingreso = Ingreso::query()->findOrFail($response->json('data.id'));
        $this->assertSame(2, $ingreso->detalles()->count());
        $this->assertEquals(3050.0, (float) $ingreso->monto_total);
        $this->assertEquals(370.0, (float) $ingreso->total_peso);

        $animales = Animal::query()->whereIn('arete', ['AR-IN-001', 'AR-IN-002'])->orderBy('arete')->get();
        $this->assertCount(2, $animales);
        $this->assertCount(2, $animales->pluck('codigo')->unique());
        $this->assertTrue($animales->every(fn (Animal $animal) => $animal->estado === Animal::ESTADO_ACTIVO));
        $this->assertTrue($animales->every(fn (Animal $animal) => (int) $animal->potrero_id === $potrero->id));
        $this->assertTrue($animales->every(fn (Animal $animal) => (int) $animal->grupo_id === $grupo->id));
        $this->assertTrue($animales->every(fn (Animal $animal) => $animal->madre_id === null && $animal->padre_id === null));
        $this->assertTrue($animales->every(fn (Animal $animal) => $animal->estado_productivo_id === null));
        $this->assertSame($user->id, (int) $animales->first()->user_id);
        $this->assertSame(8, $animales->first()->edad_actual);
        $this->assertSame(
            now()->subMonths(8)->toDateString(),
            $animales->first()->fecha_nacimiento?->toDateString()
        );

        $segundo = $this->postJson('/api/compras/ingresos', [
            'tipo_ingreso_id' => $tipo->id,
            'proveedor_id' => $proveedor->id,
            'potrero_id' => $potrero->id,
            'grupo_id' => $grupo->id,
            'fecha_ingreso' => now()->toDateString(),
            'detalles' => [
                $this->detalle('AR-IN-003', 'H', 8, 170, 1400, $categoria->id, $raza->id),
            ],
        ]);
        $segundo->assertCreated()->assertJsonPath('data.codigo', 'INCO000002');
    }

    public function test_regalo_no_exige_proveedor(): void
    {
        Sanctum::actingAs($this->userWithPermissions(['compras.create', 'compras.view']));
        $tipo = TipoIngreso::query()->where('codigo', 'REGALO')->firstOrFail();
        $potrero = $this->potreroConCapacidad();
        $grupo = Grupo::factory()->create(['potrero_id' => $potrero->id]);
        $categoria = $this->categoria('DESTETES');
        $raza = Raza::query()->first() ?? Raza::factory()->create();

        $this->postJson('/api/compras/ingresos', [
            'tipo_ingreso_id' => $tipo->id,
            'potrero_id' => $potrero->id,
            'grupo_id' => $grupo->id,
            'fecha_ingreso' => now()->toDateString(),
            'detalles' => [
                $this->detalle('AR-RE-001', 'H', 8, 160, 0, $categoria->id, $raza->id),
            ],
        ])->assertCreated()->assertJsonPath('data.codigo', 'INRE000001');
    }

    public function test_compra_exige_proveedor(): void
    {
        Sanctum::actingAs($this->userWithPermissions(['compras.create']));
        $tipo = TipoIngreso::query()->where('codigo', 'COMPRA')->firstOrFail();
        $potrero = $this->potreroConCapacidad();
        $grupo = Grupo::factory()->create(['potrero_id' => $potrero->id]);
        $categoria = $this->categoria('DESTETES');
        $raza = Raza::query()->first() ?? Raza::factory()->create();

        $this->postJson('/api/compras/ingresos', [
            'tipo_ingreso_id' => $tipo->id,
            'potrero_id' => $potrero->id,
            'grupo_id' => $grupo->id,
            'fecha_ingreso' => now()->toDateString(),
            'detalles' => [
                $this->detalle('AR-CO-ERR', 'H', 8, 160, 100, $categoria->id, $raza->id),
            ],
        ])->assertStatus(422)->assertJsonValidationErrors(['proveedor_id']);
    }

    public function test_rechaza_arete_duplicado_y_grupo_de_otro_potrero(): void
    {
        Sanctum::actingAs($this->userWithPermissions(['compras.create']));
        $tipo = TipoIngreso::query()->where('codigo', 'OTROS')->firstOrFail();
        $potreroA = $this->potreroConCapacidad();
        $potreroB = Potrero::factory()->create([
            'parcela_id' => $potreroA->parcela_id,
            'codigo' => 'LT'.strtoupper(substr(uniqid(), -6)),
            'capacidad_animales' => 200,
        ]);
        $grupoB = Grupo::factory()->create(['potrero_id' => $potreroB->id]);
        $categoria = $this->categoria('DESTETES');
        $raza = Raza::query()->first() ?? Raza::factory()->create();

        $this->postJson('/api/compras/ingresos', [
            'tipo_ingreso_id' => $tipo->id,
            'potrero_id' => $potreroA->id,
            'grupo_id' => $grupoB->id,
            'fecha_ingreso' => now()->toDateString(),
            'detalles' => [
                $this->detalle('AR-DUP-1', 'H', 8, 160, 0, $categoria->id, $raza->id),
            ],
        ])->assertStatus(422);

        $grupoA = Grupo::factory()->create(['potrero_id' => $potreroA->id]);
        $this->postJson('/api/compras/ingresos', [
            'tipo_ingreso_id' => $tipo->id,
            'potrero_id' => $potreroA->id,
            'grupo_id' => $grupoA->id,
            'fecha_ingreso' => now()->toDateString(),
            'detalles' => [
                $this->detalle('AR-DUP-1', 'H', 8, 160, 0, $categoria->id, $raza->id),
                $this->detalle('AR-DUP-1', 'M', 8, 170, 0, $categoria->id, $raza->id),
            ],
        ])->assertStatus(422);
    }

    public function test_transaccion_no_deja_ingreso_parcial(): void
    {
        Sanctum::actingAs($this->userWithPermissions(['compras.create']));
        $tipo = TipoIngreso::query()->where('codigo', 'OTROS')->firstOrFail();
        $potrero = $this->potreroConCapacidad();
        $grupo = Grupo::factory()->create(['potrero_id' => $potrero->id]);
        $destetes = $this->categoria('DESTETES');
        $vacas = $this->categoria('VACAS');
        $raza = Raza::query()->first() ?? Raza::factory()->create();

        $antesIngresos = Ingreso::query()->count();
        $antesAnimales = Animal::query()->count();

        $this->postJson('/api/compras/ingresos', [
            'tipo_ingreso_id' => $tipo->id,
            'potrero_id' => $potrero->id,
            'grupo_id' => $grupo->id,
            'fecha_ingreso' => now()->toDateString(),
            'detalles' => [
                $this->detalle('AR-TX-001', 'H', 8, 160, 0, $destetes->id, $raza->id),
                $this->detalle('AR-TX-002', 'M', 30, 400, 0, $vacas->id, $raza->id),
            ],
        ])->assertStatus(422);

        $this->assertSame($antesIngresos, Ingreso::query()->count());
        $this->assertSame($antesAnimales, Animal::query()->count());
        $this->assertFalse(Animal::query()->where('arete', 'AR-TX-001')->exists());
    }

    public function test_preview_excel_y_plantilla(): void
    {
        Sanctum::actingAs($this->userWithPermissions(['compras.create']));
        $this->categoria('DESTETES');
        $raza = Raza::query()->first() ?? Raza::factory()->create(['codigo' => 'BRAHMAN']);

        $this->get('/api/compras/ingresos/plantilla-excel')
            ->assertOk()
            ->assertHeader('content-disposition');

        $csv = implode("\n", [
            'Arete,Sexo,Edad,Peso_kg,Precio,Categoria,Raza,Color,Observaciones,Castrado',
            'AR-XL-001,H,8,180.5,1500,DESTETES,'.$raza->codigo.',Colorado,,NO',
            'AR-XL-001,M,9,190,1600,DESTETES,'.$raza->codigo.',,,NO',
        ]);
        $file = UploadedFile::fake()->createWithContent('animales.csv', $csv);

        $preview = $this->post('/api/compras/ingresos/vista-previa-excel', [
            'archivo' => $file,
        ], ['Accept' => 'application/json']);

        $preview->assertOk();
        $this->assertSame(1, $preview->json('data.validas'));
        $this->assertSame(1, $preview->json('data.con_errores'));
        $this->assertFalse(Animal::query()->where('arete', 'AR-XL-001')->exists());
    }

    /**
     * @return array<string, mixed>
     */
    private function detalle(
        string $arete,
        string $sexo,
        int $edad,
        float $peso,
        float $precio,
        int $categoriaId,
        int $razaId
    ): array {
        return [
            'arete' => $arete,
            'sexo' => $sexo,
            'edad' => $edad,
            'peso_ingreso' => $peso,
            'precio_compra' => $precio,
            'categoria_id' => $categoriaId,
            'raza_id' => $razaId,
            'color' => 'Colorado',
            'castrado' => false,
        ];
    }

    private function seedTipos(): void
    {
        foreach ([
            ['Compra', 'COMPRA', 'CO', true],
            ['Regalo', 'REGALO', 'RE', false],
            ['Dotación', 'DOTACION', 'DO', false],
            ['Encontrado', 'ENCONTRADO', 'EN', false],
            ['Otros', 'OTROS', 'OT', false],
        ] as [$nombre, $codigo, $iniciales, $requiere]) {
            TipoIngreso::query()->updateOrCreate(
                ['codigo' => $codigo],
                [
                    'nombre' => $nombre,
                    'iniciales' => $iniciales,
                    'requiere_proveedor' => $requiere,
                    'estado' => true,
                ]
            );
        }
    }

    private function categoria(string $codigo): CategoriaAnimal
    {
        $regla = CategoriaAnimalReglas::para($codigo);

        return CategoriaAnimal::query()->updateOrCreate(
            ['codigo' => $codigo],
            [
                'nombre' => $regla['nombre'] ?? $codigo,
                'descripcion' => $regla['descripcion'] ?? $codigo,
                'activo' => true,
            ]
        );
    }

    private function potreroConCapacidad(): Potrero
    {
        $potrero = Potrero::query()->first() ?? Potrero::factory()->create();
        $potrero->capacidad_animales = 500;
        $potrero->activo = true;
        $potrero->save();

        return $potrero;
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
