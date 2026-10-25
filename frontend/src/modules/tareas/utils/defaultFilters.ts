import { TAREA_DEFAULT_PAGE_SIZE } from "../constants";
import { TareaFilters, TareaSortDirection, TareaSortField } from "../types";

export const defaultTareaFilters = (): TareaFilters => ({
  search: "",
  estado: undefined,
  user_trabajador_id: undefined,
  fecha_desde: "",
  fecha_hasta: "",
  sort_by: "created_at" as TareaSortField,
  sort_dir: "desc" as TareaSortDirection,
  page: 1,
  per_page: TAREA_DEFAULT_PAGE_SIZE,
});
