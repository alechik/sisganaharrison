import { TipoMovimientoFilters } from "../types";
import { TIPO_MOVIMIENTO_DEFAULT_PAGE_SIZE } from "../constants";

export const defaultTipoMovimientoFilters = (): TipoMovimientoFilters => ({
  page: 1,
  per_page: TIPO_MOVIMIENTO_DEFAULT_PAGE_SIZE,
  search: "",
  activo: undefined,
  sort_by: "nombre",
  sort_dir: "asc",
});
