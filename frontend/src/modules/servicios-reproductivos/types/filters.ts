import { ServicioReproductivoListParams } from "./servicioReproductivo";

export type ServicioReproductivoSortField = "fecha_servicio" | "tipo_servicio" | "created_at";
export type ServicioReproductivoSortDirection = "asc" | "desc";

export interface ServicioReproductivoFilters extends ServicioReproductivoListParams {
  sort_by: ServicioReproductivoSortField;
  sort_dir: ServicioReproductivoSortDirection;
}
