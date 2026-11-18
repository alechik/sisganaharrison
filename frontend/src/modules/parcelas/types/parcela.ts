export interface Parcela {
  id: number;
  estancia_id: number;
  estancia_nombre?: string | null;
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

export interface ParcelaCreateRequest {
  estancia_id: number;
  codigo: string;
  nombre: string;
  area_ha?: number | null;
  tipo_pasto?: string | null;
  disponibilidad?: boolean;
  descripcion?: string | null;
}

export interface ParcelaUpdateRequest extends ParcelaCreateRequest {}

export interface ParcelaListParams {
  page?: number;
  per_page?: number;
  search?: string;
  estancia_id?: number;
  activo?: boolean;
  disponibilidad?: boolean;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
}
