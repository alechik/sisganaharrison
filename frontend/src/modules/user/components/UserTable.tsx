import { Link } from "react-router-dom";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import Pagination from "@/components/common/Pagination";
import { PaginationMeta } from "@/types/api";
import {
  PencilIcon,
  TrashBinIcon,
  UserCircleIcon,
} from "@/icons";

import { User } from "../types/user";

interface Props {
  users: User[];
  meta?: PaginationMeta;
  currentUserId?: number | null;
  showCreateButton?: boolean;
  showDeletedLink?: boolean;
  onPageChange?: (page: number) => void;
  onToggleStatus?: (user: User) => void;
  onDelete?: (user: User) => void;
}

const UserTable = ({
  users,
  meta,
  currentUserId = null,
  showCreateButton = true,
  showDeletedLink = true,
  onPageChange,
  onToggleStatus,
  onDelete,
}: Props) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/[0.05]">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Gestión de Usuarios
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Lista general de usuarios registrados
          </p>
        </div>

        <div className="flex items-center gap-2">
          {showDeletedLink && (
            <Link
              to="/usuarios/eliminados"
              className="inline-flex items-center rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-white/[0.05] dark:text-gray-300 dark:hover:bg-white/[0.05]"
            >
              Ver eliminados
            </Link>
          )}

          {showCreateButton && (
            <Link
              to="/usuarios/crear"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition"
            >
              + Nuevo Usuario
            </Link>
          )}
        </div>
      </div>

      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start">
                Usuario
              </TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start">
                Email
              </TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start">
                Teléfono
              </TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start">
                Cargo
              </TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start">
                Estado
              </TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-center">
                Opciones
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {users.length === 0 ? (
              <TableRow>
                <TableCell className="px-5 py-8 text-center text-gray-500" colSpan={6}>
                  No hay usuarios para mostrar.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => {
                const isSelf = currentUserId === user.id;

                return (
                  <TableRow
                    key={user.id}
                    className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition"
                  >
                    <TableCell className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-11 h-11 rounded-full bg-brand-100 dark:bg-brand-500/20">
                          <UserCircleIcon className="text-brand-500 size-6" />
                        </div>
                        <div>
                          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {user.nombre} {user.apellido}
                          </span>
                          <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                            ID: {user.id}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                      {user.email}
                    </TableCell>

                    <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                      {user.telefono || "Sin teléfono"}
                    </TableCell>

                    <TableCell className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        {user.roles.length > 0 ? (
                          user.roles.map((role) => (
                            <Badge key={role.id} size="sm" color="primary">
                              {role.name}
                            </Badge>
                          ))
                        ) : (
                          <Badge size="sm" color="warning">
                            Sin rol
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="px-5 py-4">
                      <button
                        type="button"
                        disabled={isSelf || !onToggleStatus}
                        onClick={() => onToggleStatus?.(user)}
                        className="disabled:cursor-not-allowed disabled:opacity-60"
                        title={
                          isSelf
                            ? "No puede cambiar su propio estado"
                            : "Cambiar estado"
                        }
                      >
                        <Badge size="sm" color={user.estado ? "success" : "error"}>
                          {user.estado ? "Activo" : "Inactivo"}
                        </Badge>
                      </button>
                    </TableCell>

                    <TableCell className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          to={`/usuarios/${user.id}/editar`}
                          className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-200 dark:border-white/[0.05] dark:hover:bg-white/[0.05] transition"
                          title="Editar usuario"
                        >
                          <PencilIcon className="size-4" />
                        </Link>

                        <button
                          type="button"
                          disabled={isSelf || !onDelete}
                          onClick={() => onDelete?.(user)}
                          className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 hover:bg-red-50 hover:border-red-200 dark:border-white/[0.05] dark:hover:bg-red-500/10 transition disabled:cursor-not-allowed disabled:opacity-60"
                          title={
                            isSelf
                              ? "No puede eliminarse a sí mismo"
                              : "Eliminar usuario"
                          }
                        >
                          <TrashBinIcon className="size-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {meta && onPageChange && (
        <Pagination meta={meta} onPageChange={onPageChange} />
      )}
    </div>
  );
};

export default UserTable;
