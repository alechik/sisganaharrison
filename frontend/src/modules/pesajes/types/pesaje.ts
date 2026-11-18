export interface PesajeDetalle {
  id?: number;
  animal_id: number;
  animal_codigo?: string | null;
  animal_arete?: string | null;
  potrero_id?: number | null;
  potrero_nombre?: string | null;
  parcela_nombre?: string | null;
  peso: number;
}

export interface Pesaje {
  id: number;
  codigo_pesaje: string;
  fecha_pesaje: string;
  total_peso: number;
  observacion: string | null;
  user_id: number;
  usuario_nombre?: string | null;
  cantidad_animales?: number;
  es_nacimiento?: boolean;
  es_ingreso?: boolean;
  detalles?: PesajeDetalle[];
  created_at?: string | null;
  updated_at?: string | null;
}

export interface PesajeDetalleRequest {
  animal_id: number;
  peso: number;
}

export interface PesajeCreateRequest {
  fecha_pesaje: string;
  observacion?: string | null;
  detalles: PesajeDetalleRequest[];
}

export interface AnimalDisponiblePesaje {
  id: number;
  codigo: string;
  arete: string | null;
  sexo?: "M" | "H" | null;
  estado?: string;
  potrero_id?: number | null;
  potrero_nombre?: string | null;
  parcela_id?: number | null;
  parcela_nombre?: string | null;
  peso?: number | null;
}

export interface PesajeExcelFila {
  linea: number;
  codigo_arete: string;
  peso_kg: number | null;
  animal_id: number | null;
  animal_codigo?: string | null;
  potrero_id?: number | null;
  potrero_nombre?: string | null;
  parcela_nombre?: string | null;
  errores: string[];
  valida: boolean;
}

export interface PesajeExcelPreview {
  filas: PesajeExcelFila[];
  validas: number;
  con_errores: number;
}

export interface PesajeListParams {
  page?: number;
  per_page?: number;
  search?: string;
  animal_id?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
}
