import { INGRESO_PRODUCTO_DEFAULT_PAGE_SIZE, ORDEN_PRODUCTO_DEFAULT_PAGE_SIZE } from "../constants";
import {
  IngresoProductoFilters,
  IngresoProductoSortDirection,
  IngresoProductoSortField,
  OrdenProductoFilters,
  OrdenProductoSortDirection,
  OrdenProductoSortField,
} from "../types";

export { formatMoney } from "@/utils/formatMoney";

export const defaultOrdenProductoFilters = (): OrdenProductoFilters => ({
  cod_compra: "",
  proveedor_id: undefined,
  user_id: undefined,
  estado: undefined,
  fecha: "",
  sort_by: "created_at" as OrdenProductoSortField,
  sort_dir: "desc" as OrdenProductoSortDirection,
  page: 1,
  per_page: ORDEN_PRODUCTO_DEFAULT_PAGE_SIZE,
});

export const formatDate = (value?: string | null): string => {
  if (!value) {
    return "—";
  }
  return new Date(`${value}T00:00:00`).toLocaleDateString("es-PY");
};

export const getEstadoLabel = (value?: string | null): string => {
  const labels: Record<string, string> = {
    PENDIENTE: "Pendiente",
    AUTORIZADO: "Autorizado",
    CANCELADO: "Cancelado",
  };
  return value ? labels[value] ?? value : "—";
};

export const isPendiente = (estado?: string | null): boolean => estado === "PENDIENTE";

export const isAutorizado = (estado?: string | null): boolean => estado === "AUTORIZADO";

export const defaultIngresoProductoFilters = (): IngresoProductoFilters => ({
  cod_ingreso: "",
  orden_compra_id: undefined,
  proveedor_id: undefined,
  almacen_id: undefined,
  fecha: "",
  sort_by: "created_at" as IngresoProductoSortField,
  sort_dir: "desc" as IngresoProductoSortDirection,
  page: 1,
  per_page: INGRESO_PRODUCTO_DEFAULT_PAGE_SIZE,
});
