export interface Potrero {
  id: number;
  establecimiento_id: number;
  establecimiento_nombre?: string | null;
  codigo: string;
  nombre: string;
  area_ha: number | null;
  tipo_pasto: string | null;
  disponibilidad: boolean;
  descripcion: string | null;
  activo: boolean;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
}

export interface PotreroCreateRequest {
  establecimiento_id: number;
  codigo: string;
  nombre: string;
  area_ha?: number | null;
  tipo_pasto?: string | null;
  disponibilidad?: boolean;
  descripcion?: string | null;
}

export interface PotreroUpdateRequest extends PotreroCreateRequest {}

export interface PotreroListParams {
  page?: number;
  per_page?: number;
  search?: string;
  establecimiento_id?: number;
  activo?: boolean;
  disponibilidad?: boolean;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
}
