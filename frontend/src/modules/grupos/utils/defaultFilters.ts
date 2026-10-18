import { GrupoFilters } from "../types";
import { GRUPO_DEFAULT_PAGE_SIZE } from "../constants";

export const defaultGrupoFilters = (): GrupoFilters => ({
  page: 1,
  per_page: GRUPO_DEFAULT_PAGE_SIZE,
  search: "",
  lote_id: undefined,
  activo: undefined,
  sort_by: "nombre",
  sort_dir: "asc",
});
