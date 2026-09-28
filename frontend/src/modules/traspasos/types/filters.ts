import { TraspasoListParams } from "./traspaso";

export type TraspasoSortField = "fecha_traspaso" | "total_peso" | "monto_total" | "created_at" | "id";
export type TraspasoSortDirection = "asc" | "desc";

export interface TraspasoFilters extends TraspasoListParams {
  sort_by: TraspasoSortField;
  sort_dir: TraspasoSortDirection;
}
