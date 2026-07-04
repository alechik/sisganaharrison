import { TipoEventoSanitarioFilters } from "../types";
import { TIPO_EVENTO_SANITARIO_DEFAULT_PAGE_SIZE } from "../constants";

export const defaultTipoEventoSanitarioFilters = (): TipoEventoSanitarioFilters => ({
  page: 1,
  per_page: TIPO_EVENTO_SANITARIO_DEFAULT_PAGE_SIZE,
  search: "",
  activo: undefined,
  sort_by: "nombre",
  sort_dir: "asc",
});
