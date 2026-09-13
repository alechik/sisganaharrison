<?php

namespace Database\Seeders;

use App\Models\CategoriaAnimal;
use App\Models\Cuarentena;
use App\Models\OrdenCompra;
use App\Models\Persona;
use App\Models\TipoPersona;
use App\Models\User;
use Illuminate\Database\Seeder;

class CuarentenaSeeder extends Seeder
{
    public function run(): void
    {
        $proveedores = Persona::query()
            ->whereHas('tipos', fn ($query) => $query->where('tipo.nombre', TipoPersona::PROVEEDOR))
            ->pluck('id');
        $usuarios = User::query()->pluck('id');
        $categorias = CategoriaAnimal::query()->pluck('id');

        if ($proveedores->isEmpty() || $usuarios->isEmpty() || $categorias->isEmpty()) {
            return;
        }

        $ordenes = OrdenCompra::query()
            ->where('estado', OrdenCompra::ESTADO_AUTORIZADA)
            ->with('detalles')
            ->orderBy('id')
            ->take(2)
            ->get();

        foreach ($ordenes as $index => $orden) {
            if ($orden->cuarentena()->exists() || $orden->detalles->isEmpty()) {
                continue;
            }

            $cuarentena = Cuarentena::query()->create([
                'proveedor_id' => $orden->proveedor_id,
                'user_id' => $orden->user_id,
                'orden_compra_id' => $orden->id,
                'cod_compra' => $orden->cod_compra,
                'origen' => Cuarentena::ORIGEN_ORDEN_COMPRA,
                'fecha_inicio' => now()->subDays(4 - $index)->toDateString(),
                'fecha_fin' => $index === 1 ? now()->subDay()->toDateString() : null,
                'estado' => $index === 1 ? Cuarentena::ESTADO_COMPLETADO : Cuarentena::ESTADO_PROCESADO,
                'descuento' => $orden->descuento,
                'total_peso' => 0,
                'monto_total' => 0,
            ]);

            foreach ($orden->detalles as $detalle) {
                $cuarentena->detalles()->create([
                    'animal_id' => null,
                    'categoria_animal_id' => $detalle->categoria_animal_id,
                    'cantidad' => $detalle->cantidad,
                    'peso' => $detalle->peso,
                    'precio' => $detalle->precio,
                    'descuento' => $detalle->descuento,
                    'estado' => $cuarentena->estado,
                    'subtotal' => $detalle->subtotal,
                ]);
            }

            $cuarentena->load('detalles');
            $cuarentena->monto_total = max(
                (float) $cuarentena->detalles->sum('subtotal') - (float) $cuarentena->descuento,
                0
            );
            $cuarentena->total_peso = $cuarentena->detalles->sum(
                fn ($detalle) => (int) $detalle->cantidad * (float) $detalle->peso
            );
            $cuarentena->save();
        }

        foreach ([Cuarentena::ESTADO_PROCESADO, Cuarentena::ESTADO_COMPLETADO, Cuarentena::ESTADO_PROCESADO] as $index => $estado) {
            $codigo = 'CQ-'.now()->year.'-'.str_pad((string) ($index + 1), 4, '0', STR_PAD_LEFT);
            if (Cuarentena::query()->where('cod_compra', $codigo)->exists()) {
                continue;
            }

            $cantidad = 3 + $index;
            $peso = round(160 + ($index * 15.25), 2);
            $precio = 1100 + ($index * 90);
            $subtotal = $cantidad * $precio;

            $cuarentena = Cuarentena::query()->create([
                'proveedor_id' => $proveedores[$index % $proveedores->count()],
                'user_id' => $usuarios[$index % $usuarios->count()],
                'orden_compra_id' => null,
                'cod_compra' => $codigo,
                'origen' => Cuarentena::ORIGEN_DIRECTA,
                'fecha_inicio' => now()->subDays(8 - $index)->toDateString(),
                'fecha_fin' => $estado === Cuarentena::ESTADO_COMPLETADO ? now()->subDays(2)->toDateString() : null,
                'estado' => $estado,
                'descuento' => 0,
                'total_peso' => round($cantidad * $peso, 2),
                'monto_total' => $subtotal,
            ]);

            $cuarentena->detalles()->create([
                'animal_id' => null,
                'categoria_animal_id' => $categorias[$index % $categorias->count()],
                'cantidad' => $cantidad,
                'peso' => $peso,
                'precio' => $precio,
                'descuento' => 0,
                'estado' => $estado,
                'subtotal' => $subtotal,
            ]);
        }
    }
}
