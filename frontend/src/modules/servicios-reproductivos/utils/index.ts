import { SERVICIO_REPRODUCTIVO_DEFAULT_PAGE_SIZE } from "../constants";
import {
  ServicioReproductivoFilters,
  ServicioReproductivoSortDirection,
  ServicioReproductivoSortField,
} from "../types/filters";

export const defaultServicioReproductivoFilters = (): ServicioReproductivoFilters => ({
  search: "",
  hembra_id: undefined,
  macho_id: undefined,
  tipo_servicio: undefined,
  resultado: undefined,
  fecha_desde: "",
  fecha_hasta: "",
  sort_by: "fecha_servicio" as ServicioReproductivoSortField,
  sort_dir: "desc" as ServicioReproductivoSortDirection,
  page: 1,
  per_page: SERVICIO_REPRODUCTIVO_DEFAULT_PAGE_SIZE,
});

export const ARETES_INVALIDOS = ["bull"];

export const isAreteValido = (arete?: string | null): boolean => {
  const value = (arete ?? "").trim().toLowerCase();

  return value !== "" && !ARETES_INVALIDOS.includes(value);
};

export const formatAnimalLabel = (
  codigo?: string | null,
  arete?: string | null
): string => {
  const code = codigo || "Sin código";
  const tag = arete?.trim() || "Sin arete";
  return `${code} — ${tag}`;
};

export const getTipoServicioLabel = (value: string): string => {
  const labels: Record<string, string> = {
    MONTA_NATURAL: "Monta natural",
    INSEMINACION_ARTIFICIAL: "Inseminación artificial",
    TRANSFERENCIA_EMBRION: "Transferencia de embrión",
  };
  return labels[value] ?? value;
};

export const extractApiError = (err: unknown, fallback: string): string => {
  const data = (err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } })
    ?.response?.data;
  const firstError = data?.errors ? Object.values(data.errors).flat()[0] : undefined;
  if (typeof firstError === "string" && firstError.trim() !== "") {
    return firstError;
  }
  return data?.message ?? fallback;
};

export const puedeConfirmarGestacion = (servicio: {
  resultado?: string | null;
  gestacion?: { parto?: unknown } | null;
}): boolean => {
  if (servicio.resultado === "VACIA" || servicio.resultado === "ABORTO") {
    return false;
  }
  return !servicio.gestacion?.parto;
};

export const puedeRegistrarParto = (servicio: {
  gestacion?: { estado?: string; parto?: unknown } | null;
}): boolean => {
  return servicio.gestacion?.estado === "ACTIVA" && !servicio.gestacion?.parto;
};

export const getResultadoLabel = (value?: string | null): string => {
  if (!value) {
    return "—";
  }
  const labels: Record<string, string> = {
    PENDIENTE: "Pendiente",
    PRENADA: "Preñada",
    VACIA: "Vacía",
    ABORTO: "Aborto",
  };
  return labels[value] ?? value;
};
