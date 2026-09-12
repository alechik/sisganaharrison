<?php

namespace Database\Seeders;

use App\Models\CategoriaAnimal;
use App\Models\OrdenCompra;
use App\Models\Persona;
use App\Models\TipoPersona;
use App\Models\User;
use Illuminate\Database\Seeder;

class OrdenCompraSeeder extends Seeder
{
    public function run(): void
    {
        $proveedores = Persona::query()
            ->whereHas('tipos', fn ($query) => $query->where('tipo.nombre', TipoPersona::PROVEEDOR))
            ->pluck('id');

        $usuarios = User::query()->pluck('id');
        $categorias = CategoriaAnimal::query()->pluck('id');
        $adminId = User::query()->orderBy('id')->value('id');

        if ($proveedores->isEmpty() || $usuarios->isEmpty() || $categorias->isEmpty()) {
            return;
        }

        $estados = [
            OrdenCompra::ESTADO_PENDIENTE,
            OrdenCompra::ESTADO_PENDIENTE,
            OrdenCompra::ESTADO_AUTORIZADA,
            OrdenCompra::ESTADO_AUTORIZADA,
            OrdenCompra::ESTADO_RECHAZADA,
            OrdenCompra::ESTADO_PENDIENTE,
        ];

        foreach ($estados as $index => $estado) {
            $codigo = 'OC-'.now()->year.'-'.str_pad((string) ($index + 1), 4, '0', STR_PAD_LEFT);
            $orden = OrdenCompra::query()->firstOrCreate(
                ['cod_compra' => $codigo],
                [
                    'proveedor_id' => $proveedores[$index % $proveedores->count()],
                    'user_id' => $usuarios[$index % $usuarios->count()],
                    'fecha' => now()->subDays(6 - $index)->toDateString(),
                    'estado' => $estado,
                    'descuento' => $index === 2 ? 50 : 0,
                    'total_peso' => 0,
                    'monto_total' => 0,
                    'autorizado_por' => in_array($estado, [OrdenCompra::ESTADO_AUTORIZADA, OrdenCompra::ESTADO_RECHAZADA], true)
                        ? $adminId
                        : null,
                    'fecha_decision' => in_array($estado, [OrdenCompra::ESTADO_AUTORIZADA, OrdenCompra::ESTADO_RECHAZADA], true)
                        ? now()->subDays(5 - $index)
                        : null,
                    'observacion_estado' => $estado === OrdenCompra::ESTADO_RECHAZADA
                        ? 'Documentación incompleta del proveedor.'
                        : null,
                ]
            );

            if ($orden->detalles()->exists()) {
                foreach ($orden->detalles as $detalleIndex => $detalle) {
                    if ((float) $detalle->peso > 0) {
                        continue;
                    }

                    $peso = round(180 + ($detalleIndex * 12.5), 2);
                    $detalle->peso = $peso;
                    $detalle->save();
                }

                $orden->total_peso = round(
                    $orden->detalles->sum(fn ($detalle) => (int) $detalle->cantidad * (float) $detalle->peso),
                    2
                );
                $orden->save();

                continue;
            }

            $categoriaId = $categorias[$index % $categorias->count()];
            $cantidad = 4 + $index;
            $peso = round(180 + ($index * 12.5), 2);
            $precio = 1200 + ($index * 80);
            $descuentoLinea = $index === 1 ? 100 : 0;
            $subtotal = ($cantidad * $precio) - $descuentoLinea;

            $orden->detalles()->create([
                'animal_id' => null,
                'categoria_animal_id' => $categoriaId,
                'cantidad' => $cantidad,
                'peso' => $peso,
                'precio' => $precio,
                'descuento' => $descuentoLinea,
                'subtotal' => $subtotal,
            ]);

            $orden->monto_total = max($subtotal - (float) $orden->descuento, 0);
            $orden->total_peso = round($cantidad * $peso, 2);
            $orden->save();
        }
    }
}
