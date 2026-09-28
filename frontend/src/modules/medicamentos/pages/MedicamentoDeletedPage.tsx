import { useState } from "react";
import { Link } from "react-router-dom";

import ConfirmDialog from "@/components/common/ConfirmDialog";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { MedicamentoTable } from "../components";
import { MEDICAMENTO_ROUTES } from "../constants";
import { useDeleteMedicamento, useMedicamentos } from "../hooks";
import { Medicamento } from "../types";

export default function MedicamentoDeletedPage() {
  const {
    medicamentos,
    loading,
    error,
    meta,
    setPage,
    refresh,
    showSuccess,
    successMessage,
    clearSuccess,
  } = useMedicamentos({ deleted: true });
  const { execute, loading: processing, error: actionError, setError } =
    useDeleteMedicamento();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMedicamento, setSelectedMedicamento] = useState<Medicamento | null>(null);

  const openDialog = (medicamento: Medicamento) => {
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
      const response = await execute(selectedMedicamento.id, "restore");
      showSuccess(response.message);
      closeDialog();
      refresh();
    } catch {
      // Error handled in hook
    }
  };

  if (loading && medicamentos.length === 0) {
    return <div>Cargando medicamentos eliminadas...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Medicamentos Eliminados</h1>
          <PageBreadCrumb
            pageTitle="Eliminadas"
            items={breadcrumbs.medicamentosEliminadas}
          />
        </div>
        <Link
          to={MEDICAMENTO_ROUTES.list}
          className="inline-flex items-center rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-white/[0.05] dark:text-gray-300 dark:hover:bg-white/[0.05]"
        >
          Volver al listado
        </Link>
      </div>

      {successMessage && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
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

      <MedicamentoTable
        medicamentos={medicamentos}
        meta={meta}
        deletedView
        onPageChange={setPage}
        onRestore={openDialog}
      />

      <ConfirmDialog
        isOpen={dialogOpen}
        title="Restaurar medicamento"
        message={
          actionError
            ? `¿Desea restaurar la medicamento ${selectedMedicamento?.nombre}?\n\n${actionError}`
            : `¿Desea restaurar la medicamento ${selectedMedicamento?.nombre}?`
        }
        confirmLabel="Restaurar"
        loading={processing}
        onConfirm={handleConfirm}
        onCancel={closeDialog}
      />
    </div>
  );
}
