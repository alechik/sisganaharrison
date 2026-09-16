import { ORDEN_COMPRA_DEFAULT_PAGE_SIZE } from "../constants";
import {
  CuarentenaFilters,
  CuarentenaSortDirection,
  CuarentenaSortField,
  OrdenCompraFilters,
  OrdenCompraSortDirection,
  OrdenCompraSortField,
} from "../types";

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
    PROCESADO: "Procesado",
    COMPLETADO: "Completado",
  };
  return value ? labels[value] ?? value : "—";
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

export const formatEdad = (value?: number | null): string => {
  if (value === null || value === undefined) {
    return "—";
  }
  return `${value} ${value === 1 ? "mes" : "meses"}`;
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

export const isPendiente = (estado?: string | null): boolean => estado === "PENDIENTE";

export const isAutorizada = (estado?: string | null): boolean => estado === "AUTORIZADA";

export const isProcesada = (estado?: string | null): boolean => estado === "PROCESADO";

export const getOrigenLabel = (value?: string | null): string => {
  const labels: Record<string, string> = {
    ORDEN_COMPRA: "Orden de Compra",
    DIRECTA: "Directa por excepción",
  };
  return value ? labels[value] ?? value : "—";
};

export const defaultCuarentenaFilters = (): CuarentenaFilters => ({
  cod_compra: "",
  proveedor_id: undefined,
  estado: undefined,
  origen: undefined,
  fecha: "",
  sort_by: "created_at" as CuarentenaSortField,
  sort_dir: "desc" as CuarentenaSortDirection,
  page: 1,
  per_page: ORDEN_COMPRA_DEFAULT_PAGE_SIZE,
});
