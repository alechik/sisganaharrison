export interface DetalleEventoSanitario {
  id?: number;
  animal_id: number;
  animal_codigo?: string | null;
  animal_arete?: string | null;
  lote_id: number | null;
  lote_nombre?: string | null;
  medicamento_id: number;
  medicamento_codigo?: string | null;
  medicamento_nombre?: string | null;
  presentacion_descripcion?: string | null;
  peso_animal: number;
  precio_medicamento: number;
}

export interface EventoSanitario {
  id: number;
  tipo_evento_id: number;
  tipo_evento_nombre?: string | null;
  tipo_evento_codigo?: string | null;
  user_id?: number | null;
  usuario_nombre?: string | null;
  fecha: string;
  diagnostico: string | null;
  tratamiento: string | null;
  total: number;
  observaciones: string | null;
  cantidad_animales?: number;
  detalles?: DetalleEventoSanitario[];
  created_at?: string | null;
  updated_at?: string | null;
}

export interface EventoSanitarioDetalleRequest {
  animal_id: number;
  medicamento_id: number;
}

export interface EventoSanitarioCreateRequest {
  tipo_evento_id: number;
  fecha: string;
  diagnostico?: string | null;
  tratamiento?: string | null;
  observaciones?: string | null;
  detalles: EventoSanitarioDetalleRequest[];
}

export interface EventoSanitarioListParams {
  page?: number;
  per_page?: number;
  search?: string;
  animal_id?: number;
  tipo_evento_id?: number;
  medicamento_id?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
}
