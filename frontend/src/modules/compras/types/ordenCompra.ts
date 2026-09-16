export interface OrdenCompraDetalle {
  id?: number;
  categoria_animal_id: number;
  categoria_nombre?: string | null;
  categoria_codigo?: string | null;
  cantidad: number;
  peso: number;
  edad?: number | null;
  precio: number;
  descuento: number;
  subtotal: number;
  animal_id?: number | null;
  animal_codigo?: string | null;
  sexo?: "M" | "H" | null;
}

export interface OrdenCompra {
  id: number;
  cod_compra: string;
  fecha: string;
  estado: string;
  descuento: number;
  total_peso: number | null;
  monto_total: number;
  proveedor_id: number;
  proveedor_razon_social?: string | null;
  proveedor_nit?: string | null;
  user_id: number;
  creador_nombre?: string | null;
  autorizado_por: number | null;
  autorizador_nombre?: string | null;
  fecha_decision?: string | null;
  observacion_estado?: string | null;
  cantidad_total?: number;
  cuarentena_id?: number | null;
  cuarentena_estado?: string | null;
  detalles?: OrdenCompraDetalle[];
  created_at?: string | null;
  updated_at?: string | null;
}

export interface OrdenCompraDetalleRequest {
  categoria_animal_id: number;
  sexo: "M" | "H" | "";
  animal_id?: number | null;
  animal_codigo?: string | null;
  cantidad: number;
  peso: number;
  edad?: number | null;
  precio: number;
  descuento?: number;
}

export interface OrdenCompraCreateRequest {
  proveedor_id: number;
  fecha: string;
  descuento?: number;
  detalles: OrdenCompraDetalleRequest[];
}

export interface OrdenCompraListParams {
  page?: number;
  per_page?: number;
  cod_compra?: string;
  proveedor_id?: number;
  user_id?: number;
  estado?: string;
  fecha?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
}
