export interface Producto {
  id: number;
  presentacion_id: number;
  presentacion_nombre?: string | null;
  presentacion_descripcion?: string | null;
  subcategoria_producto_id: number;
  subcategoria_nombre?: string | null;
  categoria_producto_id?: number | null;
  categoria_producto_nombre?: string | null;
  codigo: string;
  nombre: string;
  nombre_cientifico: string | null;
  precio: number;
  descripcion: string;
  activo: boolean;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
}

export interface ProductoCreateRequest {
  presentacion_id: number;
  subcategoria_producto_id: number;
  codigo: string;
  nombre: string;
  nombre_cientifico?: string | null;
  precio: number;
  descripcion: string;
}

export interface ProductoUpdateRequest extends ProductoCreateRequest {}

export interface ProductoListParams {
  page?: number;
  per_page?: number;
  search?: string;
  activo?: boolean;
  presentacion_id?: number;
  subcategoria_producto_id?: number;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
}
