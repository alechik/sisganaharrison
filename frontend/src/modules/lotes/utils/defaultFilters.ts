import { LoteFilters } from "../types";
import { LOTE_DEFAULT_PAGE_SIZE } from "../constants";

export const defaultLoteFilters = (): LoteFilters => ({
  page: 1,
  per_page: LOTE_DEFAULT_PAGE_SIZE,
  search: "",
  potrero_id: undefined,
  activo: undefined,
  sort_by: "nombre",
  sort_dir: "asc",
});
