export type InformeRevisado = "SI" | "NO";

export interface InformeUsuario {
  id: number;
  nombre: string;
}

export interface InformeDiario {
  id: number;
  codigo_informe: string;
  detalle_informe: string;
  revisado: InformeRevisado;
  fecha: string;
  fecha_revision?: string | null;
  user_trabajador_id: number;
  user_revisor_id?: number | null;
  trabajador?: InformeUsuario | null;
  revisor?: InformeUsuario | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface InformeDiarioCreateRequest {
  fecha: string;
  detalle_informe: string;
}

export interface InformeDiarioUpdateRequest {
  fecha: string;
  detalle_informe: string;
}

export interface InformeDiarioListParams {
  page?: number;
  per_page?: number;
  search?: string;
  revisado?: InformeRevisado;
  user_trabajador_id?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
}

export interface InformePendiente {
  id: number;
  codigo_informe: string;
  fecha?: string | null;
  trabajador?: InformeUsuario | null;
}
