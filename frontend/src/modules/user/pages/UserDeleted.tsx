import { useState } from "react";
import { Link } from "react-router-dom";

import ConfirmDialog from "@/components/common/ConfirmDialog";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import Pagination from "@/components/common/Pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import { useUsers } from "../hooks/useUsers";
import { restoreUser } from "../services/userService";
import { User } from "../types/user";

const UserDeleted = () => {
  const { users, loading, error, meta, setPage, refresh } = useUsers({
    deleted: true,
  });

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleRestore = async () => {
    if (!selectedUser) {
      return;
    }

    setProcessing(true);
    setActionError(null);

    try {
      await restoreUser(selectedUser.id);
      setDialogOpen(false);
      setSelectedUser(null);
      refresh();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "No se pudo restaurar el usuario.";
      setActionError(message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <div>Cargando usuarios eliminados...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Usuarios Eliminados</h1>
          <PageBreadCrumb
            pageTitle="Eliminados"
            items={[
              { title: "Gestión de Personal" },
              { title: "Usuarios", path: "/usuarios" },
              { title: "Eliminados" },
            ]}
          />
        </div>

        <Link
          to="/usuarios"
          className="inline-flex items-center rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-white/[0.05] dark:text-gray-300"
        >
          Volver al listado
        </Link>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
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
                  Rol
                </TableCell>
                <TableCell isHeader className="px-5 py-4 font-semibold text-start">
                  Estado
                </TableCell>
                <TableCell isHeader className="px-5 py-4 font-semibold text-center">
                  Acción
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {users.length === 0 ? (
                <TableRow>
                  <TableCell className="px-5 py-8 text-center text-gray-500" colSpan={5}>
                    No hay usuarios eliminados.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="px-5 py-4">
                      {user.nombre} {user.apellido}
                    </TableCell>
                    <TableCell className="px-5 py-4">{user.email}</TableCell>
                    <TableCell className="px-5 py-4">
                      {user.roles[0]?.name ?? "Sin rol"}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <Badge size="sm" color={user.estado ? "success" : "error"}>
                        {user.estado ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-center">
                      <button
                        type="button"
                        className="rounded-lg bg-brand-500 px-3 py-1.5 text-sm text-white hover:bg-brand-600"
                        onClick={() => {
                          setSelectedUser(user);
                          setActionError(null);
                          setDialogOpen(true);
                        }}
                      >
                        Restaurar
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <Pagination meta={meta} onPageChange={setPage} />
      </div>

      <ConfirmDialog
        isOpen={dialogOpen}
        title="Restaurar usuario"
        message={
          actionError
            ? `¿Desea restaurar a ${selectedUser?.nombre} ${selectedUser?.apellido}?\n\n${actionError}`
            : `¿Desea restaurar a ${selectedUser?.nombre} ${selectedUser?.apellido}?`
        }
        confirmLabel="Restaurar"
        loading={processing}
        onConfirm={handleRestore}
        onCancel={() => {
          setDialogOpen(false);
          setSelectedUser(null);
          setActionError(null);
        }}
      />
    </div>
  );
};

export default UserDeleted;
