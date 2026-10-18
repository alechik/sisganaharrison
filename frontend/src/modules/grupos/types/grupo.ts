export interface Grupo {
  id: number;
  lote_id: number;
  lote_nombre?: string | null;
  lote_codigo?: string | null;
  nombre: string;
  observaciones: string | null;
  activo: boolean;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
}

export interface GrupoCreateRequest {
  lote_id: number;
  nombre: string;
  observaciones?: string | null;
}

export interface GrupoUpdateRequest extends GrupoCreateRequest {}

export interface GrupoListParams {
  page?: number;
  per_page?: number;
  search?: string;
  lote_id?: number;
  activo?: boolean;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
}
