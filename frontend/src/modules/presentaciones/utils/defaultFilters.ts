import { PresentacionFilters } from "../types";
import { PRESENTACION_DEFAULT_PAGE_SIZE } from "../constants";

export const defaultPresentacionFilters = (): PresentacionFilters => ({
  page: 1,
  per_page: PRESENTACION_DEFAULT_PAGE_SIZE,
  search: "",
  sort_by: "descripcion",
  sort_dir: "asc",
});
