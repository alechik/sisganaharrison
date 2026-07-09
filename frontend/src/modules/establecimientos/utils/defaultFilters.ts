import { EstablecimientoFilters } from "../types";
import { ESTABLECIMIENTO_DEFAULT_PAGE_SIZE } from "../constants";

export const defaultEstablecimientoFilters = (): EstablecimientoFilters => ({
  page: 1,
  per_page: ESTABLECIMIENTO_DEFAULT_PAGE_SIZE,
  search: "",
  activo: undefined,
  sort_by: "nombre",
  sort_dir: "asc",
});
