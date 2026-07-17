import { Link } from "react-router-dom";

import PermissionGate from "@/components/auth/PermissionGate";
import { EVENTO_SANITARIO_ROUTES } from "../constants";
import { EVENTOS_SANITARIOS_PERMISSIONS } from "../permissions";

interface Props {
  showCreateButton?: boolean;
}

export default function EventoSanitarioToolbar({ showCreateButton = true }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {showCreateButton && (
        <PermissionGate permission={EVENTOS_SANITARIOS_PERMISSIONS.create}>
          <Link
            to={EVENTO_SANITARIO_ROUTES.create}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600"
          >
            + Nuevo Evento Sanitario
          </Link>
        </PermissionGate>
      )}
    </div>
  );
}
