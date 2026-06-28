import { CATEGORIA_ANIMAL_DEFAULT_PAGE_SIZE } from "../constants";
import {
  CategoriaAnimalFilters,
  CategoriaAnimalSortDirection,
  CategoriaAnimalSortField,
} from "../types/filters";

export const defaultCategoriaAnimalFilters = (): CategoriaAnimalFilters => ({
  search: "",
  activo: undefined,
  sort_by: "nombre" as CategoriaAnimalSortField,
  sort_dir: "asc" as CategoriaAnimalSortDirection,
  page: 1,
  per_page: CATEGORIA_ANIMAL_DEFAULT_PAGE_SIZE,
});
