export const TIPOS_ALERTAS_PERMISSIONS = {
  view: "tipos_alertas.view",
  create: "tipos_alertas.create",
  update: "tipos_alertas.update",
  delete: "tipos_alertas.delete",
  restore: "tipos_alertas.restore",
  activate: "tipos_alertas.activate",
} as const;

export type TipoAlertaPermission =
  (typeof TIPOS_ALERTAS_PERMISSIONS)[keyof typeof TIPOS_ALERTAS_PERMISSIONS];
