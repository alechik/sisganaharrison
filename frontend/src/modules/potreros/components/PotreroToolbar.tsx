import { Link } from "react-router-dom";

import PermissionGate from "@/components/auth/PermissionGate";
import { POTRERO_ROUTES } from "../constants";
import { POTREROS_PERMISSIONS } from "../permissions";

interface Props {
  showDeletedLink?: boolean;
  showCreateButton?: boolean;
}

export default function PotreroToolbar({
  showDeletedLink = true,
  showCreateButton = true,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {showDeletedLink && (
        <PermissionGate permission={POTREROS_PERMISSIONS.view}>
          <Link
            to={POTRERO_ROUTES.deleted}
            className="inline-flex items-center rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-white/[0.05] dark:text-gray-300 dark:hover:bg-white/[0.05]"
          >
            Ver eliminados
          </Link>
        </PermissionGate>
      )}

      {showCreateButton && (
        <PermissionGate permission={POTREROS_PERMISSIONS.create}>
          <Link
            to={POTRERO_ROUTES.create}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600"
          >
            + Nuevo Potrero
          </Link>
        </PermissionGate>
      )}
    </div>
  );
}
