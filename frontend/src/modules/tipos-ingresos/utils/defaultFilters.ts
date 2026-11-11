import { TIPO_INGRESO_DEFAULT_PAGE_SIZE } from "../constants";
import {
  TipoIngresoFilters,
  TipoIngresoSortDirection,
  TipoIngresoSortField,
} from "../types/filters";

export const defaultTipoIngresoFilters = (): TipoIngresoFilters => ({
  search: "",
  estado: undefined,
  sort_by: "nombre" as TipoIngresoSortField,
  sort_dir: "asc" as TipoIngresoSortDirection,
  page: 1,
  per_page: TIPO_INGRESO_DEFAULT_PAGE_SIZE,
});
