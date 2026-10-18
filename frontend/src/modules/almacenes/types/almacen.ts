export interface Almacen {
  id: number;
  establecimiento_id: number;
  establecimiento_nombre?: string | null;
  establecimiento_codigo?: string | null;
  nombre: string;
  direccion?: string | null;
  observacion?: string | null;
  activo: boolean;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
}

export interface AlmacenCreateRequest {
  establecimiento_id: number;
  nombre: string;
  direccion?: string | null;
  observacion?: string | null;
}

export interface AlmacenListParams {
  page?: number;
  per_page?: number;
  search?: string;
  establecimiento_id?: number;
  activo?: boolean;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
}
