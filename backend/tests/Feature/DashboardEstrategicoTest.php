<?php

namespace Tests\Feature;

use App\Models\Animal;
use App\Models\CategoriaAnimal;
use App\Models\DetalleEventoSanitario;
use App\Models\DetalleIngreso;
use App\Models\DetallePesaje;
use App\Models\DetalleSalida;
use App\Models\EstadoProductivo;
use App\Models\EventoSanitario;
use App\Models\Gestacion;
use App\Models\Ingreso;
use App\Models\Lote;
use App\Models\Medicamento;
use App\Models\Nacimiento;
use App\Models\Parto;
use App\Models\Pesaje;
use App\Models\Raza;
use App\Models\Salida;
use App\Models\ServicioReproductivo;
use App\Models\TipoEventoSanitario;
use App\Models\TipoSalida;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class DashboardEstrategicoTest extends TestCase
{
    use DatabaseTransactions;

    public function test_dashboard_exige_autenticacion(): void
    {
        $this->getJson('/api/dashboard')->assertUnauthorized();
    }

    public function test_rango_invalido_responde_422(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->getJson('/api/dashboard?periodo=rango&desde=1990-05-02&hasta=1990-05-01')
            ->assertStatus(422);
    }

    public function test_periodo_sin_actividad_devuelve_ceros_y_descarte_no_disponible(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $response = $this->getJson('/api/dashboard?periodo=rango&desde=1979-01-01&hasta=1979-01-31');

        $response->assertOk();
        $response->assertJsonPath('data.periodo.desde', '1979-01-01');
        $response->assertJsonPath('data.periodo.hasta', '1979-01-31');
        $response->assertJsonPath('data.estrategicos.hato.ingresos', 0);
        $response->assertJsonPath('data.estrategicos.hato.nacimientos_vivos', 0);
        $response->assertJsonPath('data.estrategicos.hato.muertes', 0);
        $response->assertJsonPath('data.estrategicos.hato.ventas', 0);
        $response->assertJsonPath('data.estrategicos.hato.variacion_neta', 0);
        $response->assertJsonPath('data.estrategicos.mortalidad.cantidad', 0);
        $response->assertJsonPath('data.estrategicos.natalidad.nacidos_vivos', 0);
        $response->assertJsonPath('data.estrategicos.natalidad.nacidos_muertos', 0);
        $response->assertJsonPath('data.estrategicos.descarte.disponible', false);
        $response->assertJsonPath('data.estrategicos.descarte.tasa', null);
        $response->assertJsonPath('data.estrategicos.sanidad.eventos', 0);
        $response->assertJsonPath('data.estrategicos.sanidad.animales_atendidos', 0);
        $response->assertJsonPath('data.estrategicos.productividad.peso_promedio_kg', null);
        $response->assertJsonPath('data.estrategicos.productividad.ganancia_promedio_kg', null);
        $response->assertJsonPath('data.estrategicos.reproduccion.partos', 0);
        $this->assertCount(1, $response->json('data.estrategicos.hato.serie'));
        $this->assertNotNull($response->json('data.estrategicos.mortalidad.formula'));
    }

    public function test_indicadores_cuentan_el_periodo_sin_duplicar_ni_incluir_eliminados(): void
    {
        Sanctum::actingAs(User::factory()->create());
        $desde = '1998-07-01';
        $hasta = '1998-07-31';
        $antes = $this->getJson("/api/dashboard?periodo=rango&desde={$desde}&hasta={$hasta}")->assertOk();

        $hembra = $this->animal(['sexo' => 'H', 'estado' => Animal::ESTADO_ACTIVO]);
        $muerto = $this->animal(['sexo' => 'M', 'estado' => Animal::ESTADO_MUERTO]);
        $vendido = $this->animal(['sexo' => 'M', 'estado' => Animal::ESTADO_VENDIDO]);
        $eliminado = $this->animal(['sexo' => 'H', 'estado' => Animal::ESTADO_ACTIVO]);
        $eliminado->delete();

        $this->salida($muerto, TipoSalida::NOMBRE_MUERTE, '1998-07-10');
        $this->salida($vendido, TipoSalida::NOMBRE_VENTA, '1998-07-11');

        $parto = $this->parto($hembra, '1998-07-15');
        $cria = $this->animal(['sexo' => 'M', 'estado' => Animal::ESTADO_ACTIVO]);
        Nacimiento::factory()->vivo()->create([
            'parto_id' => $parto->id,
            'animal_id' => $cria->id,
        ]);
        Nacimiento::factory()->muerto()->create([
            'parto_id' => $parto->id,
            'animal_id' => null,
        ]);

        $ingreso = Ingreso::factory()->create([
            'fecha_ingreso' => '1998-07-05',
            'lote_id' => $hembra->lote_id,
        ]);
        DetalleIngreso::query()->create([
            'ingreso_id' => $ingreso->id,
            'animal_id' => $cria->id,
            'peso_oc' => 30,
            'peso_ingreso' => 32,
            'precio_compra' => 0,
        ]);

        $tipo = TipoEventoSanitario::factory()->create([
            'codigo' => 'VAC'.strtoupper(substr(uniqid(), -5)),
            'nombre' => 'Vacunación de prueba',
        ]);
        $medicamento = Medicamento::factory()->create();
        foreach (['1998-07-20', '1998-07-21'] as $fecha) {
            $evento = EventoSanitario::factory()->create([
                'tipo_evento_id' => $tipo->id,
                'fecha' => $fecha,
            ]);
            DetalleEventoSanitario::query()->create([
                'evento_sanitario_id' => $evento->id,
                'animal_id' => $hembra->id,
                'lote_id' => $hembra->lote_id,
                'medicamento_id' => $medicamento->id,
                'peso_animal' => 400,
                'precio_medicamento' => 10,
            ]);
        }

        $primero = Pesaje::factory()->create(['fecha_pesaje' => '1998-07-08']);
        $segundo = Pesaje::factory()->create(['fecha_pesaje' => '1998-07-22']);
        DetallePesaje::query()->create([
            'pesaje_id' => $primero->id,
            'animal_id' => $hembra->id,
            'lote_id' => $hembra->lote_id,
            'peso' => 400,
        ]);
        DetallePesaje::query()->create([
            'pesaje_id' => $segundo->id,
            'animal_id' => $hembra->id,
            'lote_id' => $hembra->lote_id,
            'peso' => 430,
        ]);

        $response = $this->getJson("/api/dashboard?periodo=rango&desde={$desde}&hasta={$hasta}");
        $response->assertOk();

        $hatoAntes = (int) $antes->json('data.estrategicos.hato.hato_actual');
        $this->assertSame($hatoAntes + 2, $response->json('data.estrategicos.hato.hato_actual'));
        $this->assertSame($antes->json('data.estrategicos.hato.ingresos') + 1, $response->json('data.estrategicos.hato.ingresos'));
        $this->assertSame($antes->json('data.estrategicos.hato.nacimientos_vivos') + 1, $response->json('data.estrategicos.natalidad.nacidos_vivos'));
        $this->assertSame($antes->json('data.estrategicos.natalidad.nacidos_muertos') + 1, $response->json('data.estrategicos.natalidad.nacidos_muertos'));
        $this->assertSame($antes->json('data.estrategicos.mortalidad.cantidad') + 1, $response->json('data.estrategicos.mortalidad.cantidad'));
        $this->assertSame($antes->json('data.estrategicos.hato.ventas') + 1, $response->json('data.estrategicos.hato.ventas'));
        $this->assertSame($antes->json('data.estrategicos.reproduccion.partos') + 1, $response->json('data.estrategicos.reproduccion.partos'));

        $muertes = (int) $response->json('data.estrategicos.mortalidad.cantidad');
        $hato = (int) $response->json('data.estrategicos.hato.hato_actual');
        $this->assertEquals(round($muertes / ($hato + $muertes) * 100, 1), $response->json('data.estrategicos.mortalidad.tasa'));

        $this->assertSame($antes->json('data.estrategicos.sanidad.eventos') + 2, $response->json('data.estrategicos.sanidad.eventos'));
        $this->assertSame($antes->json('data.estrategicos.sanidad.animales_atendidos') + 1, $response->json('data.estrategicos.sanidad.animales_atendidos'));
        $this->assertTrue($response->json('data.estrategicos.sanidad.vacunacion.disponible'));
        $this->assertNull($antes->json('data.estrategicos.productividad.ganancia_promedio_kg'));
        $this->assertNull($antes->json('data.estrategicos.productividad.peso_promedio_kg'));
        $this->assertSame(30.0, (float) $response->json('data.estrategicos.productividad.ganancia_promedio_kg'));
        $this->assertSame(415.0, (float) $response->json('data.estrategicos.productividad.peso_promedio_kg'));
        $this->assertSame(
            $antes->json('data.estrategicos.hato.serie.0.nacimientos') + 1,
            $response->json('data.estrategicos.hato.serie.0.nacimientos')
        );
        $this->assertSame(
            $antes->json('data.estrategicos.hato.serie.0.muertes') + 1,
            $response->json('data.estrategicos.hato.serie.0.muertes')
        );
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    private function animal(array $attributes = []): Animal
    {
        return Animal::factory()->create(array_merge([
            'lote_id' => Lote::query()->value('id'),
            'categoria_id' => CategoriaAnimal::query()->value('id'),
            'estado_productivo_id' => EstadoProductivo::query()->value('id'),
            'raza_id' => Raza::query()->value('id'),
        ], $attributes));
    }

    private function salida(Animal $animal, string $tipo, string $fecha): void
    {
        $tipoId = TipoSalida::query()->where('nombre', $tipo)->value('id');
        $salida = Salida::factory()->create([
            'tipo_salida_id' => $tipoId,
            'fecha_salida' => $fecha,
        ]);
        DetalleSalida::query()->create([
            'salida_id' => $salida->id,
            'animal_id' => $animal->id,
            'cantidad' => 1,
            'peso' => 300,
            'lote_id' => $animal->lote_id,
            'precio' => 0,
            'descuento' => 0,
            'subtotal' => 0,
        ]);
    }

    private function parto(Animal $hembra, string $fecha): Parto
    {
        $servicio = ServicioReproductivo::factory()->create([
            'hembra_id' => $hembra->id,
            'macho_id' => null,
            'fecha_servicio' => '1998-01-01',
            'tipo_servicio' => 'INSEMINACION_ARTIFICIAL',
            'resultado' => ServicioReproductivo::RESULTADO_PRENADA,
        ]);
        $gestacion = Gestacion::factory()->create([
            'servicio_id' => $servicio->id,
            'estado' => Gestacion::ESTADO_FINALIZADA,
            'fecha_confirmacion' => '1998-07-02',
        ]);

        return Parto::factory()->create([
            'gestacion_id' => $gestacion->id,
            'fecha_parto' => $fecha,
            'estado' => Parto::ESTADO_FINALIZADA,
        ]);
    }
}
