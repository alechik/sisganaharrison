import { useState } from "react";

import ConfirmDialog from "@/components/common/ConfirmDialog";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { MedicamentoFiltersBar, MedicamentoTable, MedicamentoToolbar } from "../components";
import { useDeleteMedicamento, useMedicamentos } from "../hooks";
import { Medicamento } from "../types";

type DialogAction = "delete" | "toggleStatus";

export default function MedicamentoListPage() {
  const {
    medicamentos,
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
  } = useMedicamentos();
  const { execute, loading: processing, error: actionError, setError } =
    useDeleteMedicamento();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<DialogAction>("delete");
  const [selectedMedicamento, setSelectedMedicamento] = useState<Medicamento | null>(null);

  const openDialog = (action: DialogAction, medicamento: Medicamento) => {
    setDialogAction(action);
    setSelectedMedicamento(medicamento);
    setError(null);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedMedicamento(null);
    setError(null);
  };

  const handleConfirm = async () => {
    if (!selectedMedicamento) {
      return;
    }

    try {
      const response = await execute(
        selectedMedicamento.id,
        dialogAction === "delete" ? "delete" : "toggleStatus"
      );
      showSuccess(response.message);
      closeDialog();
      refresh();
    } catch {
      // Error handled in hook
    }
  };

  if (loading && medicamentos.length === 0) {
    return <div>Cargando medicamentos...</div>;
  }

  const dialogCopy =
    dialogAction === "delete"
      ? {
          title: "Eliminar medicamento",
          message: `¿Desea eliminar el medicamento ${selectedMedicamento?.nombre}? Quedará inactivo y fuera del listado principal.`,
          confirmLabel: "Eliminar",
        }
      : {
          title: selectedMedicamento?.activo ? "Desactivar medicamento" : "Activar medicamento",
          message: selectedMedicamento?.activo
            ? `¿Desea desactivar el medicamento ${selectedMedicamento?.nombre}?`
            : `¿Desea activar el medicamento ${selectedMedicamento?.nombre}?`,
          confirmLabel: selectedMedicamento?.activo ? "Desactivar" : "Activar",
        };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Medicamentos</h1>
          <PageBreadCrumb pageTitle="Medicamentos" items={breadcrumbs.medicamentos} />
        </div>
        <MedicamentoToolbar />
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

      <MedicamentoFiltersBar filters={filters} onChange={updateFilters} />

      <MedicamentoTable
        medicamentos={medicamentos}
        meta={meta}
        onPageChange={setPage}
        onToggleStatus={(medicamento) => openDialog("toggleStatus", medicamento)}
        onDelete={(medicamento) => openDialog("delete", medicamento)}
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
