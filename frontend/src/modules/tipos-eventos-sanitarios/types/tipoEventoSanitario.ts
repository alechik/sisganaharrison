export interface TipoEventoSanitario {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
}

export interface TipoEventoSanitarioCreateRequest {
  codigo: string;
  nombre: string;
  descripcion?: string | null;
}

export interface TipoEventoSanitarioUpdateRequest extends TipoEventoSanitarioCreateRequest {}

export interface TipoEventoSanitarioListParams {
  page?: number;
  per_page?: number;
  search?: string;
  activo?: boolean;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
}
