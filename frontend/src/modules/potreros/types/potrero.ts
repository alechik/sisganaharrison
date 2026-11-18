export interface Potrero {
  id: number;
  parcela_id: number;
  parcela_nombre?: string | null;
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

export interface PotreroCreateRequest {
  parcela_id: number;
  codigo: string;
  nombre: string;
  capacidad_animales?: number;
  area_ha?: number | null;
  observaciones?: string | null;
}

export interface PotreroUpdateRequest extends PotreroCreateRequest {}

export interface PotreroListParams {
  page?: number;
  per_page?: number;
  search?: string;
  parcela_id?: number;
  activo?: boolean;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
}
