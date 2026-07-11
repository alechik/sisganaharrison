import { LoteListParams } from "./lote";

export type LoteSortField = "nombre" | "codigo" | "created_at";
export type LoteSortDirection = "asc" | "desc";

export interface LoteFilters extends LoteListParams {
  sort_by: LoteSortField;
  sort_dir: LoteSortDirection;
}
