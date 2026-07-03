export interface Vacuna {
  id: number;
  codigo: string;
  nombre: string;
  laboratorio: string | null;
  descripcion: string | null;
  activo: boolean;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
}

export interface VacunaCreateRequest {
  codigo: string;
  nombre: string;
  laboratorio?: string | null;
  descripcion?: string | null;
}

export interface VacunaUpdateRequest extends VacunaCreateRequest {}

export interface VacunaListParams {
  page?: number;
  per_page?: number;
  search?: string;
  activo?: boolean;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
}
