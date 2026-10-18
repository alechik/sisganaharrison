export interface StockItem {
  id: number;
  almacen_id: number;
  almacen_nombre?: string | null;
  establecimiento_nombre?: string | null;
  medicamento_id: number;
  producto_codigo?: string | null;
  producto_nombre?: string | null;
  precio?: number;
  categoria_nombre?: string | null;
  subcategoria_nombre?: string | null;
  stock: number;
}

export interface MovimientoItem {
  id: number;
  almacen_nombre?: string | null;
  producto_codigo?: string | null;
  producto_nombre?: string | null;
  tipo: string;
  cantidad: number;
  precio_unitario: number;
  origen_type: string;
  origen_id: number;
  usuario_nombre?: string | null;
  observaciones?: string | null;
  created_at?: string | null;
}
