export interface UbicacionLugar {
  lote_id: number;
  lote_nombre: string;
  potrero_nombre: string | null;
  establecimiento_nombre: string | null;
}

export interface MovimientoUbicacion {
  fecha: string;
  tipo: string;
  tipo_nombre: string;
  origen: UbicacionLugar | null;
  destino: UbicacionLugar | null;
  referencia: string | null;
  observacion: string | null;
  usuario: string | null;
  proceso: "ingresos" | "traspasos" | "salidas";
  proceso_id: number;
}

export interface AnimalUbicacionResponse {
  actual: {
    ubicacion: UbicacionLugar | null;
    fecha_ultimo_cambio: string | null;
  };
  historial: MovimientoUbicacion[];
}
