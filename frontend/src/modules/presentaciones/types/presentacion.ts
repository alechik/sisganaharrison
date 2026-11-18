export interface Presentacion {
  id: number;
  nombre: string;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
}

export interface PresentacionCreateRequest {
  nombre: string;
}

export interface PresentacionUpdateRequest extends PresentacionCreateRequest {}

export interface PresentacionListParams {
  page?: number;
  per_page?: number;
  search?: string;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
}
