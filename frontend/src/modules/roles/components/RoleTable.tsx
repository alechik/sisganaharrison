import { Link } from "react-router-dom";

import RoleGate from "@/components/auth/RoleGate";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EyeIcon, PencilIcon } from "@/icons";
import { GESTORES_ROLES, canEditRole } from "@/utils/roles";
import { ROLE_ROUTES, getRoleLabel } from "../constants";
import { ROLES_PERMISSIONS } from "../permissions";
import { Role } from "../types";

interface Props {
  roles: Role[];
}

export default function RoleTable({ roles }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start text-gray-800 dark:text-white">
                Rol
              </TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start text-gray-800 dark:text-white">
                Permisos
              </TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-center text-gray-800 dark:text-white">
                Opciones
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {roles.length === 0 ? (
              <TableRow>
                <TableCell className="px-5 py-8 text-center text-gray-500" colSpan={3}>
                  No hay roles para mostrar.
                </TableCell>
              </TableRow>
            ) : (
              roles.map((role) => (
                <TableRow
                  key={role.id}
                  className="transition hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                >
                  <TableCell className="px-5 py-4">
                    <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {getRoleLabel(role.name)}
                    </span>
                    <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                      {role.name}
                    </span>
                  </TableCell>

                  <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                    {role.permissions?.length ?? 0} permisos
                  </TableCell>

                  <TableCell className="px-5 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <RoleGate
                        roles={GESTORES_ROLES}
                        permissions={[ROLES_PERMISSIONS.view, ROLES_PERMISSIONS.update]}
                      >
                        <Link
                          to={ROLE_ROUTES.detail(role.id)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 transition hover:border-blue-200 hover:bg-blue-50 dark:border-white/[0.05] dark:hover:bg-white/[0.05]"
                          title="Ver rol"
                        >
                          <EyeIcon className="size-4" />
                        </Link>
                        {canEditRole(role.name) && (
                          <Link
                            to={ROLE_ROUTES.edit(role.id)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 transition hover:border-blue-200 hover:bg-blue-50 dark:border-white/[0.05] dark:hover:bg-white/[0.05]"
                            title="Editar permisos"
                          >
                            <PencilIcon className="size-4" />
                          </Link>
                        )}
                      </RoleGate>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
