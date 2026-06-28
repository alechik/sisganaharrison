import { RAZA_DEFAULT_PAGE_SIZE } from "../constants";
import { RazaFilters, RazaSortDirection, RazaSortField } from "../types/filters";

export const defaultRazaFilters = (): RazaFilters => ({
  search: "",
  estado: undefined,
  sort_by: "nombre" as RazaSortField,
  sort_dir: "asc" as RazaSortDirection,
  page: 1,
  per_page: RAZA_DEFAULT_PAGE_SIZE,
});
