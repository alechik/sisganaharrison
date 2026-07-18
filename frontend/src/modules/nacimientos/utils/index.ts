import { NACIMIENTO_DEFAULT_PAGE_SIZE } from "../constants";
import {
  NacimientoFilters,
  NacimientoSortDirection,
  NacimientoSortField,
} from "../types/filters";

export const defaultNacimientoFilters = (): NacimientoFilters => ({
  search: "",
  parto_id: undefined,
  animal_id: undefined,
  estado_nacimiento: undefined,
  sexo: undefined,
  sort_by: "created_at" as NacimientoSortField,
  sort_dir: "desc" as NacimientoSortDirection,
  page: 1,
  per_page: NACIMIENTO_DEFAULT_PAGE_SIZE,
});

export const formatDate = (value?: string | null): string => {
  if (!value) {
    return "—";
  }
  return new Date(`${value}T00:00:00`).toLocaleDateString("es-PY");
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

export const getEstadoNacimientoLabel = (value: string): string => {
  const labels: Record<string, string> = {
    VIVO: "Vivo",
    MUERTO: "Muerto",
  };
  return labels[value] ?? value;
};

export const getSexoLabel = (value: string): string => {
  const labels: Record<string, string> = {
    M: "Macho",
    H: "Hembra",
  };
  return labels[value] ?? value;
};

export const formatPartoOptionLabel = (parto: {
  id: number;
  fecha_parto: string;
  gestacion_servicio_hembra_codigo?: string | null;
  gestacion_servicio_hembra_arete?: string | null;
}): string => {
  const fecha = formatDate(parto.fecha_parto);
  const codigo = parto.gestacion_servicio_hembra_codigo || "Sin código";
  const arete = parto.gestacion_servicio_hembra_arete || "Sin arete";
  return `${fecha} · ${codigo} — ${arete}`;
};

export const formatAnimalOptionLabel = (animal: {
  codigo?: string | null;
  arete?: string | null;
}): string => {
  const codigo = animal.codigo || "Sin código";
  const arete = animal.arete || "Sin arete";
  return `${codigo} — ${arete}`;
};

export const formatUserOptionLabel = (user: {
  nombre: string;
  apellido: string;
  email: string;
}): string => `${user.nombre} ${user.apellido} (${user.email})`;
