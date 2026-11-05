<?php

namespace App\Support;

use App\Models\CategoriaAnimal;
use App\Models\Parto;
use Carbon\Carbon;
use Illuminate\Validation\ValidationException;

class CategoriaAnimalReglas
{
    /**
     * Catálogo zootécnico oficial. No se inventan categorías fuera de esta lista.
     *
     * @return array<string, array{
     *     nombre: string,
     *     descripcion: string,
     *     sexo: 'M'|'H'|null,
     *     edad_min_meses: int,
     *     edad_max_meses: int|null,
     *     castrado: bool|null,
     *     condicion: string
     * }>
     */
    public static function catalogo(): array
    {
        return [
            'TERNEROS' => [
                'nombre' => 'TERNEROS',
                'descripcion' => '0 a 6 meses. Ambos sexos. Condición: con la madre (etapa descriptiva; no se exige madre_id en compras).',
                'sexo' => null,
                'edad_min_meses' => 0,
                'edad_max_meses' => 6,
                'castrado' => null,
                'condicion' => 'Con la madre',
            ],
            'DESTETES' => [
                'nombre' => 'DESTETES',
                'descripcion' => '7 a 12 meses. Ambos sexos. Destetados.',
                'sexo' => null,
                'edad_min_meses' => 7,
                'edad_max_meses' => 12,
                'castrado' => null,
                'condicion' => 'Destetados',
            ],
            'VAQUILLAS' => [
                'nombre' => 'VAQUILLAS',
                'descripcion' => '13 a 24 meses. Hembras sin primer parto.',
                'sexo' => 'H',
                'edad_min_meses' => 13,
                'edad_max_meses' => 24,
                'castrado' => null,
                'condicion' => 'Hembras sin primer parto',
            ],
            'TORILLOS' => [
                'nombre' => 'TORILLOS',
                'descripcion' => '13 a 24 meses. Machos jóvenes enteros para engorde (no castrados).',
                'sexo' => 'M',
                'edad_min_meses' => 13,
                'edad_max_meses' => 24,
                'castrado' => false,
                'condicion' => 'Machos jóvenes para engorde (enteros)',
            ],
            'NOVILLOS' => [
                'nombre' => 'NOVILLOS',
                'descripcion' => '16 a 24 meses. Machos castrados. Se distinguen de TORILLOS por la castración, no por un rango de edad exclusivo.',
                'sexo' => 'M',
                'edad_min_meses' => 16,
                'edad_max_meses' => 24,
                'castrado' => true,
                'condicion' => 'Machos castrados',
            ],
            'VACAS' => [
                'nombre' => 'VACAS',
                'descripcion' => '25 meses o más. Hembras adultas aptas para reproducción. No se exige un parto registrado.',
                'sexo' => 'H',
                'edad_min_meses' => 25,
                'edad_max_meses' => null,
                'castrado' => null,
                'condicion' => 'Hembras adultas aptas para reproducción',
            ],
            'TOROS' => [
                'nombre' => 'TOROS',
                'descripcion' => '25 meses o más. Machos adultos enteros aptos para reproducción.',
                'sexo' => 'M',
                'edad_min_meses' => 25,
                'edad_max_meses' => null,
                'castrado' => false,
                'condicion' => 'Machos adultos aptos para reproducción',
            ],
            'BUEY' => [
                'nombre' => 'BUEY',
                'descripcion' => '25 meses o más. Machos adultos castrados.',
                'sexo' => 'M',
                'edad_min_meses' => 25,
                'edad_max_meses' => null,
                'castrado' => true,
                'condicion' => 'Machos adultos castrados',
            ],
        ];
    }

    /**
     * @return array<string, mixed>|null
     */
    public static function para(?string $codigo): ?array
    {
        if ($codigo === null || $codigo === '') {
            return null;
        }

        return self::catalogo()[$codigo] ?? null;
    }

