import { VacunaFilters } from "../types";
import { VACUNA_DEFAULT_PAGE_SIZE } from "../constants";

export const defaultVacunaFilters = (): VacunaFilters => ({
  page: 1,
  per_page: VACUNA_DEFAULT_PAGE_SIZE,
  search: "",
  activo: undefined,
  sort_by: "nombre",
  sort_dir: "asc",
});
