<?php

namespace Tests\Feature;

use App\Models\Animal;
use App\Models\CategoriaAnimal;
use App\Models\User;
use App\Services\Animales\AnimalService;
use App\Support\CategoriaAnimalReglas;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class CompraCantidadAnimalesTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();
        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function test_cantidad_genera_un_animal_por_ejemplar(): void
    {
        Sanctum::actingAs($this->userWithPermissions(['animales.create']));
        $categoria = $this->categoria('DESTETES');

        $lineas = app(AnimalService::class)->identificarEnDetalles([
            [
                'categoria_animal_id' => $categoria->id,
                'sexo' => 'M',
                'cantidad' => 3,
                'edad' => 9,
                'castrado' => false,
                'peso' => 180,
                'precio' => 1000,
                'descuento' => 50,
            ],
        ]);

        $this->assertCount(3, $lineas);
        $ids = array_map(fn (array $linea) => $linea['animal_id'], $lineas);
        $this->assertCount(3, array_unique($ids));
        $this->assertTrue(collect($lineas)->every(fn (array $linea) => (int) $linea['cantidad'] === 1));

        $animales = Animal::query()->whereIn('id', $ids)->get();
        $this->assertCount(3, $animales);
        $this->assertCount(3, $animales->pluck('codigo')->unique());
    }

    public function test_cantidad_con_animal_ya_identificado_debe_ser_uno(): void
    {
        Sanctum::actingAs($this->userWithPermissions(['animales.create']));
        $categoria = $this->categoria('DESTETES');
        $animal = app(AnimalService::class)->create([
            'sexo' => 'H',
            'categoria_id' => $categoria->id,
            'edad_inicial' => 8,
        ]);

        $this->expectException(\Illuminate\Validation\ValidationException::class);
        app(AnimalService::class)->identificarEnDetalles([
            [
                'categoria_animal_id' => $categoria->id,
                'sexo' => 'H',
                'animal_id' => $animal->id,
                'cantidad' => 4,
                'edad' => 8,
            ],
        ]);
    }

    private function categoria(string $codigo): CategoriaAnimal
    {
        $regla = CategoriaAnimalReglas::para($codigo);

        return CategoriaAnimal::query()->updateOrCreate(
            ['codigo' => $codigo],
            [
                'nombre' => $regla['nombre'],
                'descripcion' => $regla['descripcion'],
                'activo' => true,
            ]
        );
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
