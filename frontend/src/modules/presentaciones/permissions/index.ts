export const PRESENTACIONES_PERMISSIONS = {
  view: "presentaciones.view",
  create: "presentaciones.create",
  update: "presentaciones.update",
  delete: "presentaciones.delete",
  restore: "presentaciones.restore",
} as const;

export type PresentacionPermission =
  (typeof PRESENTACIONES_PERMISSIONS)[keyof typeof PRESENTACIONES_PERMISSIONS];
