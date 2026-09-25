import { VENTA_DEFAULT_PAGE_SIZE } from "../constants";
import { VentaFilters, VentaSortDirection, VentaSortField } from "../types";

export const defaultVentaFilters = (): VentaFilters => ({
  cod_venta: "",
  cliente: "",
  estado: undefined,
  fecha_desde: "",
  fecha_hasta: "",
  sort_by: "created_at" as VentaSortField,
  sort_dir: "desc" as VentaSortDirection,
  page: 1,
  per_page: VENTA_DEFAULT_PAGE_SIZE,
});

export const formatDate = (value?: string | null): string => {
  if (!value) {
    return "—";
  }
  return new Date(`${value}T00:00:00`).toLocaleDateString("es-PY");
};

export const formatMoney = (value?: number | null): string => {
  const amount = value ?? 0;
  return new Intl.NumberFormat("es-PY", {
    style: "currency",
    currency: "PYG",
    maximumFractionDigits: 0,
  }).format(amount);
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

export const getEstadoLabel = (value?: string | null): string => {
  const labels: Record<string, string> = {
    PENDIENTE: "Pendiente",
    AUTORIZADA: "Autorizada",
    ANULADA: "Anulada",
  };
  return value ? labels[value] ?? value : "—";
};

export const isPendiente = (estado?: string | null): boolean => estado === "PENDIENTE";

export const lineSubtotal = (precio: number, descuento: number): number =>
  Math.max((precio || 0) - (descuento || 0), 0);
