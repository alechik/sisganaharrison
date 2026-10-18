<?php

namespace App\Services\Inventario;

use App\Models\AlmacenProducto;
use App\Models\Medicamento;
use App\Models\MovimientoInventario;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class InventarioService
{
    /**
     * Único punto de actualización de stock. No hay trigger: evita doble descuento.
     *
     * cantidad > 0 entra, cantidad < 0 sale.
     *
     * @param  array{almacen_id:int, medicamento_id:int, tipo:string, cantidad:float|int, precio_unitario?:float, origen_type:string, origen_id:int, observaciones?:string|null}  $data
     */
    public function registrar(array $data): MovimientoInventario
    {
        $cantidad = round((float) $data['cantidad'], 2);
        if ($cantidad == 0.0) {
            throw ValidationException::withMessages([
                'cantidad' => 'La cantidad del movimiento debe ser distinta de cero.',
            ]);
        }

        return DB::transaction(function () use ($data, $cantidad) {
            $existencia = AlmacenProducto::query()->updateOrCreate(
                [
                    'almacen_id' => (int) $data['almacen_id'],
                    'medicamento_id' => (int) $data['medicamento_id'],
                ],
                ['activo' => true]
            );

            $existencia = AlmacenProducto::query()
                ->whereKey($existencia->id)
                ->lockForUpdate()
                ->firstOrFail();

            $stockActual = (float) $existencia->stock;
            $nuevoStock = round($stockActual + $cantidad, 2);

            if ($nuevoStock < 0) {
                throw ValidationException::withMessages([
                    'stock' => 'No hay stock suficiente en el almacén seleccionado.',
                ]);
            }

            $yaExiste = MovimientoInventario::query()
                ->where('tipo', $data['tipo'])
                ->where('origen_type', $data['origen_type'])
                ->where('origen_id', (int) $data['origen_id'])
                ->where('almacen_id', (int) $data['almacen_id'])
                ->where('medicamento_id', (int) $data['medicamento_id'])
                ->lockForUpdate()
                ->first();

            if ($yaExiste) {
                throw ValidationException::withMessages([
                    'movimiento' => 'El movimiento de inventario ya fue registrado para este documento.',
                ]);
            }

            $precio = round((float) ($data['precio_unitario'] ?? 0), 2);

            $movimiento = MovimientoInventario::query()->create([
                'almacen_id' => (int) $data['almacen_id'],
                'medicamento_id' => (int) $data['medicamento_id'],
                'tipo' => $data['tipo'],
                'cantidad' => $cantidad,
                'precio_unitario' => $precio,
                'origen_type' => $data['origen_type'],
                'origen_id' => (int) $data['origen_id'],
                'user_id' => Auth::id(),
                'observaciones' => $data['observaciones'] ?? null,
            ]);

            $existencia->stock = $nuevoStock;
            $existencia->save();

            if (in_array($data['tipo'], [MovimientoInventario::TIPO_INGRESO_COMPRA, MovimientoInventario::TIPO_ANULACION], true)) {
                $this->actualizarPromedioPonderado((int) $data['medicamento_id'], $cantidad, $precio);
            }

            return $movimiento;
        });
    }

    public function anular(MovimientoInventario $original, string $observacion = 'Anulación de movimiento'): MovimientoInventario
    {
        return $this->registrar([
            'almacen_id' => $original->almacen_id,
            'medicamento_id' => $original->medicamento_id,
            'tipo' => MovimientoInventario::TIPO_ANULACION,
            'cantidad' => -1 * (float) $original->cantidad,
            'precio_unitario' => (float) $original->precio_unitario,
            'origen_type' => 'movimiento_inventario',
            'origen_id' => $original->id,
            'observaciones' => $observacion,
        ]);
    }

    /**
     * Precio promedio ponderado = valor acumulado de ingresos netos / cantidad neta ingresada.
     * Consumos no alteran el precio. Si la cantidad acumulada queda en cero, se conserva el último precio.
     */
    private function actualizarPromedioPonderado(int $medicamentoId, float $cantidad, float $precioUnitario): void
    {
        $producto = Medicamento::query()->lockForUpdate()->findOrFail($medicamentoId);
        $cantidadAcumulada = (float) $producto->cantidad_acumulada;
        $valorAcumulado = (float) $producto->valor_acumulado;

        $cantidadAcumulada = round($cantidadAcumulada + $cantidad, 2);
        $valorAcumulado = round($valorAcumulado + ($cantidad * $precioUnitario), 2);

        if ($cantidadAcumulada < 0) {
            $cantidadAcumulada = 0;
            $valorAcumulado = 0;
        }

        $producto->cantidad_acumulada = $cantidadAcumulada;
        $producto->valor_acumulado = max(0, $valorAcumulado);

        if ($cantidadAcumulada > 0) {
            $producto->precio = round($producto->valor_acumulado / $cantidadAcumulada, 2);
        }

        $producto->save();
    }
}
