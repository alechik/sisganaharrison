import { useState } from "react";

import ConfirmDialog from "@/components/common/ConfirmDialog";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import UserTable from "../components/UserTable";
import { useUsers } from "../hooks/useUsers";
import { changeUserStatus, deleteUser } from "../services/userService";
import { User } from "../types/user";
import { getCurrentUserId } from "../utils/currentUser";

type DialogAction = "delete" | "toggleStatus";

const UserList = () => {
  const { users, loading, error, meta, setPage, refresh } = useUsers();
  const currentUserId = getCurrentUserId();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<DialogAction>("delete");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [processing, setProcessing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const openDialog = (action: DialogAction, user: User) => {
    setDialogAction(action);
    setSelectedUser(user);
    setActionError(null);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedUser(null);
    setActionError(null);
  };

  const handleConfirm = async () => {
    if (!selectedUser) {
      return;
    }

    setProcessing(true);
    setActionError(null);

    try {
      if (dialogAction === "delete") {
        await deleteUser(selectedUser.id);
      } else {
        await changeUserStatus(selectedUser.id);
      }

      closeDialog();
      refresh();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "No se pudo completar la acción.";
      setActionError(message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <div>Cargando usuarios...</div>;
  }

  const dialogCopy =
    dialogAction === "delete"
      ? {
          title: "Eliminar usuario",
          message: `¿Desea eliminar a ${selectedUser?.nombre} ${selectedUser?.apellido}? El usuario quedará inactivo y fuera del listado principal.`,
          confirmLabel: "Eliminar",
        }
      : {
          title: selectedUser?.estado ? "Desactivar usuario" : "Activar usuario",
          message: selectedUser?.estado
            ? `¿Desea desactivar a ${selectedUser?.nombre} ${selectedUser?.apellido}?`
            : `¿Desea activar a ${selectedUser?.nombre} ${selectedUser?.apellido}?`,
          confirmLabel: selectedUser?.estado ? "Desactivar" : "Activar",
        };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Lista de Usuarios</h1>
        <PageBreadCrumb pageTitle="Usuarios" items={breadcrumbs.usuarios} />
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {actionError && !dialogOpen && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {actionError}
        </div>
      )}

      <UserTable
        users={users}
        meta={meta}
        currentUserId={currentUserId}
        onPageChange={setPage}
        onToggleStatus={(user) => openDialog("toggleStatus", user)}
        onDelete={(user) => openDialog("delete", user)}
      />

      <ConfirmDialog
        isOpen={dialogOpen}
        title={dialogCopy.title}
        message={
          actionError
            ? `${dialogCopy.message}\n\n${actionError}`
            : dialogCopy.message
        }
        confirmLabel={dialogCopy.confirmLabel}
        loading={processing}
        onConfirm={handleConfirm}
        onCancel={closeDialog}
      />
    </div>
  );
};

export default UserList;
