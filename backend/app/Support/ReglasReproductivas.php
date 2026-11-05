<?php

namespace App\Support;

use App\Models\Gestacion;
use Carbon\Carbon;
use Illuminate\Validation\ValidationException;

class ReglasReproductivas
{
    /** 8,5 meses ≈ 259 días (mes promedio 30,44). */
    public const GESTACION_EXITOSA_MIN_DIAS = 259;

    /** 9,5 meses ≈ 289 días. */
    public const GESTACION_EXITOSA_MAX_DIAS = 289;

    public static function assertFechaOcurrida(string $campo, mixed $fecha, string $mensaje): void
    {
        if ($fecha === null || $fecha === '') {
            return;
        }

        if (self::parseFecha($fecha)->gt(now()->startOfDay())) {
            throw ValidationException::withMessages([
                $campo => $mensaje,
            ]);
        }
    }

    public static function assertNoAnterior(string $campo, mixed $fecha, mixed $referencia, string $mensaje): void
    {
        if ($fecha === null || $fecha === '' || $referencia === null || $referencia === '') {
            return;
        }

        if (self::parseFecha($fecha)->lt(self::parseFecha($referencia))) {
            throw ValidationException::withMessages([
                $campo => $mensaje,
            ]);
        }
    }

    public static function esGestacionFallida(string $estado): bool
    {
        return in_array($estado, [Gestacion::ESTADO_ABORTADA, Gestacion::ESTADO_PERDIDA], true);
    }

    public static function assertVentanaPartoExitoso(mixed $fechaServicio, mixed $fechaParto): void
    {
        $servicio = self::parseFecha($fechaServicio);
        $parto = self::parseFecha($fechaParto);
        $dias = (int) $servicio->diffInDays($parto, false);

        if ($dias < 0) {
            throw ValidationException::withMessages([
                'fecha_parto' => 'La fecha de parto no puede ser anterior a la fecha del servicio reproductivo.',
            ]);
        }

        if ($dias < self::GESTACION_EXITOSA_MIN_DIAS || $dias > self::GESTACION_EXITOSA_MAX_DIAS) {
            throw ValidationException::withMessages([
                'fecha_parto' => 'Un parto exitoso debe ocurrir entre 8,5 y 9,5 meses después del servicio (259 a 289 días). Los abortos o pérdidas se registran en la gestación, no como parto.',
            ]);
        }
    }

    public static function parseFecha(mixed $fecha): Carbon
    {
        if ($fecha instanceof Carbon) {
            return $fecha->copy()->startOfDay();
        }

        return Carbon::parse((string) $fecha)->startOfDay();
    }
}
