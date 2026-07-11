import { useState } from "react";

import ConfirmDialog from "@/components/common/ConfirmDialog";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { LoteFiltersBar, LoteTable, LoteToolbar } from "../components";
import { useDeleteLote, useLotes } from "../hooks";
import { Lote } from "../types";

type DialogAction = "delete" | "toggleStatus";

export default function LoteListPage() {
  const {
    lotes,
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
  } = useLotes();
  const { execute, loading: processing, error: actionError, setError } =
    useDeleteLote();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<DialogAction>("delete");
  const [selected, setSelected] = useState<Lote | null>(null);

  const openDialog = (action: DialogAction, lote: Lote) => {
    setDialogAction(action);
    setSelected(lote);
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
      const response = await execute(
        selected.id,
        dialogAction === "delete" ? "delete" : "toggleStatus"
      );
      showSuccess(response.message);
      closeDialog();
      refresh();
    } catch {
      // Error handled in hook
    }
  };

  if (loading && lotes.length === 0) {
    return <div>Cargando lotes...</div>;
  }

  const dialogCopy =
    dialogAction === "delete"
      ? {
          title: "Eliminar lote",
          message: `¿Desea eliminar el lote ${selected?.nombre}? Quedará inactivo y fuera del listado principal.`,
          confirmLabel: "Eliminar",
        }
      : {
          title: selected?.activo ? "Desactivar lote" : "Activar lote",
          message: selected?.activo
            ? `¿Desea desactivar el lote ${selected?.nombre}?`
            : `¿Desea activar el lote ${selected?.nombre}?`,
          confirmLabel: selected?.activo ? "Desactivar" : "Activar",
        };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Lotes</h1>
          <PageBreadCrumb pageTitle="Lotes" items={breadcrumbs.lotes} />
        </div>
        <LoteToolbar />
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

      <LoteFiltersBar filters={filters} onChange={updateFilters} />

      <LoteTable
        lotes={lotes}
        meta={meta}
        onPageChange={setPage}
        onToggleStatus={(lote) => openDialog("toggleStatus", lote)}
        onDelete={(lote) => openDialog("delete", lote)}
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
