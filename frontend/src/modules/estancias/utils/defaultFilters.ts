import { EstanciaFilters } from "../types";
import { ESTANCIA_DEFAULT_PAGE_SIZE } from "../constants";

export const defaultEstanciaFilters = (): EstanciaFilters => ({
  page: 1,
  per_page: ESTANCIA_DEFAULT_PAGE_SIZE,
  search: "",
  activo: undefined,
  sort_by: "nombre",
  sort_dir: "asc",
});
