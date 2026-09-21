export interface Nacimiento {
  id: number;
  parto_id: number;
  parto_fecha_parto?: string | null;
  parto_gestacion_estado?: string | null;
  parto_gestacion_servicio_fecha_servicio?: string | null;
  parto_gestacion_servicio_tipo_servicio?: string | null;
  parto_gestacion_servicio_hembra_codigo?: string | null;
  parto_gestacion_servicio_hembra_arete?: string | null;
  parto_gestacion_servicio_macho_codigo?: string | null;
  parto_gestacion_servicio_macho_arete?: string | null;
  animal_id: number | null;
  animal_codigo?: string | null;
  animal_arete?: string | null;
  registrado_por: number | null;
  registrado_por_nombre?: string | null;
  arete: string | null;
  sexo: string;
  peso_nacimiento: number | null;
  estado_nacimiento: string;
  causa_muerte: string | null;
  observaciones: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface NacimientoAnimalPayload {
  arete?: string | null;
  nombre?: string | null;
  raza_id?: number | null;
  estado_productivo_id?: number | null;
  lote_id?: number | null;
  color?: string | null;
  observaciones?: string | null;
}

export interface NacimientoCreateRequest {
  parto_id: number;
  arete?: string | null;
  sexo: string;
  peso_nacimiento?: number | null;
  estado_nacimiento: string;
  causa_muerte?: string | null;
  observaciones?: string | null;
  registrado_por?: number | null;
  animal?: NacimientoAnimalPayload | null;
}

export interface NacimientoUpdateRequest extends NacimientoCreateRequest {}

export interface NacimientoListParams {
  page?: number;
  per_page?: number;
  search?: string;
  parto_id?: number;
  animal_id?: number;
  estado_nacimiento?: string;
  sexo?: string;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
}
