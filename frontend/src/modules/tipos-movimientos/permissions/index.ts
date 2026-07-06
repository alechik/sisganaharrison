export const TIPOS_MOVIMIENTOS_PERMISSIONS = {
  view: "tipos_movimientos.view",
  create: "tipos_movimientos.create",
  update: "tipos_movimientos.update",
  delete: "tipos_movimientos.delete",
  restore: "tipos_movimientos.restore",
  activate: "tipos_movimientos.activate",
} as const;

export type TipoMovimientoPermission =
  (typeof TIPOS_MOVIMIENTOS_PERMISSIONS)[keyof typeof TIPOS_MOVIMIENTOS_PERMISSIONS];
