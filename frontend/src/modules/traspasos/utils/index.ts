import { TRASPASO_DEFAULT_PAGE_SIZE } from "../constants";
import { TraspasoFilters, TraspasoSortDirection, TraspasoSortField } from "../types";

export const defaultTraspasoFilters = (): TraspasoFilters => ({
  search: "",
  lote_salida_id: undefined,
  lote_ingreso_id: undefined,
  fecha_desde: "",
  fecha_hasta: "",
  sort_by: "fecha_traspaso" as TraspasoSortField,
  sort_dir: "desc" as TraspasoSortDirection,
  page: 1,
  per_page: TRASPASO_DEFAULT_PAGE_SIZE,
});

export const formatDate = (value?: string | null): string => {
  if (!value) {
    return "—";
  }
  return new Date(`${value}T00:00:00`).toLocaleDateString("es-PY");
};

export const formatMoney = (value?: number | null): string =>
  (value ?? 0).toLocaleString("es-PY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const formatPeso = (value?: number | null): string => {
  if (value === null || value === undefined) {
    return "—";
  }
  return `${formatMoney(value)} kg`;
};

export const formatSexo = (sexo?: string | null): string => {
  if (sexo === "M") {
    return "Macho";
  }
  if (sexo === "H") {
    return "Hembra";
  }
  return "—";
};

export const lineSubtotal = (peso: number, precio: number): number =>
  Math.round((Number(peso) || 0) * (Number(precio) || 0) * 100) / 100;

export const loteLabel = (codigo?: string | null, nombre?: string | null): string => {
  if (codigo && nombre) {
    return `${codigo} — ${nombre}`;
  }
  return nombre || codigo || "—";
};
