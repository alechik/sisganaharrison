export const SOCIOS_PERMISSIONS = {
  view: "socios.view",
  create: "socios.create",
  update: "socios.update",
  delete: "socios.delete",
  restore: "socios.restore",
  activate: "socios.activate",
} as const;

export const TIPOS_PERSONA_PERMISSIONS = {
  view: "tipos_persona.view",
  create: "tipos_persona.create",
  update: "tipos_persona.update",
  delete: "tipos_persona.delete",
} as const;

export type SociosPermission =
  (typeof SOCIOS_PERMISSIONS)[keyof typeof SOCIOS_PERMISSIONS];
