import { SOCIO_DEFAULT_PAGE_SIZE } from "../constants";
import {
  SocioFilters,
  SocioSortDirection,
  SocioSortField,
  TipoPersonaFilters,
  TipoPersonaSortField,
} from "../types";

export const defaultSocioFilters = (): SocioFilters => ({
  search: "",
  documento: "",
  estado: undefined,
  tipo: undefined,
  tipo_id: undefined,
  sort_by: "razon_social" as SocioSortField,
  sort_dir: "asc" as SocioSortDirection,
  page: 1,
  per_page: SOCIO_DEFAULT_PAGE_SIZE,
});

export const defaultTipoPersonaFilters = (): TipoPersonaFilters => ({
  search: "",
  sort_by: "nombre" as TipoPersonaSortField,
  sort_dir: "asc" as SocioSortDirection,
  page: 1,
  per_page: SOCIO_DEFAULT_PAGE_SIZE,
});

export const formatDate = (value?: string | null): string => {
  if (!value) {
    return "—";
  }
  return new Date(`${value}T00:00:00`).toLocaleDateString("es-PY");
};

export const getSexoLabel = (value?: string | null): string => {
  if (!value) {
    return "—";
  }
  const labels: Record<string, string> = { M: "Masculino", H: "Femenino" };
  return labels[value] ?? value;
};

export const getEstadoCivilLabel = (value?: string | null): string => {
  if (!value) {
    return "—";
  }
  const labels: Record<string, string> = {
    SOLTERO: "Soltero/a",
    CASADO: "Casado/a",
    UNION_LIBRE: "Unión libre",
    DIVORCIADO: "Divorciado/a",
    VIUDO: "Viudo/a",
  };
  return labels[value] ?? value;
};

export const getTipoLabel = (value?: string | null): string => {
  if (!value) {
    return "—";
  }
  const labels: Record<string, string> = {
    CLIENTE: "Cliente",
    PROVEEDOR: "Proveedor",
  };
  return labels[value] ?? value;
};

export const isSocioActivo = (estado?: string | null): boolean => estado === "ACTIVO";

export const getSocioTipoNombres = (tipos?: { nombre: string }[] | null): string[] =>
  (tipos ?? []).map((tipo) => tipo.nombre);

export const esCliente = (tipos?: { nombre: string }[] | null): boolean =>
  getSocioTipoNombres(tipos).includes("CLIENTE");

export const esProveedor = (tipos?: { nombre: string }[] | null): boolean =>
  getSocioTipoNombres(tipos).includes("PROVEEDOR");
