import { EVENTO_SANITARIO_DEFAULT_PAGE_SIZE } from "../constants";
import {
  EventoSanitarioFilters,
  EventoSanitarioSortDirection,
  EventoSanitarioSortField,
} from "../types/filters";

export const defaultEventoSanitarioFilters = (): EventoSanitarioFilters => ({
  search: "",
  animal_id: undefined,
  tipo_evento_id: undefined,
  vacuna_id: undefined,
  fecha_desde: "",
  fecha_hasta: "",
  sort_by: "fecha" as EventoSanitarioSortField,
  sort_dir: "desc" as EventoSanitarioSortDirection,
  page: 1,
  per_page: EVENTO_SANITARIO_DEFAULT_PAGE_SIZE,
});

export const formatAnimalLabel = (
  codigo?: string | null,
  arete?: string | null
): string => {
  const code = codigo || "Sin código";
  const tag = arete || "Sin arete";
  return `${code} — ${tag}`;
};

export const tipoRequiereVacuna = (codigo?: string | null): boolean =>
  codigo === "VACUNACION";
