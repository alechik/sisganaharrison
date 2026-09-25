export const TIPOS_SALIDAS_PERMISSIONS = {
  view: "tipos_salidas.view",
  create: "tipos_salidas.create",
  update: "tipos_salidas.update",
  delete: "tipos_salidas.delete",
  restore: "tipos_salidas.restore",
} as const;

export type TipoSalidaPermission =
  (typeof TIPOS_SALIDAS_PERMISSIONS)[keyof typeof TIPOS_SALIDAS_PERMISSIONS];
