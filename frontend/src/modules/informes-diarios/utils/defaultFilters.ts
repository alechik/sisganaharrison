import { INFORME_DIARIO_DEFAULT_PAGE_SIZE } from "../constants";
import { InformeDiarioFilters, InformeSortDirection, InformeSortField } from "../types";

export const defaultInformeDiarioFilters = (): InformeDiarioFilters => ({
  search: "",
  revisado: undefined,
  user_trabajador_id: undefined,
  fecha_desde: "",
  fecha_hasta: "",
  sort_by: "fecha" as InformeSortField,
  sort_dir: "desc" as InformeSortDirection,
  page: 1,
  per_page: INFORME_DIARIO_DEFAULT_PAGE_SIZE,
});
