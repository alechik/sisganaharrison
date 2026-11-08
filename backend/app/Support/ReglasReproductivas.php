<?php

namespace App\Support;

use App\Models\Gestacion;
use Carbon\Carbon;
use Illuminate\Validation\ValidationException;

class ReglasReproductivas
{
    /** Duración media bovina para estimar la fecha probable de parto (informativa). */
    public const DIAS_GESTACION_MEDIA = 283;

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

    public static function fechaProbableParto(mixed $fechaBase): string
    {
        return self::parseFecha($fechaBase)->addDays(self::DIAS_GESTACION_MEDIA)->toDateString();
    }

    public static function parseFecha(mixed $fecha): Carbon
    {
        if ($fecha instanceof Carbon) {
            return $fecha->copy()->startOfDay();
        }

        return Carbon::parse((string) $fecha)->startOfDay();
    }
}
