export const RAZAS_PERMISSIONS = {
  view: "razas.view",
  create: "razas.create",
  update: "razas.update",
  delete: "razas.delete",
  restore: "razas.restore",
  activate: "razas.activate",
} as const;

export type RazasPermission =
  (typeof RAZAS_PERMISSIONS)[keyof typeof RAZAS_PERMISSIONS];
