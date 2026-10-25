import { asStringArray } from "@/utils/roles";

export const groupPermissions = (permissions: unknown): Record<string, string[]> => {
  return asStringArray(permissions).reduce<Record<string, string[]>>((groups, permission) => {
    const prefix = permission.split(".")[0] ?? "otros";
    if (!groups[prefix]) {
      groups[prefix] = [];
    }
    groups[prefix].push(permission);
    return groups;
  }, {});
};
