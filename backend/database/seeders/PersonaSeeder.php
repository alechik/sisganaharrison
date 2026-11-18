<?php

namespace Database\Seeders;

use App\Models\Persona;
use App\Models\TipoPersona;
use App\Models\User;
use Illuminate\Database\Seeder;

class PersonaSeeder extends Seeder
{
    /**
     * @var list<array{razon_social: string, responsable: string, email: string, nit: string, celular: int, direccion: string, tipos: list<string>}>
     */
    public const SOCIOS = [
        [
            'razon_social' => 'Frigorífico Santa Cruz S.A.',
            'responsable' => 'Luis Arce',
            'email' => 'compras@frigosantacruz.example',
            'nit' => '102030401',
            'celular' => 77001122,
            'direccion' => 'Av. Banzer, Santa Cruz de la Sierra',
            'tipos' => [TipoPersona::CLIENTE],
        ],
        [
            'razon_social' => 'Carnes del Oriente Ltda.',
            'responsable' => 'María Pinto',
            'email' => 'ventas@carnesoriente.example',
            'nit' => '102030402',
            'celular' => 77003344,
            'direccion' => 'Zona Industrial, Warnes',
            'tipos' => [TipoPersona::CLIENTE],
        ],
        [
            'razon_social' => 'Veterinaria El Hato',
            'responsable' => 'Pedro Guzmán',
            'email' => 'pedidos@elhato.example',
            'nit' => '102030403',
            'celular' => 77005566,
            'direccion' => 'Av. Cristo Redentor, Santa Cruz',
            'tipos' => [TipoPersona::PROVEEDOR],
        ],
        [
            'razon_social' => 'Insumos Ganaderos Bolivia',
            'responsable' => 'Ana Rivero',
            'email' => 'contacto@insumosganaderos.example',
            'nit' => '102030404',
            'celular' => 77007788,
            'direccion' => 'Doble vía La Guardia Km 8',
            'tipos' => [TipoPersona::PROVEEDOR],
        ],
        [
            'razon_social' => 'Agropecuaria Cuatro Hermanos',
            'responsable' => 'Omar Vallejos',
            'email' => 'comercial@cuatrohermanos.example',
            'nit' => '102030405',
            'celular' => 77009900,
            'direccion' => 'San Ignacio de Velasco',
            'tipos' => [TipoPersona::CLIENTE, TipoPersona::PROVEEDOR],
        ],
    ];

    public function run(): void
    {
        $userId = User::query()->value('id');
        if (! $userId) {
            return;
        }

        $tipos = TipoPersona::query()
            ->whereIn('nombre', [TipoPersona::CLIENTE, TipoPersona::PROVEEDOR])
            ->get()
            ->keyBy('nombre');

        if ($tipos->isEmpty()) {
            return;
        }

        foreach (self::SOCIOS as $item) {
            $persona = Persona::query()->firstOrCreate(
                ['razon_social' => $item['razon_social']],
                [
                    'responsable' => $item['responsable'],
                    'email' => $item['email'],
                    'nit' => $item['nit'],
                    'celular' => $item['celular'],
                    'direccion' => $item['direccion'],
                    'estado' => Persona::ESTADO_ACTIVO,
                    'fecha_reg' => now()->toDateString(),
                    'user_id' => $userId,
                ]
            );

            $tipoIds = collect($item['tipos'])
                ->map(fn (string $nombre) => $tipos->get($nombre)?->id)
                ->filter()
                ->values()
                ->all();

            if ($tipoIds !== []) {
                $persona->tipos()->syncWithoutDetaching($tipoIds);
            }
        }
    }
}
