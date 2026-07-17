export interface Parto {
  id: number;
  gestacion_id: number;
  gestacion_estado?: string | null;
  gestacion_fecha_confirmacion?: string | null;
  gestacion_fecha_probable_parto?: string | null;
  gestacion_servicio_fecha_servicio?: string | null;
  gestacion_servicio_tipo_servicio?: string | null;
  gestacion_servicio_resultado?: string | null;
  gestacion_servicio_hembra_codigo?: string | null;
  gestacion_servicio_hembra_arete?: string | null;
  gestacion_servicio_macho_codigo?: string | null;
  gestacion_servicio_macho_arete?: string | null;
  fecha_parto: string;
  observaciones: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface PartoCreateRequest {
  gestacion_id: number;
  fecha_parto: string;
  observaciones?: string | null;
}

export interface PartoUpdateRequest extends PartoCreateRequest {}

export interface PartoListParams {
  page?: number;
  per_page?: number;
  search?: string;
  gestacion_id?: number;
  fecha_parto_desde?: string;
  fecha_parto_hasta?: string;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
}
