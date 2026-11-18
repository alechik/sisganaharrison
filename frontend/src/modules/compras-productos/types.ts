export interface OrdenCompraProductoDetalle {
  id?: number;
  producto_id: number;
  producto_codigo?: string | null;
  producto_nombre?: string | null;
  unidad?: string | null;
  cantidad: number;
  cantidad_pendiente?: number | null;
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
  producto_id: number;
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
  orden_compra_id?: number | null;
  orden_cod_compra?: string | null;
  cod_ingreso: string;
  fecha: string;
  descuento: number;
  monto_total: number;
  observaciones?: string | null;
  cantidad_total?: number;
  almacen_id: number;
  almacen_nombre?: string | null;
  proveedor_id?: number;
  proveedor_razon_social?: string | null;
  proveedor_nit?: string | null;
  creador_nombre?: string | null;
  detalles?: OrdenCompraProductoDetalle[];
}

export interface IngresoProductoCreateRequest {
  proveedor_id: number;
  almacen_id: number;
  fecha: string;
  descuento?: number;
  observaciones?: string | null;
  orden_compra_id?: number | null;
  detalles: OrdenCompraProductoDetalleRequest[];
}

export interface ProductoDisponibleIngreso {
  id: number;
  codigo: string;
  nombre: string;
  precio: number;
  presentacion_nombre?: string | null;
  presentacion_descripcion?: string | null;
}

export interface ProveedorDisponibleIngreso {
  id: number;
  codigo: string;
  razon_social: string;
  nit?: string | null;
}

export interface AlmacenDisponibleIngreso {
  id: number;
  nombre: string;
  estancia_nombre?: string | null;
  estancia_codigo?: string | null;
}

export interface IngresoProductoExcelFila {
  linea: number;
  codigo_producto: string;
  producto_id: number | null;
  producto_codigo?: string | null;
  producto_nombre?: string | null;
  unidad?: string | null;
  cantidad: number | null;
  precio: number | null;
  subtotal: number;
  errores: string[];
  valida: boolean;
}

export interface IngresoProductoExcelPreview {
  filas: IngresoProductoExcelFila[];
  validas: number;
  con_errores: number;
}

export interface IngresoProductoListParams {
  page?: number;
  per_page?: number;
  search?: string;
  cod_ingreso?: string;
  orden_compra_id?: number;
  proveedor_id?: number;
  almacen_id?: number;
  fecha?: string;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
}

export type IngresoProductoSortField = "created_at" | "fecha" | "cod_ingreso" | "monto_total";
export type IngresoProductoSortDirection = "asc" | "desc";

export interface IngresoProductoFilters extends IngresoProductoListParams {
  sort_by: IngresoProductoSortField;
  sort_dir: IngresoProductoSortDirection;
}
