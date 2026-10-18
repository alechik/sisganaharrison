export interface Medicamento {
  id: number;
  presentacion_id: number;
  presentacion_descripcion?: string | null;
  subcategoria_producto_id: number | null;
  subcategoria_nombre?: string | null;
  categoria_producto_id?: number | null;
  categoria_producto_nombre?: string | null;
  codigo: string;
  nombre: string;
  laboratorio: string | null;
  precio: number;
  descripcion: string;
  activo: boolean;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
}

export interface MedicamentoCreateRequest {
  presentacion_id: number;
  subcategoria_producto_id: number;
  codigo: string;
  nombre: string;
  laboratorio?: string | null;
  precio: number;
  descripcion: string;
}

export interface MedicamentoUpdateRequest extends MedicamentoCreateRequest {}

export interface MedicamentoListParams {
  page?: number;
  per_page?: number;
  search?: string;
  activo?: boolean;
  presentacion_id?: number;
  subcategoria_producto_id?: number;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
}
