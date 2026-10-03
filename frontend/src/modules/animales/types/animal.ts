export interface Animal {
  id: number;
  codigo: string;
  arete: string | null;
  nombre: string | null;
  sexo: "M" | "H";
  fecha_nacimiento: string | null;
  raza_id: number | null;
  raza_nombre?: string | null;
  categoria_id: number;
  categoria_codigo?: string | null;
  categoria_nombre?: string | null;
  estado_productivo_id: number | null;
  estado_productivo_nombre?: string | null;
  lote_id: number | null;
  lote_nombre?: string | null;
  madre_id: number | null;
  madre_nombre?: string | null;
  padre_id: number | null;
  padre_nombre?: string | null;
  color: string | null;
  observaciones: string | null;
  user_id?: number | null;
  edad_inicial?: number | null;
  edad_actual?: number | null;
  precio_kilo?: number | null;
  estado?: string | null;
  activo: boolean;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
}

export interface AnimalCreateRequest {
  codigo?: string | null;
  arete?: string | null;
  nombre?: string | null;
  sexo: "M" | "H";
  fecha_nacimiento?: string | null;
  raza_id?: number | null;
  categoria_id: number;
  estado_productivo_id?: number | null;
  lote_id?: number | null;
  madre_id?: number | null;
  padre_id?: number | null;
  color?: string | null;
  observaciones?: string | null;
  edad_inicial?: number | null;
  edad_actual?: number | null;
}

export interface AnimalUpdateRequest extends AnimalCreateRequest {}

export interface AnimalListParams {
  page?: number;
  per_page?: number;
  search?: string;
  raza_id?: number;
  categoria_id?: number;
  estado_productivo_id?: number;
  lote_id?: number;
  sexo?: "M" | "H";
  activo?: boolean;
  con_arete?: boolean;
  incluir_id?: number;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
}

export const ANIMAL_HISTORIAL_TIPOS = [
  "INGRESO",
  "NACIMIENTO",
  "PESAJE",
  "SANITARIO",
  "SERVICIO",
  "GESTACION",
  "PARTO",
  "TRASPASO",
  "VENTA_RESERVA",
  "LIBERACION_VENTA",
  "SALIDA",
  "OTRO",
] as const;

export type AnimalHistorialTipo = (typeof ANIMAL_HISTORIAL_TIPOS)[number];

export interface AnimalHistorialReferencia {
  modulo: string;
  id: number;
}

export interface AnimalHistorialItem {
  id: string;
  tipo: AnimalHistorialTipo;
  fecha: string;
  titulo: string;
  descripcion: string | null;
  detalle: Record<string, unknown>;
  referencia: AnimalHistorialReferencia;
}

export interface AnimalHistorialFilters {
  tipo?: AnimalHistorialTipo[];
  desde?: string;
  hasta?: string;
  page?: number;
  per_page?: number;
}

export interface AnimalHistorialResponse {
  data: AnimalHistorialItem[];
  meta: {
    total: number;
    animal: {
      id: number;
      codigo: string;
      arete: string | null;
    };
  };
}
