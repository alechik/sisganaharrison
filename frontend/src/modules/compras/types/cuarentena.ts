export interface CuarentenaDetalle {
  id?: number;
  categoria_animal_id: number;
  categoria_nombre?: string | null;
  categoria_codigo?: string | null;
  cantidad: number;
  peso: number;
  edad?: number | null;
  precio: number;
  descuento: number;
  estado?: string;
  subtotal: number;
  animal_id?: number | null;
  animal_codigo?: string | null;
  sexo?: "M" | "H" | null;
}

export interface Cuarentena {
  id: number;
  cod_compra: string;
  origen: string;
  fecha_inicio: string;
  fecha_fin: string | null;
  estado: string;
  descuento: number;
  total_peso: number | null;
  monto_total: number;
  proveedor_id: number;
  proveedor_razon_social?: string | null;
  proveedor_nit?: string | null;
  user_id: number;
  creador_nombre?: string | null;
  orden_compra_id: number | null;
  orden_compra_codigo?: string | null;
  cantidad_total?: number;
  detalles?: CuarentenaDetalle[];
  created_at?: string | null;
  updated_at?: string | null;
}

export interface CuarentenaDetalleRequest {
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

export interface CuarentenaCreateRequest {
  proveedor_id: number;
  fecha_inicio: string;
  descuento?: number;
  detalles: CuarentenaDetalleRequest[];
}

export interface CuarentenaListParams {
  page?: number;
  per_page?: number;
  cod_compra?: string;
  proveedor_id?: number;
  estado?: string;
  origen?: string;
  fecha?: string;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
}
