export interface TipoSalida {
  id: number;
  nombre: string;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
}

export interface TipoSalidaCreateRequest {
  nombre: string;
}

export interface TipoSalidaUpdateRequest extends TipoSalidaCreateRequest {}

export interface TipoSalidaListParams {
  page?: number;
  per_page?: number;
  search?: string;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
}
