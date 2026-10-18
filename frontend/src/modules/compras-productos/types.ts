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
  proveedor_id: number;
  proveedor_razon_social?: string | null;
  proveedor_nit?: string | null;
  creador_nombre?: string | null;
  autorizador_nombre?: string | null;
  observacion_estado?: string | null;
  detalles?: OrdenCompraProductoDetalle[];
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
