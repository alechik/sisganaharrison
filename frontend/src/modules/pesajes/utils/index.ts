export * from "./defaultFilters";

export const formatAnimalLabel = (
  codigo?: string | null,
  arete?: string | null
): string => {
  const code = codigo || "Sin código";
  const tag = arete || "Sin arete";
  return `${code} — ${tag}`;
};

export const formatPeso = (peso: number): string =>
  `${peso.toLocaleString("es-PY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kg`;
