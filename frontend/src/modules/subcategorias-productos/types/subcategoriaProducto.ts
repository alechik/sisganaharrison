export interface SubcategoriaProducto {
  id: number;
  categoria_producto_id: number;
  categoria_nombre?: string | null;
  nombre: string;
  activo: boolean;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
}

export interface SubcategoriaProductoCreateRequest {
  categoria_producto_id: number;
  nombre: string;
}

export interface SubcategoriaProductoListParams {
  page?: number;
  per_page?: number;
  search?: string;
  categoria_producto_id?: number;
  activo?: boolean;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
}
