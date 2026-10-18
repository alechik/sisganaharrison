export interface OrdenCompraProductoDetalle {
  id?: number;
  medicamento_id: number;
  producto_codigo?: string | null;
  producto_nombre?: string | null;
  cantidad: number;
  precio: number;
  descuento: number;
  subtotal: number;
}

export interface OrdenCompraProducto {
  id: number;
  cod_compra: string;
  fecha: string;
  estado: string;
  descuento: number;
  monto_total: number;
  cantidad_total?: number;
  proveedor_id: number;
  proveedor_razon_social?: string | null;
  proveedor_nit?: string | null;
  user_id?: number;
  creador_nombre?: string | null;
  autorizado_por?: number | null;
  autorizador_nombre?: string | null;
  fecha_decision?: string | null;
  observacion_estado?: string | null;
  detalles?: OrdenCompraProductoDetalle[];
  created_at?: string | null;
}

export interface OrdenCompraProductoDetalleRequest {
  medicamento_id: number;
  cantidad: number;
  precio: number;
  descuento?: number;
}

export interface OrdenCompraProductoCreateRequest {
  proveedor_id: number;
  fecha: string;
  descuento?: number;
  detalles: OrdenCompraProductoDetalleRequest[];
}

export interface OrdenCompraProductoListParams {
  page?: number;
  per_page?: number;
  search?: string;
  cod_compra?: string;
  proveedor_id?: number;
  user_id?: number;
  estado?: string;
  fecha?: string;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
}

export type OrdenProductoSortField =
  | "created_at"
  | "fecha"
  | "cod_compra"
  | "monto_total"
  | "estado";
export type OrdenProductoSortDirection = "asc" | "desc";

export interface OrdenProductoFilters extends OrdenCompraProductoListParams {
  sort_by: OrdenProductoSortField;
  sort_dir: OrdenProductoSortDirection;
}

export interface IngresoProducto {
  id: number;
  orden_compra_id: number;
  orden_cod_compra?: string | null;
  cod_ingreso: string;
  fecha: string;
  descuento: number;
  monto_total: number;
  almacen_id: number;
  almacen_nombre?: string | null;
  proveedor_razon_social?: string | null;
  detalles?: OrdenCompraProductoDetalle[];
}
