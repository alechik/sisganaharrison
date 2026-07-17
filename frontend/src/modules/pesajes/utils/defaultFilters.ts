import { PESAJE_DEFAULT_PAGE_SIZE } from "../constants";
import { PesajeFilters, PesajeSortDirection, PesajeSortField } from "../types/filters";

export const defaultPesajeFilters = (): PesajeFilters => ({
  search: "",
  animal_id: undefined,
  fecha_desde: "",
  fecha_hasta: "",
  sort_by: "fecha" as PesajeSortField,
  sort_dir: "desc" as PesajeSortDirection,
  page: 1,
  per_page: PESAJE_DEFAULT_PAGE_SIZE,
});
