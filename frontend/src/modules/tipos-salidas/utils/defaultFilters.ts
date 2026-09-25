import { TipoSalidaFilters } from "../types";
import { TIPO_SALIDA_DEFAULT_PAGE_SIZE } from "../constants";

export const defaultTipoSalidaFilters = (): TipoSalidaFilters => ({
  page: 1,
  per_page: TIPO_SALIDA_DEFAULT_PAGE_SIZE,
  search: "",
  sort_by: "nombre",
  sort_dir: "asc",
});
