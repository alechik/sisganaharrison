import { EventoSanitarioListParams } from "./eventoSanitario";

export type EventoSanitarioSortField = "fecha" | "created_at";
export type EventoSanitarioSortDirection = "asc" | "desc";

export interface EventoSanitarioFilters extends EventoSanitarioListParams {
  sort_by: EventoSanitarioSortField;
  sort_dir: EventoSanitarioSortDirection;
}
