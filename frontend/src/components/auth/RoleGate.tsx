import { hasAnyPermission } from "@/utils/permissions";
import { hasAnyRole } from "@/utils/roles";

interface Props {
  roles?: readonly string[];
  permissions?: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function RoleGate({
  roles = [],
  permissions = [],
  children,
  fallback = null,
}: Props) {
  const allowed =
    (roles.length > 0 && hasAnyRole(roles)) ||
    (permissions.length > 0 && hasAnyPermission(permissions));

  if (!allowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
