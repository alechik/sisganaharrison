export const PARTOS_PERMISSIONS = {
  view: "reproduccion.view",
  create: "reproduccion.create",
  update: "reproduccion.update",
} as const;

export type PartosPermission = (typeof PARTOS_PERMISSIONS)[keyof typeof PARTOS_PERMISSIONS];
