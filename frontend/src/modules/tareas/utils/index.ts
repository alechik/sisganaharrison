export { defaultTareaFilters } from "./defaultFilters";

export const getEstadoLabel = (value?: string | null): string => {
  const labels: Record<string, string> = {
    EMITIDO: "Emitido",
    PENDIENTE: "Pendiente",
    TERMINADO: "Terminado",
  };
  return value ? labels[value] ?? value : "—";
};

export const formatDateTime = (value?: string | null): string => {
  if (!value) {
    return "—";
  }
  return new Date(value).toLocaleString("es-PY");
};
