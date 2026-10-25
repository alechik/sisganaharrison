import { useState } from "react";

import ConfirmDialog from "@/components/common/ConfirmDialog";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { TareaFiltersBar, TareaTable, TareaToolbar } from "../components";
import { useTareas, useTerminarTarea } from "../hooks";
import { Tarea } from "../types";

export default function TareaListPage() {
  const {
    tareas,
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
  } = useTareas();
  const { execute, loading: processing, error: actionError, setError } = useTerminarTarea();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<Tarea | null>(null);

  const openDialog = (tarea: Tarea) => {
    setSelected(tarea);
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
      const response = await execute(selected.id);
      showSuccess(response.message);
      closeDialog();
      refresh();
    } catch {
      // hook
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Tareas</h1>
          <PageBreadCrumb pageTitle="Tareas" items={breadcrumbs.tareas} />
        </div>
        <TareaToolbar />
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
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </div>
      )}

      {loading && tareas.length === 0 && !error && (
        <div className="text-sm text-gray-500 dark:text-gray-400">Cargando tareas...</div>
      )}

      <TareaFiltersBar filters={filters} onChange={updateFilters} />

      <TareaTable
        tareas={tareas}
        meta={meta}
        onPageChange={setPage}
        onTerminar={openDialog}
      />

      <ConfirmDialog
        isOpen={dialogOpen}
        title="Terminar tarea"
        message={
          actionError
            ? `¿Desea terminar la tarea ${selected?.codigo_tarea}?\n\n${actionError}`
            : `¿Desea terminar la tarea ${selected?.codigo_tarea}? Se registrará la fecha de fin y no podrá modificar la respuesta.`
        }
        confirmLabel="Terminar tarea"
        loading={processing}
        onConfirm={handleConfirm}
        onCancel={closeDialog}
      />
    </div>
  );
}
