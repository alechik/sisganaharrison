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

export interface ServicioReproductivoNacimientoResumen {
  id: number;
  estado_nacimiento: string;
  sexo: string;
  arete: string | null;
  animal_id: number | null;
}

export interface ServicioReproductivoPartoResumen {
  id: number;
  fecha_parto: string | null;
  estado: string;
  observaciones: string | null;
  nacimiento: ServicioReproductivoNacimientoResumen | null;
}

export interface ServicioReproductivoGestacion {
  id: number;
  estado: string;
  fecha_confirmacion: string | null;
  fecha_probable_parto: string | null;
  observaciones: string | null;
  parto: ServicioReproductivoPartoResumen | null;
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
  gestacion?: ServicioReproductivoGestacion | null;
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

export interface ConfirmarGestacionRequest {
  fecha_confirmacion: string;
  fecha_probable_parto?: string | null;
  observaciones?: string | null;
}

export interface RegistrarPartoNacimientoRequest {
  fecha_parto: string;
  observaciones?: string | null;
  nacimiento: {
    sexo: string;
    peso_nacimiento?: number | null;
    estado_nacimiento: string;
    causa_muerte?: string | null;
    observaciones?: string | null;
    arete?: string | null;
    animal?: {
      arete?: string | null;
      nombre?: string | null;
      raza_id?: number | null;
      estado_productivo_id?: number | null;
      lote_id?: number | null;
      grupo_id?: number | null;
      color?: string | null;
      observaciones?: string | null;
    } | null;
  };
}

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
