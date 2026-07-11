import { useState } from "react";

import ConfirmDialog from "@/components/common/ConfirmDialog";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { RazaFiltersBar, RazaTable, RazaToolbar } from "../components";
import { useDeleteRaza, useRazas } from "../hooks";
import { Raza } from "../types";

type DialogAction = "delete" | "toggleStatus";

export default function RazaListPage() {
  const {
    razas,
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
  } = useRazas();
  const { execute, loading: processing, error: actionError, setError } = useDeleteRaza();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<DialogAction>("delete");
  const [selectedRaza, setSelectedRaza] = useState<Raza | null>(null);

  const openDialog = (action: DialogAction, raza: Raza) => {
    setDialogAction(action);
    setSelectedRaza(raza);
    setError(null);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedRaza(null);
    setError(null);
  };

  const handleConfirm = async () => {
    if (!selectedRaza) {
      return;
    }

    try {
      const response = await execute(
        selectedRaza.id,
        dialogAction === "delete" ? "delete" : "toggleStatus"
      );
      showSuccess(response.message);
      closeDialog();
      refresh();
    } catch {
      // Error handled in hook
    }
  };

  if (loading && razas.length === 0) {
    return <div>Cargando razas...</div>;
  }

  const dialogCopy =
    dialogAction === "delete"
      ? {
          title: "Eliminar raza",
          message: `¿Desea eliminar la raza ${selectedRaza?.nombre}? Quedará inactiva y fuera del listado principal.`,
          confirmLabel: "Eliminar",
        }
      : {
          title: selectedRaza?.estado ? "Desactivar raza" : "Activar raza",
          message: selectedRaza?.estado
            ? `¿Desea desactivar la raza ${selectedRaza?.nombre}?`
            : `¿Desea activar la raza ${selectedRaza?.nombre}?`,
          confirmLabel: selectedRaza?.estado ? "Desactivar" : "Activar",
        };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Catálogo de Razas</h1>
          <PageBreadCrumb pageTitle="Razas" items={breadcrumbs.razas} />
        </div>
        <RazaToolbar />
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

      <RazaFiltersBar filters={filters} onChange={updateFilters} />

      <RazaTable
        razas={razas}
        meta={meta}
        onPageChange={setPage}
        onToggleStatus={(raza) => openDialog("toggleStatus", raza)}
        onDelete={(raza) => openDialog("delete", raza)}
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
}
