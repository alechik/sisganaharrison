export interface CategoriaProducto {
  id: number;
  nombre: string;
  activo: boolean;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
}

export interface CategoriaProductoCreateRequest {
  nombre: string;
}

export interface CategoriaProductoListParams {
  page?: number;
  per_page?: number;
  search?: string;
  activo?: boolean;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
}
