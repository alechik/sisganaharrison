import { PesajeListParams } from "./pesaje";

export type PesajeSortField = "fecha" | "peso" | "created_at";
export type PesajeSortDirection = "asc" | "desc";

export interface PesajeFilters extends PesajeListParams {
  sort_by: PesajeSortField;
  sort_dir: PesajeSortDirection;
}
