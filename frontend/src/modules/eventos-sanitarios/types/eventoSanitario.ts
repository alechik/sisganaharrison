export interface EventoSanitario {
  id: number;
  animal_id: number;
  animal_codigo?: string | null;
  animal_arete?: string | null;
  tipo_evento_id: number;
  tipo_evento_nombre?: string | null;
  tipo_evento_codigo?: string | null;
  vacuna_id: number | null;
  vacuna_nombre?: string | null;
  fecha: string;
  diagnostico: string | null;
  tratamiento: string | null;
  observaciones: string | null;
  created_at?: string | null;
}

export interface EventoSanitarioCreateRequest {
  animal_id: number;
  tipo_evento_id: number;
  vacuna_id?: number | null;
  fecha: string;
  diagnostico?: string | null;
  tratamiento?: string | null;
  observaciones?: string | null;
}

export interface EventoSanitarioListParams {
  page?: number;
  per_page?: number;
  search?: string;
  animal_id?: number;
  tipo_evento_id?: number;
  vacuna_id?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
}
