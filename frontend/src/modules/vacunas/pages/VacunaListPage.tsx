import { useState } from "react";

import ConfirmDialog from "@/components/common/ConfirmDialog";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { VacunaFiltersBar, VacunaTable, VacunaToolbar } from "../components";
import { useDeleteVacuna, useVacunas } from "../hooks";
import { Vacuna } from "../types";

type DialogAction = "delete" | "toggleStatus";

export default function VacunaListPage() {
  const {
    vacunas,
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
  } = useVacunas();
  const { execute, loading: processing, error: actionError, setError } =
    useDeleteVacuna();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<DialogAction>("delete");
  const [selectedVacuna, setSelectedVacuna] = useState<Vacuna | null>(null);

  const openDialog = (action: DialogAction, vacuna: Vacuna) => {
    setDialogAction(action);
    setSelectedVacuna(vacuna);
    setError(null);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedVacuna(null);
    setError(null);
  };

  const handleConfirm = async () => {
    if (!selectedVacuna) {
      return;
    }

    try {
      const response = await execute(
        selectedVacuna.id,
        dialogAction === "delete" ? "delete" : "toggleStatus"
      );
      showSuccess(response.message);
      closeDialog();
      refresh();
    } catch {
      // Error handled in hook
    }
  };

  if (loading && vacunas.length === 0) {
    return <div>Cargando vacunas...</div>;
  }

  const dialogCopy =
    dialogAction === "delete"
      ? {
          title: "Eliminar vacuna",
          message: `¿Desea eliminar la vacuna ${selectedVacuna?.nombre}? Quedará inactiva y fuera del listado principal.`,
          confirmLabel: "Eliminar",
        }
      : {
          title: selectedVacuna?.activo ? "Desactivar vacuna" : "Activar vacuna",
          message: selectedVacuna?.activo
            ? `¿Desea desactivar la vacuna ${selectedVacuna?.nombre}?`
            : `¿Desea activar la vacuna ${selectedVacuna?.nombre}?`,
          confirmLabel: selectedVacuna?.activo ? "Desactivar" : "Activar",
        };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Vacunas</h1>
          <PageBreadCrumb pageTitle="Vacunas" items={breadcrumbs.vacunas} />
        </div>
        <VacunaToolbar />
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

      <VacunaFiltersBar filters={filters} onChange={updateFilters} />

      <VacunaTable
        vacunas={vacunas}
        meta={meta}
        onPageChange={setPage}
        onToggleStatus={(vacuna) => openDialog("toggleStatus", vacuna)}
        onDelete={(vacuna) => openDialog("delete", vacuna)}
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
