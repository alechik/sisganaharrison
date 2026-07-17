export interface Gestacion {
  id: number;
  servicio_id: number;
  servicio_fecha_servicio?: string | null;
  servicio_tipo_servicio?: string | null;
  servicio_resultado?: string | null;
  servicio_hembra_codigo?: string | null;
  servicio_hembra_arete?: string | null;
  servicio_macho_codigo?: string | null;
  servicio_macho_arete?: string | null;
  fecha_confirmacion: string | null;
  fecha_probable_parto: string | null;
  estado: string;
  observaciones: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface GestacionCreateRequest {
  servicio_id: number;
  fecha_confirmacion?: string | null;
  fecha_probable_parto?: string | null;
  estado: string;
  observaciones?: string | null;
}

export interface GestacionUpdateRequest extends GestacionCreateRequest {}

export interface GestacionListParams {
  page?: number;
  per_page?: number;
  search?: string;
  servicio_id?: number;
  estado?: string;
  fecha_confirmacion_desde?: string;
  fecha_confirmacion_hasta?: string;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
}
