import { EstadoProductivoFilters } from "../types";
import { ESTADO_PRODUCTIVO_DEFAULT_PAGE_SIZE } from "../constants";

export const defaultEstadoProductivoFilters = (): EstadoProductivoFilters => ({
  page: 1,
  per_page: ESTADO_PRODUCTIVO_DEFAULT_PAGE_SIZE,
  search: "",
  activo: undefined,
  sort_by: "nombre",
  sort_dir: "asc",
});
