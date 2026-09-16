import { AnimalFilters } from "../types";
import { ANIMAL_DEFAULT_PAGE_SIZE } from "../constants";

export const defaultAnimalFilters = (): AnimalFilters => ({
  page: 1,
  per_page: ANIMAL_DEFAULT_PAGE_SIZE,
  search: "",
  raza_id: undefined,
  categoria_id: undefined,
  estado_productivo_id: undefined,
  lote_id: undefined,
  sexo: undefined,
  activo: undefined,
  sort_by: "codigo",
  sort_dir: "asc",
});
