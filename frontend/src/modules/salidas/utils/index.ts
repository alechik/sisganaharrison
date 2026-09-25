import { SALIDA_DEFAULT_PAGE_SIZE } from "../constants";
import { SalidaFilters, SalidaSortDirection, SalidaSortField } from "../types";

export const defaultSalidaFilters = (): SalidaFilters => ({
  codigo: "",
  cliente: "",
  tipo_salida_id: undefined,
  estado: undefined,
  fecha_desde: "",
  fecha_hasta: "",
  sort_by: "created_at" as SalidaSortField,
  sort_dir: "desc" as SalidaSortDirection,
  page: 1,
  per_page: SALIDA_DEFAULT_PAGE_SIZE,
});

export const formatDate = (value?: string | null): string => {
  if (!value) {
    return "—";
  }
  return new Date(`${value}T00:00:00`).toLocaleDateString("es-PY");
};

export const formatMoney = (value?: number | null): string => {
  return new Intl.NumberFormat("es-PY", {
    style: "currency",
    currency: "PYG",
    maximumFractionDigits: 0,
  }).format(value ?? 0);
};

export const formatPeso = (value?: number | null): string => {
  if (value === null || value === undefined) {
    return "—";
  }
  return `${new Intl.NumberFormat("es-PY", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)} kg`;
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

export const isTipoVenta = (nombre?: string | null): boolean =>
  (nombre ?? "").trim().toLowerCase() === "venta";

export const lineSubtotal = (precio: number, descuento: number): number =>
  Math.max((precio || 0) - (descuento || 0), 0);
