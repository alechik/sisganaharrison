export const GESTACION_EXITOSA_MIN_DIAS = 259;
export const GESTACION_EXITOSA_MAX_DIAS = 289;

export function hoyISO(): string {
  const fecha = new Date();
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, "0");
  const day = String(fecha.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function diasEntre(desde: string, hasta: string): number {
  const inicio = new Date(`${desde}T00:00:00`);
  const fin = new Date(`${hasta}T00:00:00`);
  return Math.round((fin.getTime() - inicio.getTime()) / 86400000);
}

export function esFechaFutura(fecha: string, hoy = hoyISO()): boolean {
  return Boolean(fecha) && fecha > hoy;
}

export function validarFechaServicio(fecha: string): string | null {
  if (!fecha) {
    return "La fecha de servicio es obligatoria.";
  }
  if (esFechaFutura(fecha)) {
    return "La fecha de servicio no puede ser futura.";
  }
  return null;
}

export function validarFechasGestacion(params: {
  fechaConfirmacion?: string | null;
  fechaProbableParto?: string | null;
  fechaServicio?: string | null;
}): string | null {
  const { fechaConfirmacion, fechaProbableParto, fechaServicio } = params;

  if (fechaConfirmacion && esFechaFutura(fechaConfirmacion)) {
    return "La fecha de confirmación de gestación no puede ser futura.";
  }
  if (fechaConfirmacion && fechaServicio && fechaConfirmacion < fechaServicio) {
    return "La fecha de confirmación no puede ser anterior a la fecha del servicio.";
  }
  if (fechaProbableParto && fechaServicio && fechaProbableParto < fechaServicio) {
    return "La fecha probable de parto no puede ser anterior a la fecha del servicio.";
  }
  if (fechaConfirmacion && fechaProbableParto && fechaProbableParto < fechaConfirmacion) {
    return "La fecha probable de parto debe ser igual o posterior a la fecha de confirmación.";
  }
  return null;
}

export function validarFechaPartoExitoso(params: {
  fechaParto: string;
  fechaServicio?: string | null;
  fechaConfirmacion?: string | null;
}): string | null {
  const { fechaParto, fechaServicio, fechaConfirmacion } = params;

  if (!fechaParto) {
    return "La fecha de parto es obligatoria.";
  }
  if (esFechaFutura(fechaParto)) {
    return "La fecha de parto no puede ser futura.";
  }
  if (fechaServicio && fechaParto < fechaServicio) {
    return "La fecha de parto no puede ser anterior a la fecha del servicio.";
  }
  if (fechaConfirmacion && fechaParto < fechaConfirmacion) {
    return "La fecha de parto no puede ser anterior a la confirmación de gestación.";
  }
  if (fechaServicio) {
    const dias = diasEntre(fechaServicio, fechaParto);
    if (dias < GESTACION_EXITOSA_MIN_DIAS || dias > GESTACION_EXITOSA_MAX_DIAS) {
      return "Un parto exitoso debe ocurrir entre 8,5 y 9,5 meses después del servicio (259 a 289 días). Los abortos o pérdidas se registran en la gestación.";
    }
  }
  return null;
}
