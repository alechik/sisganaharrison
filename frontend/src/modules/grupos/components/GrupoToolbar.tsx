import { Link } from "react-router-dom";
import PermissionGate from "@/components/auth/PermissionGate";
import { GRUPO_ROUTES } from "../constants";
import { GRUPOS_PERMISSIONS } from "../permissions";

export default function GrupoToolbar({
  showDeletedLink = true,
  showCreateButton = true,
}: { showDeletedLink?: boolean; showCreateButton?: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {showDeletedLink && (
        <PermissionGate permission={GRUPOS_PERMISSIONS.view}>
          <Link to={GRUPO_ROUTES.deleted} className="inline-flex items-center rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-white/[0.05] dark:text-gray-300 dark:hover:bg-white/[0.05]">
            Ver eliminados
          </Link>
        </PermissionGate>
      )}
      {showCreateButton && (
        <PermissionGate permission={GRUPOS_PERMISSIONS.create}>
          <Link to={GRUPO_ROUTES.create} className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600">
            + Nuevo grupo
          </Link>
        </PermissionGate>
      )}
    </div>
  );
}
