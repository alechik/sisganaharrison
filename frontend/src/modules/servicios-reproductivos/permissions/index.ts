export const SERVICIOS_REPRODUCTIVOS_PERMISSIONS = {
  view: "reproduccion.view",
  create: "reproduccion.create",
  update: "reproduccion.update",
} as const;

export type ServiciosReproductivosPermission =
  (typeof SERVICIOS_REPRODUCTIVOS_PERMISSIONS)[keyof typeof SERVICIOS_REPRODUCTIVOS_PERMISSIONS];
