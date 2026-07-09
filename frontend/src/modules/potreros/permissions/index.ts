export const POTREROS_PERMISSIONS = {
  view: "potreros.view",
  create: "potreros.create",
  update: "potreros.update",
  delete: "potreros.delete",
  restore: "potreros.restore",
  activate: "potreros.activate",
} as const;

export type PotreroPermission =
  (typeof POTREROS_PERMISSIONS)[keyof typeof POTREROS_PERMISSIONS];
