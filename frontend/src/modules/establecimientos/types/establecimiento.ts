export interface Establecimiento {
  id: number;
  codigo: string;
  nombre: string;
  propietario: string | null;
  telefono: string | null;
  direccion: string | null;
  municipio: string | null;
  departamento: string | null;
  pais: string;
  area_total_ha: number | null;
  descripcion: string | null;
  activo: boolean;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
}

export interface EstablecimientoCreateRequest {
  codigo: string;
  nombre: string;
  propietario?: string | null;
  telefono?: string | null;
  direccion?: string | null;
  municipio?: string | null;
  departamento?: string | null;
  pais?: string | null;
  area_total_ha?: number | null;
  descripcion?: string | null;
}

export interface EstablecimientoUpdateRequest extends EstablecimientoCreateRequest {}

export interface EstablecimientoListParams {
  page?: number;
  per_page?: number;
  search?: string;
  activo?: boolean;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
}
