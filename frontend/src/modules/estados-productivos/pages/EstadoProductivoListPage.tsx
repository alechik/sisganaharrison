import { useState } from "react";

import ConfirmDialog from "@/components/common/ConfirmDialog";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import {
  EstadoProductivoFiltersBar,
  EstadoProductivoTable,
  EstadoProductivoToolbar,
} from "../components";
import { useDeleteEstadoProductivo, useEstadosProductivos } from "../hooks";
import { EstadoProductivo } from "../types";

type DialogAction = "delete" | "toggleStatus";

export default function EstadoProductivoListPage() {
  const {
    estados,
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
  } = useEstadosProductivos();
  const { execute, loading: processing, error: actionError, setError } =
    useDeleteEstadoProductivo();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<DialogAction>("delete");
  const [selectedEstado, setSelectedEstado] = useState<EstadoProductivo | null>(null);

  const openDialog = (action: DialogAction, estado: EstadoProductivo) => {
    setDialogAction(action);
    setSelectedEstado(estado);
    setError(null);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedEstado(null);
    setError(null);
  };

  const handleConfirm = async () => {
    if (!selectedEstado) {
      return;
    }

    try {
      const response = await execute(
        selectedEstado.id,
        dialogAction === "delete" ? "delete" : "toggleStatus"
      );
      showSuccess(response.message);
      closeDialog();
      refresh();
    } catch {
      // Error handled in hook
    }
  };

  if (loading && estados.length === 0) {
    return <div>Cargando estados productivos...</div>;
  }

  const dialogCopy =
    dialogAction === "delete"
      ? {
          title: "Eliminar estado productivo",
          message: `¿Desea eliminar el estado ${selectedEstado?.nombre}? Quedará inactivo y fuera del listado principal.`,
          confirmLabel: "Eliminar",
        }
      : {
          title: selectedEstado?.activo ? "Desactivar estado" : "Activar estado",
          message: selectedEstado?.activo
            ? `¿Desea desactivar el estado ${selectedEstado?.nombre}?`
            : `¿Desea activar el estado ${selectedEstado?.nombre}?`,
          confirmLabel: selectedEstado?.activo ? "Desactivar" : "Activar",
        };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Estados Productivos</h1>
          <PageBreadCrumb
            pageTitle="Estados Productivos"
            items={breadcrumbs.estadosProductivos}
          />
        </div>
        <EstadoProductivoToolbar />
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

      <EstadoProductivoFiltersBar filters={filters} onChange={updateFilters} />

      <EstadoProductivoTable
        estados={estados}
        meta={meta}
        onPageChange={setPage}
        onToggleStatus={(estado) => openDialog("toggleStatus", estado)}
        onDelete={(estado) => openDialog("delete", estado)}
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
