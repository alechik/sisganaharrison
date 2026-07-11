export interface Lote {
  id: number;
  potrero_id: number;
  potrero_nombre?: string | null;
  codigo: string;
  nombre: string;
  capacidad_animales: number;
  area_ha: number | null;
  observaciones: string | null;
  activo: boolean;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
}

export interface LoteCreateRequest {
  potrero_id: number;
  codigo: string;
  nombre: string;
  capacidad_animales?: number;
  area_ha?: number | null;
  observaciones?: string | null;
}

export interface LoteUpdateRequest extends LoteCreateRequest {}

export interface LoteListParams {
  page?: number;
  per_page?: number;
  search?: string;
  potrero_id?: number;
  activo?: boolean;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
}
