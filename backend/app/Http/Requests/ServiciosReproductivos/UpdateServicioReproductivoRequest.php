<?php

namespace App\Http\Requests\ServiciosReproductivos;

use App\Models\ServicioReproductivo;

class UpdateServicioReproductivoRequest extends StoreServicioReproductivoRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('reproduccion.update') ?? false;
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $tipo = (string) $this->input('tipo_servicio');
            $servicio = $this->route('servicio_reproductivo');

            if ($tipo === ServicioReproductivo::TIPO_MONTA_NATURAL && empty($this->input('macho_id'))) {
                $validator->errors()->add('macho_id', 'La monta natural requiere un macho.');
            }

            if ($tipo === ServicioReproductivo::TIPO_INSEMINACION_ARTIFICIAL) {
                $insumos = $this->input('insumos');
                $tieneNuevos = is_array($insumos) && $insumos !== [];
                $tieneExistentes = $servicio instanceof ServicioReproductivo
                    && $servicio->insumos()->exists();

                if (! $tieneNuevos && ! $tieneExistentes) {
                    $validator->errors()->add(
                        'insumos',
                        'La inseminación artificial requiere seleccionar el semen comprado (producto) y el almacén.'
                    );
                }
            }
        });
    }
}
