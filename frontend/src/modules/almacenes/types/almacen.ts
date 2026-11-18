export interface Almacen {
  id: number;
  estancia_id: number;
  estancia_nombre?: string | null;
  estancia_codigo?: string | null;
  nombre: string;
  direccion?: string | null;
  observacion?: string | null;
  activo: boolean;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
}

export interface AlmacenCreateRequest {
  estancia_id: number;
  nombre: string;
  direccion?: string | null;
  observacion?: string | null;
}

export interface AlmacenListParams {
  page?: number;
  per_page?: number;
  search?: string;
  estancia_id?: number;
  activo?: boolean;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
}
