import { hasAnyPermission, hasPermission } from "@/utils/permissions";

interface Props {
  permission?: string;
  permissions?: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function PermissionGate({
  permission,
  permissions = [],
  children,
  fallback = null,
}: Props) {
  const allowed = permission
    ? hasPermission(permission)
    : permissions.length > 0
      ? hasAnyPermission(permissions)
      : true;

  if (!allowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
