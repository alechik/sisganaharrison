import { ORDEN_COMPRA_DEFAULT_PAGE_SIZE } from "../constants";
import { OrdenCompraFilters, OrdenCompraSortDirection, OrdenCompraSortField } from "../types";

export const defaultOrdenCompraFilters = (): OrdenCompraFilters => ({
  cod_compra: "",
  proveedor_id: undefined,
  user_id: undefined,
  estado: undefined,
  fecha: "",
  sort_by: "created_at" as OrdenCompraSortField,
  sort_dir: "desc" as OrdenCompraSortDirection,
  page: 1,
  per_page: ORDEN_COMPRA_DEFAULT_PAGE_SIZE,
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

export const getEstadoLabel = (value?: string | null): string => {
  const labels: Record<string, string> = {
    PENDIENTE: "Pendiente",
    AUTORIZADA: "Autorizada",
    RECHAZADA: "Rechazada",
  };
  return value ? labels[value] ?? value : "—";
};

export const isPendiente = (estado?: string | null): boolean => estado === "PENDIENTE";
