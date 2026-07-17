export interface Pesaje {
  id: number;
  animal_id: number;
  animal_codigo?: string | null;
  animal_arete?: string | null;
  fecha: string;
  peso: number;
  observaciones: string | null;
  created_at?: string | null;
}

export interface PesajeCreateRequest {
  animal_id: number;
  fecha: string;
  peso: number;
  observaciones?: string | null;
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
