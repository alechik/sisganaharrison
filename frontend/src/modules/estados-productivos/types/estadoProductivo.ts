export interface EstadoProductivo {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
}

export interface EstadoProductivoCreateRequest {
  codigo: string;
  nombre: string;
  descripcion?: string | null;
}

export interface EstadoProductivoUpdateRequest extends EstadoProductivoCreateRequest {}

export interface EstadoProductivoListParams {
  page?: number;
  per_page?: number;
  search?: string;
  activo?: boolean;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
}
