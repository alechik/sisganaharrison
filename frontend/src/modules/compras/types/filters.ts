import { OrdenCompraListParams } from "./ordenCompra";

export type OrdenCompraSortField =
  | "created_at"
  | "fecha"
  | "cod_compra"
  | "monto_total"
  | "estado";
export type OrdenCompraSortDirection = "asc" | "desc";

export interface OrdenCompraFilters extends OrdenCompraListParams {
  sort_by: OrdenCompraSortField;
  sort_dir: OrdenCompraSortDirection;
}
