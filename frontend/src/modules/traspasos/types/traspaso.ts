export interface TraspasoDetalle {
  id?: number;
  animal_id: number;
  animal_codigo?: string | null;
  animal_arete?: string | null;
  sexo?: "M" | "H" | null;
  categoria_codigo?: string | null;
  categoria_nombre?: string | null;
  cantidad: number;
  peso: number;
  precio: number;
  subtotal: number;
}

export interface Traspaso {
  id: number;
  user_id: number;
  usuario_nombre?: string | null;
  lote_salida_id: number;
  lote_salida_codigo?: string | null;
  lote_salida_nombre?: string | null;
  lote_ingreso_id: number;
  lote_ingreso_codigo?: string | null;
  lote_ingreso_nombre?: string | null;
  fecha_traspaso: string;
  observacion: string | null;
  total_peso: number;
  monto_total: number;
  cantidad_animales?: number;
  detalles?: TraspasoDetalle[];
  created_at?: string | null;
  updated_at?: string | null;
}

export interface TraspasoCreateRequest {
  lote_salida_id: number;
  lote_ingreso_id: number;
  fecha_traspaso: string;
  observacion?: string | null;
  detalles: { animal_id: number }[];
}

export interface TraspasoUpdateRequest extends TraspasoCreateRequest {}

export interface TraspasoListParams {
  page?: number;
  per_page?: number;
  search?: string;
  lote_salida_id?: number;
  lote_ingreso_id?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
}
