export const PARCELAS_PERMISSIONS = {
  view: "parcelas.view",
  create: "parcelas.create",
  update: "parcelas.update",
  delete: "parcelas.delete",
  restore: "parcelas.restore",
  activate: "parcelas.activate",
} as const;

export type ParcelaPermission =
  (typeof PARCELAS_PERMISSIONS)[keyof typeof PARCELAS_PERMISSIONS];
