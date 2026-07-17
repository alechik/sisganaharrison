export const GESTACIONES_PERMISSIONS = {
  view: "reproduccion.view",
  create: "reproduccion.create",
  update: "reproduccion.update",
} as const;

export type GestacionesPermission =
  (typeof GESTACIONES_PERMISSIONS)[keyof typeof GESTACIONES_PERMISSIONS];
