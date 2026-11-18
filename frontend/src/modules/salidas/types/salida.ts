export interface SalidaDetalle {
  id?: number;
  animal_id: number;
  animal_codigo?: string | null;
  animal_arete?: string | null;
  sexo?: "M" | "H" | null;
  categoria_codigo?: string | null;
  categoria_nombre?: string | null;
  potrero_id?: number | null;
  potrero_nombre?: string | null;
  parcela_nombre?: string | null;
  grupo_id?: number | null;
  grupo_nombre?: string | null;
  cantidad: number;
  peso: number;
  precio: number;
  descuento: number;
  subtotal: number;
  observaciones?: string | null;
}

export interface Salida {
  id: number;
  codigo: string;
  fecha_salida: string;
  estado: string;
  descuento: number;
  total_peso: number | null;
  monto_total: number;
  observaciones?: string | null;
  cliente_id: number | null;
  cliente_razon_social?: string | null;
  tipo_salida_id: number;
  tipo_salida_nombre?: string | null;
  tipo_salida_codigo?: string | null;
  venta_id: number | null;
  cod_venta?: string | null;
  user_id: number;
  creador_nombre?: string | null;
  cantidad_total?: number;
  detalles?: SalidaDetalle[];
  created_at?: string | null;
  updated_at?: string | null;
}

export interface SalidaDetalleRequest {
  animal_id: number;
  peso: number;
  precio?: number;
  descuento?: number;
  observaciones?: string | null;
}

export interface SalidaCreateRequest {
  tipo_salida_id: number;
  fecha_salida: string;
  cliente_id?: number | null;
  descuento?: number;
  observaciones?: string | null;
  detalles: SalidaDetalleRequest[];
}

export interface AnimalDisponibleSalida {
  id: number;
  codigo: string;
  arete: string | null;
  sexo: "M" | "H";
  estado: string;
  edad_meses?: number | null;
  categoria_id: number;
  categoria_codigo?: string | null;
  categoria_nombre?: string | null;
  potrero_id: number | null;
  potrero_nombre?: string | null;
  grupo_id?: number | null;
  grupo_nombre?: string | null;
  parcela_id?: number | null;
  parcela_nombre?: string | null;
  peso?: number | null;
  precio_kilo?: number | null;
}

export interface SalidaExcelFila {
  linea: number;
  codigo_arete: string;
  precio: number;
  animal_id: number | null;
  animal_codigo?: string | null;
  sexo?: "M" | "H" | null;
  edad_meses?: number | null;
  peso?: number | null;
  categoria_id?: number | null;
  categoria_codigo?: string | null;
  categoria_nombre?: string | null;
  potrero_id?: number | null;
  potrero_nombre?: string | null;
  grupo_id?: number | null;
  grupo_nombre?: string | null;
  parcela_nombre?: string | null;
  errores: string[];
  valida: boolean;
}

export interface SalidaExcelPreview {
  filas: SalidaExcelFila[];
  validas: number;
  con_errores: number;
}

export interface SalidaListParams {
  page?: number;
  per_page?: number;
  codigo?: string;
  cliente?: string;
  tipo_salida_id?: number;
  estado?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
}
