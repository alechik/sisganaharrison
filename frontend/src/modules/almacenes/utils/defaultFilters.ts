import { ALMACEN_DEFAULT_PAGE_SIZE } from "../constants";
import { AlmacenFilters } from "../types";

export const defaultAlmacenFilters = (): AlmacenFilters => ({
  page: 1,
  per_page: ALMACEN_DEFAULT_PAGE_SIZE,
  search: "",
  establecimiento_id: undefined,
  activo: undefined,
  sort_by: "nombre",
  sort_dir: "asc",
});
