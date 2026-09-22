export interface ServicioReproductivo {
  id: number;
  hembra_id: number;
  hembra_codigo?: string | null;
  hembra_arete?: string | null;
  macho_id: number | null;
  macho_codigo?: string | null;
  macho_arete?: string | null;
  fecha_servicio: string;
  tipo_servicio: string;
  resultado: string | null;
  observaciones: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface ServicioReproductivoCreateRequest {
  hembra_id: number;
  macho_id?: number | null;
  fecha_servicio: string;
  tipo_servicio: string;
  resultado?: string | null;
  observaciones?: string | null;
}

export interface ServicioReproductivoUpdateRequest extends ServicioReproductivoCreateRequest {}

export interface ServicioReproductivoListParams {
  page?: number;
  per_page?: number;
  search?: string;
  hembra_id?: number;
  macho_id?: number;
  tipo_servicio?: string;
  resultado?: string;
  sin_gestacion?: boolean;
  incluir_id?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
}
