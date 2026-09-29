export interface NamedCount {
  label: string;
  total: number;
}

export interface PesoMensual {
  mes: string;
  promedio_kg: number;
  registros: number;
}

export interface LoteOcupacion {
  codigo: string;
  nombre: string;
  capacidad: number;
  ocupacion: number;
  pct: number | null;
}

export interface PendienteItem {
  tipo: string;
  titulo: string;
  total: number;
  nivel: "info" | "warning" | "error";
}

export interface ActividadItem {
  tipo: string;
  referencia: string;
  fecha: string;
}

export interface DashboardData {
  kpis: {
    hato_actual: number;
    animales_activos: number;
    animales_enfermos: number;
    establecimientos: number;
    potreros: number;
    lotes: number;
    ocupacion_lotes_pct: number | null;
    gestaciones_activas: number;
    ventas_pendientes: number;
    ordenes_pendientes: number;
  };
  nucleo: {
    sexo: NamedCount[];
    categorias: NamedCount[];
    estados_productivos: NamedCount[];
    estados_operativos: NamedCount[];
  };
  infraestructura: {
    capacidad_total: number;
    ocupacion_total: number;
    lotes_sobrecupo: number;
    lotes: LoteOcupacion[];
  };
  produccion: {
    peso_promedio_mensual: PesoMensual[];
    pesajes_30d: number;
  };
  sanidad_reproduccion: {
    eventos_30d: number;
    eventos_por_tipo: NamedCount[];
    servicios_pendientes: number;
    gestaciones_activas: number;
    gestaciones_parto_proximo: number;
    partos_pendientes: number;
    nacimientos_30d_vivos: number;
    nacimientos_30d_muertos: number;
  };
  movimientos: {
    ordenes_pendientes: number;
    cuarentenas_en_proceso: number;
    ingresos_30d: number;
    ventas_pendientes: number;
    salidas_30d: number;
    traspasos_30d: number;
  };
  pendientes: PendienteItem[];
  actividad_reciente: ActividadItem[];
}
