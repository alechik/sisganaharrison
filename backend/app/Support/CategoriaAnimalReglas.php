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
     * peso_min_kg / peso_max_kg e indice_aumento son valores de referencia de la
     * categoría (no el peso real ni la ganancia de cada animal).
     *
     * @return array<string, array{
     *     nombre: string,
     *     descripcion: string,
     *     sexo: 'M'|'H'|null,
     *     edad_min_meses: int,
     *     edad_max_meses: int|null,
     *     castrado: bool|null,
     *     condicion: string,
     *     caracteristica: string,
     *     peso_min_kg: float|null,
     *     peso_max_kg: float|null,
     *     peso_referencia_meses: int|null,
     *     cambio_peso_meses: int|null,
     *     indice_aumento: float|null
     * }>
     */
    public static function catalogo(): array
    {
        return [
            'TERNEROS_M' => self::item(
                'TERNEROS (M)',
                'M',
                0,
                8,
                null,
                'Ternero que permanece con la madre',
                30,
                30,
                null,
                2,
                45
            ),
            'TERNEROS_H' => self::item(
                'TERNEROS (H)',
                'H',
                0,
                8,
                null,
                'Ternero que permanece con la madre',
                30,
                30,
                null,
                2,
                40
            ),
            'DESTETES_M' => self::item(
                'DESTETES (M)',
                'M',
                8,
                12,
                null,
                'Ya no permanece con la madre',
                210,
                260,
                null,
                2,
                25
            ),
            'DESTETES_H' => self::item(
                'DESTETES (H)',
                'H',
                8,
                12,
                null,
                'Ya no permanece con la madre',
                190,
                260,
                null,
                2,
                35
            ),
            'VAQUILLAS' => self::item(
                'VAQUILLAS',
                'H',
                13,
                24,
                null,
                'Hembra que aún no ha tenido su primer parto',
                260,
                340,
                null,
                2,
                13.33
            ),
            'TORILLOS' => self::item(
                'TORILLOS',
                'M',
                13,
                24,
                false,
                'Macho joven apto para engorde',
                260,
                410,
                null,
                2,
                25
            ),
            'VACAS' => self::item(
                'VACAS',
                'H',
                25,
                null,
                null,
                'Hembra adulta apta para reproducción',
                340,
                450,
                36,
                2,
                18.33
            ),
            'TOROS' => self::item(
                'TOROS',
                'M',
                25,
                null,
                false,
                'Macho adulto apto para reproducción',
                410,
                760,
                36,
                2,
                58.33
            ),
            'NOVILLOS' => self::item(
                'NOVILLOS',
                'M',
                16,
                24,
                true,
                'Macho joven castrado apto para engorde o trabajo',
                260,
                410,
                null,
                2,
                25
            ),
            'BUEY' => self::item(
                'BUEY',
                'M',
                25,
                null,
                true,
                'Macho adulto castrado apto para engorde o trabajo',
                410,
                760,
                36,
                2,
                58.33
            ),
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

        return self::catalogo()[strtoupper($codigo)] ?? null;
    }

    /**
     * Resuelve códigos históricos (TERNEROS, DESTETES, TERNERA) al código sexado.
     */
    public static function codigoResuelto(?string $codigo, ?string $sexo = null): ?string
    {
        $codigo = strtoupper(trim((string) $codigo));
        if ($codigo === '') {
            return null;
        }

        $sexo = strtoupper(trim((string) $sexo));
        $sufijo = $sexo === 'H' ? '_H' : ($sexo === 'M' ? '_M' : null);

        return match ($codigo) {
            'TERNEROS', 'TERNERO', 'TERNERA' => $sufijo ? 'TERNEROS'.$sufijo : ($codigo === 'TERNERA' ? 'TERNEROS_H' : ($codigo === 'TERNERO' ? 'TERNEROS_M' : $codigo)),
            'DESTETES' => $sufijo ? 'DESTETES'.$sufijo : $codigo,
            default => $codigo,
        };
    }

    public static function codigoCria(?string $sexo): string
    {
        return strtoupper((string) $sexo) === 'H' ? 'TERNEROS_H' : 'TERNEROS_M';
    }

    /**
     * @return list<string>
     */
    public static function codigosCria(?string $sexo): array
    {
        if (strtoupper((string) $sexo) === 'H') {
            return ['TERNEROS_H', 'TERNERA', 'TERNEROS'];
        }

        return ['TERNEROS_M', 'TERNERO', 'TERNEROS'];
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

        $regla = self::para($categoria->codigo) ?? self::desdeModelo($categoria);
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

        if (($regla['sexo'] ?? null) !== null && $sexo !== $regla['sexo']) {
            $esperado = $regla['sexo'] === 'H' ? 'hembra' : 'macho';
            throw ValidationException::withMessages([
                $campo => "La categoría {$categoria->nombre} solo admite sexo {$esperado}.",
            ]);
        }

        if (($regla['castrado'] ?? null) === true && ! $castrado) {
            throw ValidationException::withMessages([
                'castrado' => "La categoría {$categoria->nombre} requiere un macho castrado.",
            ]);
        }

        if (($regla['castrado'] ?? null) === false && $castrado) {
            throw ValidationException::withMessages([
                'castrado' => "La categoría {$categoria->nombre} es para machos enteros, no castrados.",
            ]);
        }

        if ($edad === null) {
            return;
        }

        $min = $regla['edad_min_meses'] ?? null;
        $max = $regla['edad_max_meses'] ?? null;
        if ($min !== null && ($edad < $min || ($max !== null && $edad > $max))) {
            $rango = $max === null
                ? "{$min} meses o más"
                : "{$min} a {$max} meses";

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
     * @return array<string, mixed>|null
     */
    public static function desdeModelo(CategoriaAnimal $categoria): ?array
    {
        if ($categoria->edad_min_meses === null && $categoria->sexo === null && $categoria->caracteristica === null) {
            return null;
        }

        return [
            'nombre' => $categoria->nombre,
            'descripcion' => $categoria->descripcion ?? $categoria->caracteristica ?? $categoria->nombre,
            'sexo' => $categoria->sexo,
            'edad_min_meses' => $categoria->edad_min_meses ?? 0,
            'edad_max_meses' => $categoria->edad_max_meses,
            'castrado' => $categoria->castrado,
            'condicion' => $categoria->caracteristica ?? '',
            'caracteristica' => $categoria->caracteristica ?? '',
            'peso_min_kg' => $categoria->peso_min_kg !== null ? (float) $categoria->peso_min_kg : null,
            'peso_max_kg' => $categoria->peso_max_kg !== null ? (float) $categoria->peso_max_kg : null,
            'peso_referencia_meses' => $categoria->peso_referencia_meses,
            'cambio_peso_meses' => $categoria->cambio_peso_meses,
            'indice_aumento' => $categoria->indice_aumento !== null ? (float) $categoria->indice_aumento : null,
        ];
    }

    /**
     * @param  array<string, mixed>  $regla
     * @return array<string, mixed>
     */
    public static function atributosPersistibles(array $regla): array
    {
        return [
            'nombre' => $regla['nombre'],
            'descripcion' => $regla['descripcion'],
            'sexo' => $regla['sexo'],
            'edad_min_meses' => $regla['edad_min_meses'],
            'edad_max_meses' => $regla['edad_max_meses'],
            'castrado' => $regla['castrado'],
            'caracteristica' => $regla['caracteristica'],
            'peso_min_kg' => $regla['peso_min_kg'],
            'peso_max_kg' => $regla['peso_max_kg'],
            'peso_referencia_meses' => $regla['peso_referencia_meses'],
            'cambio_peso_meses' => $regla['cambio_peso_meses'],
            'indice_aumento' => $regla['indice_aumento'],
            'activo' => true,
            'deleted_at' => null,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private static function item(
        string $nombre,
        ?string $sexo,
        int $edadMin,
        ?int $edadMax,
        ?bool $castrado,
        string $caracteristica,
        ?float $pesoMin,
        ?float $pesoMax,
        ?int $pesoReferenciaMeses,
        ?int $cambioPesoMeses,
        ?float $indiceAumento
    ): array {
        $rangoEdad = $edadMax === null ? "{$edadMin} meses o más" : "{$edadMin} a {$edadMax} meses";
        $sexoTexto = $sexo === 'H' ? 'Hembras' : ($sexo === 'M' ? 'Machos' : 'Ambos sexos');

        return [
            'nombre' => $nombre,
            'descripcion' => "{$rangoEdad}. {$sexoTexto}. {$caracteristica}.",
            'sexo' => $sexo,
            'edad_min_meses' => $edadMin,
            'edad_max_meses' => $edadMax,
            'castrado' => $castrado,
            'condicion' => $caracteristica,
            'caracteristica' => $caracteristica,
            'peso_min_kg' => $pesoMin,
            'peso_max_kg' => $pesoMax,
            'peso_referencia_meses' => $pesoReferenciaMeses,
            'cambio_peso_meses' => $cambioPesoMeses,
            'indice_aumento' => $indiceAumento,
        ];
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
