import { EstanciaListParams } from "./estancia";

export type EstanciaSortField = "nombre" | "codigo" | "departamento" | "created_at";
export type EstanciaSortDirection = "asc" | "desc";

export interface EstanciaFilters extends EstanciaListParams {
  sort_by: EstanciaSortField;
  sort_dir: EstanciaSortDirection;
}
