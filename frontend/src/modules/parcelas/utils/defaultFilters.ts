import { ParcelaFilters } from "../types";
import { PARCELA_DEFAULT_PAGE_SIZE } from "../constants";

export const defaultParcelaFilters = (): ParcelaFilters => ({
  page: 1,
  per_page: PARCELA_DEFAULT_PAGE_SIZE,
  search: "",
  estancia_id: undefined,
  activo: undefined,
  disponibilidad: undefined,
  sort_by: "nombre",
  sort_dir: "asc",
});
