import { Link } from "react-router-dom";

import PermissionGate from "@/components/auth/PermissionGate";
import { TRASPASO_ROUTES } from "../constants";
import { TRASPASOS_PERMISSIONS } from "../permissions";

export default function TraspasoToolbar() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <PermissionGate permission={TRASPASOS_PERMISSIONS.create}>
        <Link
          to={TRASPASO_ROUTES.create}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600"
        >
          + Nuevo traspaso
        </Link>
      </PermissionGate>
    </div>
  );
}
