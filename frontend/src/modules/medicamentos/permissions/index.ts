export const MEDICAMENTOS_PERMISSIONS = {
  view: "medicamentos.view",
  create: "medicamentos.create",
  update: "medicamentos.update",
  delete: "medicamentos.delete",
  restore: "medicamentos.restore",
  activate: "medicamentos.activate",
} as const;

export type MedicamentoPermission =
  (typeof MEDICAMENTOS_PERMISSIONS)[keyof typeof MEDICAMENTOS_PERMISSIONS];
