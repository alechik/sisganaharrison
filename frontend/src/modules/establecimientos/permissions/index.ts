export const ESTABLECIMIENTOS_PERMISSIONS = {
  view: "establecimientos.view",
  create: "establecimientos.create",
  update: "establecimientos.update",
  delete: "establecimientos.delete",
  restore: "establecimientos.restore",
  activate: "establecimientos.activate",
} as const;

export type EstablecimientoPermission =
  (typeof ESTABLECIMIENTOS_PERMISSIONS)[keyof typeof ESTABLECIMIENTOS_PERMISSIONS];
