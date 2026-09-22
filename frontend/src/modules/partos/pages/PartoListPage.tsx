import { useState } from "react";

import ConfirmDialog from "@/components/common/ConfirmDialog";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { PartoFiltersBar, PartoTable, PartoToolbar } from "../components";
import { useFinalizarParto, usePartos } from "../hooks";
import { Parto } from "../types";

export default function PartoListPage() {
  const {
    partos,
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
  } = usePartos();
  const { finalizar, loading: finishing, error: actionError, setError } = useFinalizarParto();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedParto, setSelectedParto] = useState<Parto | null>(null);

  const openDialog = (parto: Parto) => {
    setSelectedParto(parto);
    setError(null);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedParto(null);
    setError(null);
  };

  const handleConfirm = async () => {
    if (!selectedParto) {
      return;
    }

    try {
      const response = await finalizar(selectedParto.id);
      showSuccess(response.message);
      closeDialog();
      refresh();
    } catch {
      // Error handled in hook
    }
  };

  if (loading && partos.length === 0) {
    return <div>Cargando partos...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Partos</h1>
          <PageBreadCrumb pageTitle="Partos" items={breadcrumbs.partos} />
        </div>
        <PartoToolbar />
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

      <PartoFiltersBar filters={filters} onChange={updateFilters} />

      <PartoTable
        partos={partos}
        meta={meta}
        onPageChange={setPage}
        onFinalizar={openDialog}
      />

      <ConfirmDialog
        isOpen={dialogOpen}
        title="Finalizar parto"
        message={
          actionError
            ? `¿Desea marcar el parto #${selectedParto?.id} como FINALIZADA?\n\n${actionError}`
            : `¿Desea marcar el parto #${selectedParto?.id} como FINALIZADA? Dejará de estar disponible para registrar nacimientos.`
        }
        confirmLabel="Finalizar"
        loading={finishing}
        onConfirm={handleConfirm}
        onCancel={closeDialog}
      />
    </div>
  );
}
