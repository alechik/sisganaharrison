export interface PesajeDetalle {
  id?: number;
  animal_id: number;
  animal_codigo?: string | null;
  animal_arete?: string | null;
  lote_id?: number | null;
  lote_nombre?: string | null;
  potrero_nombre?: string | null;
  peso: number;
}

export interface Pesaje {
  id: number;
  codigo_pesaje: string;
  fecha_pesaje: string;
  total_peso: number;
  observacion: string | null;
  user_id: number;
  usuario_nombre?: string | null;
  cantidad_animales?: number;
  es_nacimiento?: boolean;
  es_ingreso?: boolean;
  detalles?: PesajeDetalle[];
  created_at?: string | null;
  updated_at?: string | null;
}

export interface PesajeDetalleRequest {
  animal_id: number;
  peso: number;
}

export interface PesajeCreateRequest {
  fecha_pesaje: string;
  observacion?: string | null;
  detalles: PesajeDetalleRequest[];
}

export interface PesajeListParams {
  page?: number;
  per_page?: number;
  search?: string;
  animal_id?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
}
