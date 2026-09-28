import { MedicamentoFilters } from "../types";
import { MEDICAMENTO_DEFAULT_PAGE_SIZE } from "../constants";

export const defaultMedicamentoFilters = (): MedicamentoFilters => ({
  page: 1,
  per_page: MEDICAMENTO_DEFAULT_PAGE_SIZE,
  search: "",
  activo: undefined,
  sort_by: "nombre",
  sort_dir: "asc",
});
