<?php

namespace Tests\Feature;

use App\Models\CategoriaAnimal;
use App\Models\User;
use App\Services\Animales\AnimalService;
use App\Support\CategoriaAnimalReglas;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class CategoriaAnimalReglasTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();
        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function test_rechaza_toro_de_un_mes(): void
    {
        Sanctum::actingAs($this->userWithPermissions(['animales.create']));

        $this->expectException(ValidationException::class);
        app(AnimalService::class)->create([
            'sexo' => 'M',
            'castrado' => false,
            'categoria_id' => $this->categoria('TOROS')->id,
            'fecha_nacimiento' => now()->subMonth()->toDateString(),
            'edad_inicial' => 1,
        ]);
    }

    public function test_acepta_vaca_adulta_sin_parto_previo(): void
    {
        Sanctum::actingAs($this->userWithPermissions(['animales.create']));

        $animal = app(AnimalService::class)->create([
            'sexo' => 'H',
            'castrado' => false,
            'categoria_id' => $this->categoria('VACAS')->id,
            'fecha_nacimiento' => now()->subMonths(30)->toDateString(),
            'edad_inicial' => 30,
        ]);

        $this->assertSame('H', $animal->sexo);
        $this->assertFalse((bool) $animal->castrado);
    }

    public function test_novillo_requiere_castracion_y_edad_minima_16(): void
    {
        Sanctum::actingAs($this->userWithPermissions(['animales.create']));

        $this->expectException(ValidationException::class);
        app(AnimalService::class)->create([
            'sexo' => 'M',
            'castrado' => false,
            'categoria_id' => $this->categoria('NOVILLOS')->id,
            'edad_inicial' => 18,
        ]);
    }

    public function test_torillo_no_admite_castrado(): void
    {
        Sanctum::actingAs($this->userWithPermissions(['animales.create']));

        $this->expectException(ValidationException::class);
        app(AnimalService::class)->create([
            'sexo' => 'M',
            'castrado' => true,
            'categoria_id' => $this->categoria('TORILLOS')->id,
            'edad_inicial' => 18,
        ]);
    }

    public function test_macho_castrado_de_14_meses_no_tiene_categoria(): void
    {
        Sanctum::actingAs($this->userWithPermissions(['animales.create']));

        $this->expectException(ValidationException::class);
        app(AnimalService::class)->create([
            'sexo' => 'M',
            'castrado' => true,
            'categoria_id' => $this->categoria('TORILLOS')->id,
            'edad_inicial' => 14,
        ]);
    }

    public function test_vaquillas_rechaza_sexo_macho(): void
    {
        Sanctum::actingAs($this->userWithPermissions(['animales.create']));

        $this->expectException(ValidationException::class);
        app(AnimalService::class)->create([
            'sexo' => 'M',
            'categoria_id' => $this->categoria('VAQUILLAS')->id,
            'edad_inicial' => 18,
        ]);
    }

    public function test_edad_se_calcula_desde_fecha_de_nacimiento(): void
    {
        $meses = CategoriaAnimalReglas::edadEnMeses(now()->subMonths(8)->toDateString(), 99);
        $this->assertSame(8, $meses);
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
