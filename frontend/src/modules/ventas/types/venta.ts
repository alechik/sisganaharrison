export interface VentaDetalle {
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

export interface Venta {
  id: number;
  cod_venta: string;
  fecha_venta: string;
  estado: string;
  descuento: number;
  total_peso: number | null;
  monto_total: number;
  cliente_id: number;
  cliente_razon_social?: string | null;
  cliente_nit?: string | null;
  user_id: number;
  creador_nombre?: string | null;
  autorizado_por?: number | null;
  autorizador_nombre?: string | null;
  fecha_decision?: string | null;
  observacion_estado?: string | null;
  cantidad_total?: number;
  detalles?: VentaDetalle[];
  created_at?: string | null;
  updated_at?: string | null;
}

export interface VentaDetalleRequest {
  animal_id: number;
  peso: number;
  precio: number;
  descuento?: number;
}

export interface VentaCreateRequest {
  cliente_id: number;
  fecha_venta: string;
  descuento?: number;
  detalles: VentaDetalleRequest[];
}

export interface VentaListParams {
  page?: number;
  per_page?: number;
  cod_venta?: string;
  cliente?: string;
  cliente_id?: number;
  estado?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
}

export interface AnimalDisponibleVenta {
  id: number;
  codigo: string;
  arete: string | null;
  sexo: "M" | "H";
  estado: string;
  categoria_id: number;
  categoria_codigo?: string | null;
  categoria_nombre?: string | null;
  lote_id: number | null;
  lote_nombre?: string | null;
  potrero_id?: number | null;
  potrero_nombre?: string | null;
  peso?: number | null;
  precio_kilo?: number | null;
}
