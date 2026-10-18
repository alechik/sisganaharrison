export interface ServicioReproductivoInsumo {
  id?: number;
  medicamento_id: number;
  producto_codigo?: string | null;
  producto_nombre?: string | null;
  almacen_id: number;
  almacen_nombre?: string | null;
  precio?: number;
  cantidad: number;
}

export interface ServicioReproductivo {
  id: number;
  codigo_servicio?: string | null;
  user_id?: number | null;
  usuario_nombre?: string | null;
  hembra_id: number;
  hembra_codigo?: string | null;
  hembra_arete?: string | null;
  macho_id: number | null;
  macho_codigo?: string | null;
  macho_arete?: string | null;
  fecha_servicio: string;
  tipo_servicio: string;
  resultado: string | null;
  observaciones: string | null;
  total?: number;
  inventario_aplicado_at?: string | null;
  insumos?: ServicioReproductivoInsumo[];
  created_at?: string | null;
  updated_at?: string | null;
}

export interface ServicioReproductivoCreateRequest {
  hembra_id: number;
  macho_id?: number | null;
  fecha_servicio: string;
  tipo_servicio: string;
  resultado?: string | null;
  observaciones?: string | null;
  insumos?: Array<{
    medicamento_id: number;
    almacen_id: number;
    cantidad: number;
  }>;
}

export interface ServicioReproductivoUpdateRequest extends ServicioReproductivoCreateRequest {}

export interface ServicioReproductivoListParams {
  page?: number;
  per_page?: number;
  search?: string;
  hembra_id?: number;
  macho_id?: number;
  tipo_servicio?: string;
  resultado?: string;
  sin_gestacion?: boolean;
  incluir_id?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
}
