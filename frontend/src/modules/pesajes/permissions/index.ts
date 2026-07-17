export const PESAJES_PERMISSIONS = {
  view: "pesajes.view",
  create: "pesajes.create",
} as const;

export type PesajesPermission =
  (typeof PESAJES_PERMISSIONS)[keyof typeof PESAJES_PERMISSIONS];
