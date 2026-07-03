export const ESTADOS_PRODUCTIVOS_PERMISSIONS = {
  view: "estados_productivos.view",
  create: "estados_productivos.create",
  update: "estados_productivos.update",
  delete: "estados_productivos.delete",
  restore: "estados_productivos.restore",
  activate: "estados_productivos.activate",
} as const;

export type EstadoProductivoPermission =
  (typeof ESTADOS_PRODUCTIVOS_PERMISSIONS)[keyof typeof ESTADOS_PRODUCTIVOS_PERMISSIONS];
