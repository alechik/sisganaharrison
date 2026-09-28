export interface Presentacion {
  id: number;
  descripcion: string;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
}

export interface PresentacionCreateRequest {
  descripcion: string;
}

export interface PresentacionUpdateRequest extends PresentacionCreateRequest {}

export interface PresentacionListParams {
  page?: number;
  per_page?: number;
  search?: string;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
}
