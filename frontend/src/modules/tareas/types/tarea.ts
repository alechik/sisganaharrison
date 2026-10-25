export type TareaEstado = "EMITIDO" | "PENDIENTE" | "TERMINADO";
export type TareaVista = "SI" | "NO";

export interface TareaUsuario {
  id: number;
  nombre: string;
}

export interface Tarea {
  id: number;
  codigo_tarea: string;
  indicacion: string;
  respuesta_indicacion: string | null;
  estado: TareaEstado;
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
  vista?: TareaVista;
  user_gerencia_id: number;
  user_trabajador_id: number;
  gerencia?: TareaUsuario | null;
  trabajador?: TareaUsuario | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface TareaCreateRequest {
  user_trabajador_id: number;
  indicacion: string;
}

export interface TareaUpdateRequest {
  respuesta_indicacion: string;
}

export interface TareaListParams {
  page?: number;
  per_page?: number;
  search?: string;
  estado?: TareaEstado;
  user_trabajador_id?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
}
