import { Link } from "react-router-dom";

import RoleGate from "@/components/auth/RoleGate";
import { GESTORES_ROLES } from "@/utils/roles";
import { TAREA_ROUTES } from "../constants";
import { TAREAS_PERMISSIONS } from "../permissions";

export default function TareaToolbar() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <RoleGate roles={GESTORES_ROLES} permissions={[TAREAS_PERMISSIONS.create]}>
        <Link
          to={TAREA_ROUTES.create}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600"
        >
          + Nueva Tarea
        </Link>
      </RoleGate>
    </div>
  );
}
