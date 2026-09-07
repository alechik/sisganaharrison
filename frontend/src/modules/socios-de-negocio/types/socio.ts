export interface TipoPersona {
  id: number;
  nombre: string;
  protegido?: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface Socio {
  id: number;
  razon_social: string;
  responsable: string | null;
  email: string | null;
  fecha_nacimiento: string | null;
  ci: number | null;
  nit: string | null;
  celular: number | null;
  estado_civil: string | null;
  sexo: string | null;
  direccion: string | null;
  estado: string;
  fecha_reg: string | null;
  user_id: number;
  registrado_por_nombre?: string | null;
  tipos?: TipoPersona[];
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
}

export interface SocioCreateRequest {
  razon_social: string;
  responsable?: string | null;
  email?: string | null;
  fecha_nacimiento?: string | null;
  ci?: number | null;
  nit?: string | null;
  celular?: number | null;
  estado_civil?: string | null;
  sexo?: string | null;
  direccion?: string | null;
  tipo_ids: number[];
}

export interface SocioUpdateRequest extends SocioCreateRequest {}

export interface SocioListParams {
  page?: number;
  per_page?: number;
  search?: string;
  estado?: boolean | string;
  tipo?: string;
  tipo_id?: number;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
}

export interface TipoPersonaCreateRequest {
  nombre: string;
}

export interface TipoPersonaListParams {
  page?: number;
  per_page?: number;
  search?: string;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
  all?: boolean;
}
