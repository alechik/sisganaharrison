export interface TipoMovimiento {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
}

export interface TipoMovimientoCreateRequest {
  codigo: string;
  nombre: string;
  descripcion?: string | null;
}

export interface TipoMovimientoUpdateRequest extends TipoMovimientoCreateRequest {}

export interface TipoMovimientoListParams {
  page?: number;
  per_page?: number;
  search?: string;
  activo?: boolean;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
}
