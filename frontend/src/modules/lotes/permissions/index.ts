export const LOTES_PERMISSIONS = {
  view: "lotes.view",
  create: "lotes.create",
  update: "lotes.update",
  delete: "lotes.delete",
  restore: "lotes.restore",
  activate: "lotes.activate",
} as const;

export type LotePermission =
  (typeof LOTES_PERMISSIONS)[keyof typeof LOTES_PERMISSIONS];
