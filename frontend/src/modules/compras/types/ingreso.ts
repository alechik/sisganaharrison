export interface IngresoDetalle {
  id?: number;
  animal_id: number;
  animal_codigo?: string | null;
  arete?: string | null;
  sexo?: "M" | "H" | null;
  color?: string | null;
  raza_nombre?: string | null;
  categoria_codigo?: string | null;
  categoria_nombre?: string | null;
  edad?: number | null;
  peso_oc: number;
  peso_ingreso: number;
  precio_compra: number;
  observaciones?: string | null;
}

export interface Ingreso {
  id: number;
  codigo: string;
  fecha_ingreso: string;
  estado: string;
  observaciones?: string | null;
  descuento: number;
  total_peso: number | null;
  monto_total: number;
  tipo_ingreso_id: number;
  tipo_ingreso_nombre?: string | null;
  tipo_ingreso_codigo?: string | null;
  proveedor_id: number | null;
  proveedor_razon_social?: string | null;
  proveedor_nit?: string | null;
  user_id: number;
  creador_nombre?: string | null;
  cuarentena_id?: number | null;
  cuarentena_codigo?: string | null;
  lote_id: number;
  lote_nombre?: string | null;
  grupo_id?: number | null;
  grupo_nombre?: string | null;
  lote_codigo?: string | null;
  cantidad_total?: number;
  detalles?: IngresoDetalle[];
  created_at?: string | null;
  updated_at?: string | null;
}

export interface IngresoDetalleRequest {
  arete: string;
  sexo: "M" | "H";
  edad: number;
  peso_ingreso: number;
  precio_compra?: number;
  categoria_id: number;
  raza_id: number;
  color?: string | null;
  observaciones?: string | null;
  castrado?: boolean;
}

export interface IngresoCreateRequest {
  tipo_ingreso_id: number;
  proveedor_id?: number | null;
  lote_id: number;
  grupo_id: number;
  fecha_ingreso: string;
  observaciones?: string | null;
  descuento?: number;
  detalles: IngresoDetalleRequest[];
}

export interface IngresoExcelFila {
  linea: number;
  arete: string;
  sexo: "M" | "H" | null;
  edad: number | null;
  peso_ingreso: number | null;
  precio_compra: number;
  categoria: string;
  categoria_id: number | null;
  categoria_nombre?: string | null;
  raza: string;
  raza_id: number | null;
  raza_nombre?: string | null;
  color?: string | null;
  observaciones?: string | null;
  castrado: boolean;
  errores: string[];
  valida: boolean;
}

export interface IngresoExcelPreview {
  filas: IngresoExcelFila[];
  validas: number;
  con_errores: number;
}

export interface IngresoListParams {
  page?: number;
  per_page?: number;
  codigo?: string;
  proveedor_id?: number;
  tipo_ingreso_id?: number;
  cuarentena_id?: number;
  lote_id?: number;
  fecha?: string;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
}
