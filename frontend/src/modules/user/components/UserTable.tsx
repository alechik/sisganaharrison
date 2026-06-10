import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import Badge from "@/components/ui/badge/Badge";
import { Link } from "react-router-dom";

import {
  PencilIcon,
  TrashBinIcon,
  UserCircleIcon,
} from "@/icons";

import { User } from "../types/user";

interface Props {
  users: User[];
}

const UserTable = ({ users }: Props) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">

      {/* HEADER */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/[0.05]">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Gestión de Usuarios
          </h3>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Lista general de usuarios registrados
          </p>
        </div>
        
        <Link
            to="/usuarios/crear"
            className="
            inline-flex items-center gap-2
            rounded-lg
            bg-brand-500
            px-4 py-2
            text-sm font-medium
            text-white
            hover:bg-brand-600
            transition
            "
        >
            + Nuevo Usuario
        </Link>
      </div>

      {/* TABLA */}
      <div className="max-w-full overflow-x-auto">
        <Table>

          {/* CABECERA */}
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>

              <TableCell
                isHeader
                className="px-5 py-4 font-semibold text-start"
              >
                Usuario
              </TableCell>

              <TableCell
                isHeader
                className="px-5 py-4 font-semibold text-start"
              >
                Email
              </TableCell>

              <TableCell
                isHeader
                className="px-5 py-4 font-semibold text-start"
              >
                Teléfono
              </TableCell>

              <TableCell
                isHeader
                className="px-5 py-4 font-semibold text-start"
              >
                Cargo
              </TableCell>

              <TableCell
                isHeader
                className="px-5 py-4 font-semibold text-start"
              >
                Estado
              </TableCell>

              <TableCell
                isHeader
                className="px-5 py-4 font-semibold text-center"
              >
                Opciones
              </TableCell>

            </TableRow>
          </TableHeader>

          {/* BODY */}
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">

            {users.map((user) => (
              <TableRow
                key={user.id}
                className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition"
              >

                {/* USUARIO */}
                <TableCell className="px-5 py-4">

                  <div className="flex items-center gap-3">

                    {/* Avatar */}
                    <div className="flex items-center justify-center w-11 h-11 rounded-full bg-brand-100 dark:bg-brand-500/20">

                      <UserCircleIcon className="text-brand-500 size-6" />

                    </div>

                    {/* Info */}
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

                {/* EMAIL */}
                <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                  {user.email}
                </TableCell>

                {/* TELEFONO */}
                <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                  {user.telefono || "Sin teléfono"}
                </TableCell>

                {/* ROLES */}
                <TableCell className="px-5 py-4">

                  <div className="flex flex-wrap gap-2">

                    {user.roles.length > 0 ? (
                      user.roles.map((role) => (
                        <Badge
                          key={role.id}
                          size="sm"
                          color="primary"
                        >
                          {role.name}
                        </Badge>
                      ))
                    ) : (
                      <Badge
                        size="sm"
                        color="warning"
                      >
                        Sin rol
                      </Badge>
                    )}

                  </div>

                </TableCell>

                {/* ESTADO */}
                <TableCell className="px-5 py-4">

                  <Badge
                    size="sm"
                    color={user.estado ? "success" : "error"}
                  >
                    {user.estado ? "Activo" : "Inactivo"}
                  </Badge>

                </TableCell>

                {/* OPCIONES */}
                <TableCell className="px-5 py-4">

                  <div className="flex items-center justify-center gap-2">

                    {/* Editar */}
                    <button
                      className="
                        flex items-center justify-center
                        w-9 h-9 rounded-lg
                        border border-gray-200
                        hover:bg-blue-50
                        hover:border-blue-200
                        dark:border-white/[0.05]
                        dark:hover:bg-white/[0.05]
                        transition
                      "
                    >
                      <PencilIcon className="size-4" />
                    </button>

                    {/* Eliminar / Desactivar */}
                    <button
                      className="
                        flex items-center justify-center
                        w-9 h-9 rounded-lg
                        border border-gray-200
                        hover:bg-red-50
                        hover:border-red-200
                        dark:border-white/[0.05]
                        dark:hover:bg-red-500/10
                        transition
                      "
                    >
                      <TrashBinIcon className="size-4" />
                    </button>

                  </div>

                </TableCell>

              </TableRow>
            ))}

          </TableBody>

        </Table>
      </div>
    </div>
  );
};

export default UserTable;