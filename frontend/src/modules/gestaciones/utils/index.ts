import { GESTACION_DEFAULT_PAGE_SIZE } from "../constants";
import { Gestacion } from "../types/gestacion";
import {
  GestacionFilters,
  GestacionSortDirection,
  GestacionSortField,
} from "../types/filters";

export const defaultGestacionFilters = (): GestacionFilters => ({
  search: "",
  servicio_id: undefined,
  estado: undefined,
  fecha_confirmacion_desde: "",
  fecha_confirmacion_hasta: "",
  sort_by: "fecha_probable_parto" as GestacionSortField,
  sort_dir: "desc" as GestacionSortDirection,
  page: 1,
  per_page: GESTACION_DEFAULT_PAGE_SIZE,
});

export const formatAnimalLabel = (
  codigo?: string | null,
  arete?: string | null
): string => {
  const code = codigo || "Sin código";
  const tag = arete || "Sin arete";
  return `${code} — ${tag}`;
};

export const getTipoServicioLabel = (value?: string | null): string => {
  if (!value) {
    return "—";
  }
  const labels: Record<string, string> = {
    MONTA_NATURAL: "Monta natural",
    INSEMINACION_ARTIFICIAL: "Inseminación artificial",
    TRANSFERENCIA_EMBRION: "Transferencia de embrión",
  };
  return labels[value] ?? value;
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

export const getEstadoLabel = (value: string): string => {
  const labels: Record<string, string> = {
    ACTIVA: "Activa",
    FINALIZADA: "Finalizada",
    ABORTADA: "Abortada",
    PERDIDA: "Perdida",
  };
  return labels[value] ?? value;
};

export const formatServicioResumen = (gestacion: Gestacion): string => {
  const hembra = formatAnimalLabel(
    gestacion.servicio_hembra_codigo,
    gestacion.servicio_hembra_arete
  );
  const fecha = gestacion.servicio_fecha_servicio
    ? new Date(`${gestacion.servicio_fecha_servicio}T00:00:00`).toLocaleDateString("es-PY")
    : "Sin fecha";
  const tipo = getTipoServicioLabel(gestacion.servicio_tipo_servicio);
  return `${hembra} · ${fecha} · ${tipo}`;
};

export const formatDate = (value?: string | null): string => {
  if (!value) {
    return "—";
  }
  return new Date(`${value}T00:00:00`).toLocaleDateString("es-PY");
};
