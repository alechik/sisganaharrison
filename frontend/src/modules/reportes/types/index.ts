import { ReporteTipo } from "../constants";

export interface ReporteFiltros {
  tipo: ReporteTipo;
  desde: string;
  hasta: string;
  sexo: string;
  raza_id: string;
  categoria_id: string;
  estado_productivo_id: string;
  lote_id: string;
  estado: string;
  tipo_evento_id: string;
  animal_id: string;
  page: number;
}

export interface ReportePar {
  etiqueta: string;
  valor: string;
}

export interface ReporteGrupo {
  titulo: string;
  filas: { etiqueta: string; total: string }[];
}

export interface ReporteDetalleMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
  truncado: boolean;
}

export interface Reporte {
  tipo: ReporteTipo;
  titulo: string;
  generado_en: string;
  filtros: ReportePar[];
  totales: ReportePar[];
  grupos: ReporteGrupo[];
  detalle: {
    columnas: string[];
    filas: string[][];
    meta: ReporteDetalleMeta;
  };
}
