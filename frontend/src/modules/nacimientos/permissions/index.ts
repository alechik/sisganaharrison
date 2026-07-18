export const NACIMIENTOS_PERMISSIONS = {
  view: "reproduccion.view",
  create: "reproduccion.create",
  update: "reproduccion.update",
} as const;

export type NacimientosPermission =
  (typeof NACIMIENTOS_PERMISSIONS)[keyof typeof NACIMIENTOS_PERMISSIONS];
