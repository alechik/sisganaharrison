export const TIPOS_INGRESOS_PERMISSIONS = {
  view: "tipos_ingresos.view",
  create: "tipos_ingresos.create",
  update: "tipos_ingresos.update",
  delete: "tipos_ingresos.delete",
  restore: "tipos_ingresos.restore",
  activate: "tipos_ingresos.activate",
} as const;

export type TiposIngresosPermission =
  (typeof TIPOS_INGRESOS_PERMISSIONS)[keyof typeof TIPOS_INGRESOS_PERMISSIONS];