    /**
     * @param  array<string, mixed>  $datos
     */
    public static function assertCompatibilidad(array $datos, ?int $animalId = null, ?Carbon $referencia = null): void
    {
        $categoriaId = (int) ($datos['categoria_id'] ?? $datos['categoria_animal_id'] ?? 0);
        $categoria = CategoriaAnimal::query()->find($categoriaId);

        if (! $categoria) {
            throw ValidationException::withMessages([
                'categoria_id' => 'La categoría seleccionada no existe.',
            ]);
        }

        $regla = self::para($categoria->codigo);
        if ($regla === null) {
            return;
        }

        $sexo = strtoupper((string) ($datos['sexo'] ?? ''));
        $castrado = self::boolOrNull($datos['castrado'] ?? null) ?? false;
        $edad = self::edadEnMeses(
            $datos['fecha_nacimiento'] ?? null,
            self::edadDeclarada($datos),
            $referencia
        );

        if ($sexo === 'H' && $castrado) {
            throw ValidationException::withMessages([
                'castrado' => 'La castración solo aplica a machos.',
            ]);
        }

        if ($sexo === 'M' && $castrado && $edad !== null && $edad >= 13 && $edad <= 15) {
            throw ValidationException::withMessages([
                'categoria_id' => 'No hay categoría definida para machos castrados de 13 a 15 meses. NOVILLOS inicia a los 16 meses; TORILLOS es para machos enteros.',
            ]);
        }

        $campo = isset($datos['categoria_animal_id']) && ! isset($datos['categoria_id'])
            ? 'categoria_animal_id'
            : 'categoria_id';

        if ($regla['sexo'] !== null && $sexo !== $regla['sexo']) {
            $esperado = $regla['sexo'] === 'H' ? 'hembra' : 'macho';
            throw ValidationException::withMessages([
                $campo => "La categoría {$categoria->nombre} solo admite sexo {$esperado}.",
            ]);
        }

        if ($regla['castrado'] === true && ! $castrado) {
            throw ValidationException::withMessages([
                'castrado' => "La categoría {$categoria->nombre} requiere un macho castrado.",
            ]);
        }

        if ($regla['castrado'] === false && $castrado) {
            throw ValidationException::withMessages([
                'castrado' => "La categoría {$categoria->nombre} es para machos enteros, no castrados.",
            ]);
        }

        if ($edad === null) {
            return;
        }

        if ($edad < $regla['edad_min_meses'] || ($regla['edad_max_meses'] !== null && $edad > $regla['edad_max_meses'])) {
            $rango = $regla['edad_max_meses'] === null
                ? "{$regla['edad_min_meses']} meses o más"
                : "{$regla['edad_min_meses']} a {$regla['edad_max_meses']} meses";

            throw ValidationException::withMessages([
                $campo => "La categoría {$categoria->nombre} corresponde a animales de {$rango}. La edad calculada es de {$edad} meses.",
            ]);
        }

        if ($categoria->codigo === 'VAQUILLAS' && $animalId && self::hembraTieneParto($animalId)) {
            throw ValidationException::withMessages([
                $campo => 'VAQUILLAS es para hembras sin primer parto. Esta hembra ya tiene un parto registrado.',
            ]);
        }
    }

    public static function edadEnMeses(mixed $fechaNacimiento, ?int $edadDeclarada, ?Carbon $referencia = null): ?int
    {
        $referencia = ($referencia ?? now())->copy()->startOfDay();

        if ($fechaNacimiento instanceof Carbon || (is_string($fechaNacimiento) && $fechaNacimiento !== '')) {
            $nacimiento = $fechaNacimiento instanceof Carbon
                ? $fechaNacimiento->copy()->startOfDay()
                : Carbon::parse((string) $fechaNacimiento)->startOfDay();

            if ($nacimiento->gt($referencia)) {
                return null;
            }

            $meses = (($referencia->year - $nacimiento->year) * 12) + ($referencia->month - $nacimiento->month);
            if ($referencia->day < $nacimiento->day) {
                $meses--;
            }

            return max(0, $meses);
        }

        return $edadDeclarada;
    }

    /**
     * @param  array<string, mixed>  $datos
     */
    private static function edadDeclarada(array $datos): ?int
    {
        foreach (['edad_actual', 'edad_inicial', 'edad'] as $campo) {
            if (array_key_exists($campo, $datos) && $datos[$campo] !== null && $datos[$campo] !== '') {
                return (int) $datos[$campo];
            }
        }

        return null;
    }

    private static function hembraTieneParto(int $animalId): bool
    {
        return Parto::query()
            ->whereHas('gestacion.servicio', function ($query) use ($animalId) {
                $query->where('hembra_id', $animalId);
            })
            ->exists();
    }

    private static function boolOrNull(mixed $valor): ?bool
    {
        if ($valor === null || $valor === '') {
            return null;
        }

        return filter_var($valor, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? (bool) $valor;
    }
}
