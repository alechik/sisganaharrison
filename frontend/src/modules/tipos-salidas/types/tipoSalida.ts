export interface TipoSalida {
  id: number;
  nombre: string;
  codigo: string;
  iniciales: string;
  descripcion: string | null;
  requiere_cliente: boolean;
  estado: boolean;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
}

export interface TipoSalidaCreateRequest {
  nombre: string;
  codigo: string;
  iniciales: string;
  descripcion?: string | null;
  requiere_cliente?: boolean;
}

export interface TipoSalidaUpdateRequest extends TipoSalidaCreateRequest {}

export interface TipoSalidaListParams {
  page?: number;
  per_page?: number;
  search?: string;
  estado?: boolean;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
}
