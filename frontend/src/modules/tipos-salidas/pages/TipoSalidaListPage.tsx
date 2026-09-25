import { useState } from "react";

import ConfirmDialog from "@/components/common/ConfirmDialog";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import {
  TipoSalidaFiltersBar,
  TipoSalidaTable,
  TipoSalidaToolbar,
} from "../components";
import { useDeleteTipoSalida, useTiposSalidas } from "../hooks";
import { TipoSalida } from "../types";

export default function TipoSalidaListPage() {
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
  } = useTiposSalidas();
  const { execute, loading: processing, error: actionError, setError } =
    useDeleteTipoSalida();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTipo, setSelectedTipo] = useState<TipoSalida | null>(null);

  const openDialog = (tipo: TipoSalida) => {
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
    return <div>Cargando tipos de salida...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tipos de Salida</h1>
          <PageBreadCrumb pageTitle="Tipos de Salida" items={breadcrumbs.tiposSalidas} />
        </div>
        <TipoSalidaToolbar />
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

      <TipoSalidaFiltersBar filters={filters} onChange={updateFilters} />

      <TipoSalidaTable
        tipos={tipos}
        meta={meta}
        onPageChange={setPage}
        onDelete={openDialog}
      />

      <ConfirmDialog
        isOpen={dialogOpen}
        title="Eliminar tipo de salida"
        message={
          actionError
            ? `¿Desea eliminar el tipo ${selectedTipo?.nombre}?\n\n${actionError}`
            : `¿Desea eliminar el tipo ${selectedTipo?.nombre}? Quedará fuera del listado principal.`
        }
        confirmLabel="Eliminar"
        loading={processing}
        onConfirm={handleConfirm}
        onCancel={closeDialog}
      />
    </div>
  );
}
