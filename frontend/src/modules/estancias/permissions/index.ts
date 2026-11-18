export const ESTANCIAS_PERMISSIONS = {
  view: "estancias.view",
  create: "estancias.create",
  update: "estancias.update",
  delete: "estancias.delete",
  restore: "estancias.restore",
  activate: "estancias.activate",
} as const;

export type EstanciaPermission =
  (typeof ESTANCIAS_PERMISSIONS)[keyof typeof ESTANCIAS_PERMISSIONS];
