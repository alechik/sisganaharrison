export interface TipoIngreso {
  id: number;
  nombre: string;
  codigo: string;
  iniciales: string;
  descripcion: string | null;
  requiere_proveedor: boolean;
  estado: boolean;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
}

export interface TipoIngresoCreateRequest {
  nombre: string;
  codigo: string;
  iniciales: string;
  descripcion?: string | null;
  requiere_proveedor?: boolean;
}

export interface TipoIngresoUpdateRequest extends TipoIngresoCreateRequest {}

export interface TipoIngresoListParams {
  page?: number;
  per_page?: number;
  search?: string;
  estado?: boolean;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
}
