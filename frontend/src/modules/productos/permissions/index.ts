export const PRODUCTOS_PERMISSIONS = {
  view: "productos.view",
  create: "productos.create",
  update: "productos.update",
  delete: "productos.delete",
  restore: "productos.restore",
  activate: "productos.activate",
} as const;

export type ProductoPermission =
  (typeof PRODUCTOS_PERMISSIONS)[keyof typeof PRODUCTOS_PERMISSIONS];
