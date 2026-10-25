import { TareaListParams } from "./tarea";

export type TareaSortField = "codigo_tarea" | "estado" | "fecha_inicio" | "created_at";
export type TareaSortDirection = "asc" | "desc";

export interface TareaFilters extends TareaListParams {
  sort_by: TareaSortField;
  sort_dir: TareaSortDirection;
}
