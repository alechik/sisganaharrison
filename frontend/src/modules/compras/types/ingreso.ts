export interface AnimalIngresoPayload {
  arete?: string | null;
  nombre?: string | null;
  fecha_nacimiento?: string | null;
  raza_id?: number | null;
  estado_productivo_id?: number | null;
  madre_id?: number | null;
  padre_id?: number | null;
  color?: string | null;
  observaciones?: string | null;
  edad_inicial?: number | null;
  edad_actual?: number | null;
}

export interface IngresoDetalle {
  id?: number;
  animal_id: number;
  animal_codigo?: string | null;
  sexo?: "M" | "H" | null;
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
  proveedor_id: number;
  proveedor_razon_social?: string | null;
  proveedor_nit?: string | null;
  user_id: number;
  creador_nombre?: string | null;
  cuarentena_id: number;
  cuarentena_codigo?: string | null;
  lote_id: number;
  lote_nombre?: string | null;
  lote_codigo?: string | null;
  cantidad_total?: number;
  detalles?: IngresoDetalle[];
  created_at?: string | null;
  updated_at?: string | null;
}

export interface IngresoPendienteLinea {
  cuarentena_detalle_id: number;
  animal_id: number;
  animal_codigo?: string | null;
  sexo?: "M" | "H" | null;
  categoria_id: number;
  categoria_codigo?: string | null;
  categoria_nombre?: string | null;
  edad?: number | null;
  peso_oc: number;
  precio_compra: number;
  animal?: AnimalIngresoPayload & {
    id: number;
    codigo: string;
    sexo: "M" | "H";
    categoria_id: number;
    lote_id?: number | null;
  } | null;
}

export interface IngresoPendientes {
  cuarentena_id: number;
  cod_compra: string;
  origen: string;
  estado: string;
  proveedor_id: number;
  proveedor_razon_social?: string | null;
  proveedor_nit?: string | null;
  orden_compra_id: number | null;
  orden_compra_codigo?: string | null;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  animales_total: number;
  animales_ingresados: number;
  animales_pendientes: number;
  detalles: IngresoPendienteLinea[];
}

export interface IngresoDetalleRequest {
  animal_id: number;
  peso_ingreso: number;
  observaciones?: string | null;
  animal?: AnimalIngresoPayload;
}

export interface IngresoCreateRequest {
  cuarentena_id: number;
  lote_id: number;
  fecha_ingreso: string;
  observaciones?: string | null;
  descuento?: number;
  detalles: IngresoDetalleRequest[];
}

export interface IngresoListParams {
  page?: number;
  per_page?: number;
  codigo?: string;
  proveedor_id?: number;
  cuarentena_id?: number;
  lote_id?: number;
  fecha?: string;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
}
