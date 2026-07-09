import { PotreroFilters } from "../types";
import { POTRERO_DEFAULT_PAGE_SIZE } from "../constants";

export const defaultPotreroFilters = (): PotreroFilters => ({
  page: 1,
  per_page: POTRERO_DEFAULT_PAGE_SIZE,
  search: "",
  establecimiento_id: undefined,
  activo: undefined,
  disponibilidad: undefined,
  sort_by: "nombre",
  sort_dir: "asc",
});
