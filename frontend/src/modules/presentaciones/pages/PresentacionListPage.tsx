import { useState } from "react";

import ConfirmDialog from "@/components/common/ConfirmDialog";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import {
  PresentacionFiltersBar,
  PresentacionTable,
  PresentacionToolbar,
} from "../components";
import { useDeletePresentacion, usePresentaciones } from "../hooks";
import { Presentacion } from "../types";

export default function PresentacionListPage() {
  const {
    tipos,
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
  } = usePresentaciones();
  const { execute, loading: processing, error: actionError, setError } =
    useDeletePresentacion();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTipo, setSelectedTipo] = useState<Presentacion | null>(null);

  const openDialog = (tipo: Presentacion) => {
    setSelectedTipo(tipo);
    setError(null);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedTipo(null);
    setError(null);
  };

  const handleConfirm = async () => {
    if (!selectedTipo) {
      return;
    }

    try {
      const response = await execute(selectedTipo.id, "delete");
      showSuccess(response.message);
      closeDialog();
      refresh();
    } catch {
      // handled
    }
  };

  if (loading && tipos.length === 0) {
    return <div>Cargando presentaciones...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Presentaciones</h1>
          <PageBreadCrumb pageTitle="Presentaciones" items={breadcrumbs.presentaciones} />
        </div>
        <PresentacionToolbar />
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

      <PresentacionFiltersBar filters={filters} onChange={updateFilters} />

      <PresentacionTable
        tipos={tipos}
        meta={meta}
        onPageChange={setPage}
        onDelete={openDialog}
      />

      <ConfirmDialog
        isOpen={dialogOpen}
        title="Eliminar presentación"
        message={
          actionError
            ? `¿Desea eliminar la presentación ${selectedTipo?.descripcion}?\n\n${actionError}`
            : `¿Desea eliminar la presentación ${selectedTipo?.descripcion}? Quedará fuera del listado principal.`
        }
        confirmLabel="Eliminar"
        loading={processing}
        onConfirm={handleConfirm}
        onCancel={closeDialog}
      />
    </div>
  );
}
