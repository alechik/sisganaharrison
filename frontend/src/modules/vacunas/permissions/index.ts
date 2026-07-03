export const VACUNAS_PERMISSIONS = {
  view: "vacunas.view",
  create: "vacunas.create",
  update: "vacunas.update",
  delete: "vacunas.delete",
  restore: "vacunas.restore",
  activate: "vacunas.activate",
} as const;

export type VacunaPermission =
  (typeof VACUNAS_PERMISSIONS)[keyof typeof VACUNAS_PERMISSIONS];
