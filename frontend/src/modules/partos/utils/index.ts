import { PARTO_DEFAULT_PAGE_SIZE } from "../constants";
import { Parto } from "../types/parto";
import { PartoFilters, PartoSortDirection, PartoSortField } from "../types/filters";

export const defaultPartoFilters = (): PartoFilters => ({
  search: "",
  gestacion_id: undefined,
  fecha_parto_desde: "",
  fecha_parto_hasta: "",
  sort_by: "fecha_parto" as PartoSortField,
  sort_dir: "desc" as PartoSortDirection,
  estado: undefined,
  page: 1,
  per_page: PARTO_DEFAULT_PAGE_SIZE,
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

export const getEstadoGestacionLabel = (value?: string | null): string => {
  if (!value) {
    return "—";
  }
  const labels: Record<string, string> = {
    ACTIVA: "Activa",
    FINALIZADA: "Finalizada",
    ABORTADA: "Abortada",
    PERDIDA: "Perdida",
  };
  return labels[value] ?? value;
};

export const getEstadoPartoLabel = (value?: string | null): string => {
  if (!value) {
    return "—";
  }
  const labels: Record<string, string> = {
    PENDIENTE: "Pendiente",
    FINALIZADA: "Finalizada",
  };
  return labels[value] ?? value;
};

export const formatDate = (value?: string | null): string => {
  if (!value) {
    return "—";
  }
  return new Date(`${value}T00:00:00`).toLocaleDateString("es-PY");
};

export const formatGestacionResumen = (parto: Parto): string => {
  const hembra = formatAnimalLabel(
    parto.gestacion_servicio_hembra_codigo,
    parto.gestacion_servicio_hembra_arete
  );
  const fecha = formatDate(parto.gestacion_servicio_fecha_servicio);
  const tipo = getTipoServicioLabel(parto.gestacion_servicio_tipo_servicio);
  const estado = getEstadoGestacionLabel(parto.gestacion_estado);
  return `#${parto.gestacion_id} · ${hembra} · ${fecha} · ${tipo} · ${estado}`;
};
