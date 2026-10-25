import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import RoleGate from "@/components/auth/RoleGate";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { GESTORES_ROLES, canEditRole } from "@/utils/roles";
import { getRoleLabel, ROLE_ROUTES } from "../constants";
import { ROLES_PERMISSIONS } from "../permissions";
import { getRole } from "../services";
import { Role } from "../types";
import { groupPermissions } from "../utils";

export default function RoleDetailPage() {
  const { id } = useParams();
  const roleId = Number(id);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setRole(await getRole(roleId));
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar el detalle del rol.");
      } finally {
        setLoading(false);
      }
    };

    if (roleId) {
      load();
      return;
    }

    setLoading(false);
    setError("Rol no encontrado.");
  }, [roleId]);

  if (loading) {
    return <div>Cargando detalle...</div>;
  }

  if (error || !role) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
        {error ?? "Rol no encontrado."}
      </div>
    );
  }

  const groups = groupPermissions(role.permissions ?? []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <PageBreadCrumb pageTitle={getRoleLabel(role.name)} items={breadcrumbs.rolDetalle} />
        <div className="flex gap-3">
          <Link
            to={ROLE_ROUTES.list}
            className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-3 text-sm text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700"
          >
            Volver al listado
          </Link>
          {canEditRole(role.name) && (
            <RoleGate
              roles={GESTORES_ROLES}
              permissions={[ROLES_PERMISSIONS.update]}
            >
              <Link
                to={ROLE_ROUTES.edit(role.id)}
                className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-3 text-sm text-white hover:bg-brand-600"
              >
                Editar permisos
              </Link>
            </RoleGate>
          )}
        </div>
      </div>

      <ComponentCard title="Detalle de rol">
        <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Nombre</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{getRoleLabel(role.name)}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Identificador</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{role.name}</dd>
          </div>
          <div className="md:col-span-2">
            <dt className="text-sm text-gray-500 dark:text-gray-400">Permisos ({role.permissions?.length ?? 0})</dt>
            <dd className="mt-3 space-y-3">
              {Object.entries(groups).map(([group, permissions]) => (
                <div key={group}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    {group.replace(/_/g, " ")}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{permissions.join(", ")}</p>
                </div>
              ))}
            </dd>
          </div>
        </dl>
      </ComponentCard>
    </div>
  );
}
