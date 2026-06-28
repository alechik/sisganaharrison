export interface Raza {
  id: number;
  nombre: string;
  codigo: string;
  descripcion: string | null;
  estado: boolean;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
}

export interface RazaCreateRequest {
  nombre: string;
  codigo: string;
  descripcion?: string | null;
}

export interface RazaUpdateRequest extends RazaCreateRequest {}

export interface RazaListParams {
  page?: number;
  per_page?: number;
  search?: string;
  estado?: boolean;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
}
