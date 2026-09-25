export interface SalidaDetalle {
  id?: number;
  animal_id: number;
  animal_codigo?: string | null;
  animal_arete?: string | null;
  sexo?: "M" | "H" | null;
  categoria_codigo?: string | null;
  categoria_nombre?: string | null;
  lote_id?: number | null;
  lote_nombre?: string | null;
  potrero_nombre?: string | null;
  cantidad: number;
  peso: number;
  precio: number;
  descuento: number;
  subtotal: number;
}

export interface Salida {
  id: number;
  codigo: string;
  fecha_salida: string;
  estado: string;
  descuento: number;
  total_peso: number | null;
  monto_total: number;
  cliente_id: number | null;
  cliente_razon_social?: string | null;
  tipo_salida_id: number;
  tipo_salida_nombre?: string | null;
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
  precio: number;
  descuento?: number;
}

export interface SalidaCreateRequest {
  tipo_salida_id: number;
  fecha_salida: string;
  cliente_id?: number | null;
  venta_id?: number | null;
  descuento?: number;
  detalles: SalidaDetalleRequest[];
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

export interface VentaDisponibleSalida {
  id: number;
  cod_venta: string;
  fecha_venta: string;
  cliente_id: number;
  cliente_razon_social?: string | null;
}
