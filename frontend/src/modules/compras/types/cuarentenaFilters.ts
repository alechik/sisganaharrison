import { CuarentenaListParams } from "./cuarentena";

export type CuarentenaSortField =
  | "created_at"
  | "fecha_inicio"
  | "cod_compra"
  | "monto_total"
  | "estado"
  | "origen";
export type CuarentenaSortDirection = "asc" | "desc";

export interface CuarentenaFilters extends CuarentenaListParams {
  sort_by: CuarentenaSortField;
  sort_dir: CuarentenaSortDirection;
}
