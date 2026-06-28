import { CategoriaAnimalListParams } from "./categoriaAnimal";

export type CategoriaAnimalSortField = "nombre" | "codigo" | "created_at";
export type CategoriaAnimalSortDirection = "asc" | "desc";

export interface CategoriaAnimalFilters extends CategoriaAnimalListParams {
  sort_by: CategoriaAnimalSortField;
  sort_dir: CategoriaAnimalSortDirection;
}
