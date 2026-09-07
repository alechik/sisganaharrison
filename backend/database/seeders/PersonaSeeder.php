<?php

namespace Database\Seeders;

use App\Models\Persona;
use App\Models\TipoPersona;
use App\Models\User;
use Illuminate\Database\Seeder;

class PersonaSeeder extends Seeder
{
    public function run(): void
    {
        $userId = User::query()->value('id');

        if (! $userId) {
            return;
        }

        $clienteId = TipoPersona::query()->where('nombre', TipoPersona::CLIENTE)->value('id');
        $proveedorId = TipoPersona::query()->where('nombre', TipoPersona::PROVEEDOR)->value('id');

        if (! $clienteId || ! $proveedorId) {
            return;
        }

        $registros = [
            [
                'razon_social' => 'Agropecuaria El Campo S.A.',
                'responsable' => 'Carlos Benítez',
                'email' => 'compras@elcampo.com',
                'ci' => 2456789,
                'nit' => '80012345-1',
                'celular' => 981111111,
                'sexo' => 'M',
                'estado_civil' => 'CASADO',
                'direccion' => 'Ruta 1 km 45, Paraguarí',
                'tipos' => [$clienteId],
            ],
            [
                'razon_social' => 'Ganadera Santa Rita',
                'responsable' => 'María López',
                'email' => 'santarita@ganadera.com',
                'ci' => 3124567,
                'nit' => '80023456-2',
                'celular' => 982222222,
                'sexo' => 'H',
                'estado_civil' => 'SOLTERO',
                'direccion' => 'San Pedro del Ycuamandyyú',
                'tipos' => [$clienteId],
            ],
            [
                'razon_social' => 'Frigorífico del Norte',
                'responsable' => 'Jorge Cáceres',
                'email' => 'ventas@frigonorte.com',
                'ci' => 1987654,
                'nit' => '80034567-3',
                'celular' => 983333333,
                'sexo' => 'M',
                'estado_civil' => 'CASADO',
                'direccion' => 'Concepción',
                'tipos' => [$clienteId],
            ],
            [
                'razon_social' => 'Insumos Veterinarios del Sur',
                'responsable' => 'Ana Pereira',
                'email' => 'contacto@vetesur.com',
                'ci' => 4567890,
                'nit' => '80045678-4',
                'celular' => 984444444,
                'sexo' => 'H',
                'estado_civil' => 'UNION_LIBRE',
                'direccion' => 'Encarnación',
                'tipos' => [$proveedorId],
            ],
            [
                'razon_social' => 'Forrajes y Semillas Misiones',
                'responsable' => 'Pedro Duarte',
                'email' => 'ventas@forrajesmisiones.com',
                'ci' => 5678901,
                'nit' => '80056789-5',
                'celular' => 985555555,
                'sexo' => 'M',
                'estado_civil' => 'CASADO',
                'direccion' => 'San Ignacio, Misiones',
                'tipos' => [$proveedorId],
            ],
            [
                'razon_social' => 'Agroquímicos Itapúa',
                'responsable' => 'Lucía Ferreira',
                'email' => 'info@agroita.com',
                'ci' => 6789012,
                'nit' => '80067890-6',
                'celular' => 986666666,
                'sexo' => 'H',
                'estado_civil' => 'DIVORCIADO',
                'direccion' => 'Hohenau',
                'tipos' => [$proveedorId],
            ],
            [
                'razon_social' => 'Comercial Ganadera Central',
                'responsable' => 'Ricardo Gómez',
                'email' => 'central@comgan.com',
                'ci' => 7890123,
                'nit' => '80078901-7',
                'celular' => 987777777,
                'sexo' => 'M',
                'estado_civil' => 'CASADO',
                'direccion' => 'Luque',
                'tipos' => [$clienteId, $proveedorId],
            ],
            [
                'razon_social' => 'Estancia Los Álamos',
                'responsable' => 'Silvia Martínez',
                'email' => 'losalamos@estancia.com',
                'ci' => 8901234,
                'nit' => '80089012-8',
                'celular' => 988888888,
                'sexo' => 'H',
                'estado_civil' => 'VIUDO',
                'direccion' => 'Caazapá',
                'tipos' => [$clienteId, $proveedorId],
            ],
        ];

        foreach ($registros as $registro) {
            $tipoIds = $registro['tipos'];
            unset($registro['tipos']);

            $persona = Persona::query()->firstOrCreate(
                ['email' => $registro['email']],
                [
                    ...$registro,
                    'fecha_reg' => now()->toDateString(),
                    'estado' => Persona::ESTADO_ACTIVO,
                    'user_id' => $userId,
                ]
            );

            $persona->tipos()->syncWithoutDetaching($tipoIds);
        }
    }
}
