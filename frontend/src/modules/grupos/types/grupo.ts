export interface Grupo {
  id: number;
  potrero_id: number;
  potrero_nombre?: string | null;
  potrero_codigo?: string | null;
  nombre: string;
  observaciones: string | null;
  activo: boolean;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
}

export interface GrupoCreateRequest {
  potrero_id: number;
  nombre: string;
  observaciones?: string | null;
}

export interface GrupoUpdateRequest extends GrupoCreateRequest {}

export interface GrupoListParams {
  page?: number;
  per_page?: number;
  search?: string;
  potrero_id?: number;
  activo?: boolean;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
}
