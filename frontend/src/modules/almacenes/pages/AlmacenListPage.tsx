import { useState } from "react";

import ConfirmDialog from "@/components/common/ConfirmDialog";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { AlmacenFiltersBar, AlmacenTable, AlmacenToolbar } from "../components";
import { useAlmacenes, useDeleteAlmacen } from "../hooks";
import { Almacen } from "../types";

type DialogAction = "delete" | "toggleStatus";

export default function AlmacenListPage() {
  const {
    almacenes,
    loading,
    error,
    meta,
    filters,
    successMessage,
    setPage,
    updateFilters,
    refresh,
    showSuccess,
    clearSuccess,
  } = useAlmacenes();
  const { execute, loading: processing, error: actionError, setError } = useDeleteAlmacen();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<DialogAction>("delete");
  const [selected, setSelected] = useState<Almacen | null>(null);

  const openDialog = (action: DialogAction, item: Almacen) => {
    setDialogAction(action);
    setSelected(item);
    setError(null);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelected(null);
    setError(null);
  };

  const handleConfirm = async () => {
    if (!selected) {
      return;
    }

    try {
      const response = await execute(selected.id, dialogAction === "delete" ? "delete" : "toggleStatus");
      showSuccess(response.message);
      closeDialog();
      refresh();
    } catch {
      // handled
    }
  };

  if (loading && almacenes.length === 0) {
    return <div>Cargando almacenes...</div>;
  }

  const dialogCopy =
    dialogAction === "delete"
      ? {
          title: "Eliminar almacén",
          message: `¿Desea eliminar el almacén ${selected?.nombre}? Quedará inactivo y fuera del listado principal.`,
          confirmLabel: "Eliminar",
        }
      : {
          title: selected?.activo ? "Desactivar almacén" : "Activar almacén",
          message: selected?.activo
            ? `¿Desea desactivar el almacén ${selected?.nombre}?`
            : `¿Desea activar el almacén ${selected?.nombre}?`,
          confirmLabel: selected?.activo ? "Desactivar" : "Activar",
        };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Almacenes</h1>
          <PageBreadCrumb pageTitle="Almacenes" items={breadcrumbs.almacenes} />
        </div>
        <AlmacenToolbar />
      </div>

      {successMessage && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-300">
          {successMessage}
          <button type="button" className="ml-3 underline" onClick={clearSuccess}>
            Cerrar
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <AlmacenFiltersBar filters={filters} onChange={updateFilters} />

      <AlmacenTable
        almacenes={almacenes}
        meta={meta}
        onPageChange={setPage}
        onToggleStatus={(item) => openDialog("toggleStatus", item)}
        onDelete={(item) => openDialog("delete", item)}
      />

      <ConfirmDialog
        isOpen={dialogOpen}
        title={dialogCopy.title}
        message={actionError ? `${dialogCopy.message}\n\n${actionError}` : dialogCopy.message}
        confirmLabel={dialogCopy.confirmLabel}
        loading={processing}
        onConfirm={handleConfirm}
        onCancel={closeDialog}
      />
    </div>
  );
}
