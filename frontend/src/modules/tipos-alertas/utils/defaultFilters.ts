import { TipoAlertaFilters } from "../types";
import { TIPO_ALERTA_DEFAULT_PAGE_SIZE } from "../constants";

export const defaultTipoAlertaFilters = (): TipoAlertaFilters => ({
  page: 1,
  per_page: TIPO_ALERTA_DEFAULT_PAGE_SIZE,
  search: "",
  activo: undefined,
  sort_by: "nombre",
  sort_dir: "asc",
});
