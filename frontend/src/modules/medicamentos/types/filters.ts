import { MedicamentoListParams } from "./medicamento";

export type MedicamentoSortBy = "nombre" | "codigo" | "laboratorio" | "created_at";
export type MedicamentoSortDirection = "asc" | "desc";

export interface MedicamentoFilters extends MedicamentoListParams {
  sort_by: MedicamentoSortBy;
  sort_dir: MedicamentoSortDirection;
}
