import { useState } from "react";

import ConfirmDialog from "@/components/common/ConfirmDialog";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import {
  EstanciaFiltersBar,
  EstanciaTable,
  EstanciaToolbar,
} from "../components";
import { useDeleteEstancia, useEstancias } from "../hooks";
import { Estancia } from "../types";

type DialogAction = "delete" | "toggleStatus";

export default function EstanciaListPage() {
  const {
    estancias,
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
  } = useEstancias();
  const { execute, loading: processing, error: actionError, setError } =
    useDeleteEstancia();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<DialogAction>("delete");
  const [selected, setSelected] = useState<Estancia | null>(null);

  const openDialog = (action: DialogAction, estancia: Estancia) => {
    setDialogAction(action);
    setSelected(estancia);
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

  if (loading && estancias.length === 0) {
    return <div>Cargando estancias...</div>;
  }

  const dialogCopy =
    dialogAction === "delete"
      ? {
          title: "Eliminar estancia",
          message: `¿Desea eliminar la estancia ${selected?.nombre}? Quedará inactiva y fuera del listado principal.`,
          confirmLabel: "Eliminar",
        }
      : {
          title: selected?.activo ? "Desactivar estancia" : "Activar estancia",
          message: selected?.activo
            ? `¿Desea desactivar la estancia ${selected?.nombre}?`
            : `¿Desea activar la estancia ${selected?.nombre}?`,
          confirmLabel: selected?.activo ? "Desactivar" : "Activar",
        };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Estancias</h1>
          <PageBreadCrumb
            pageTitle="Estancias"
            items={breadcrumbs.estancias}
          />
        </div>
        <EstanciaToolbar />
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

      <EstanciaFiltersBar filters={filters} onChange={updateFilters} />

      <EstanciaTable
        estancias={estancias}
        meta={meta}
        onPageChange={setPage}
        onToggleStatus={(estancia) => openDialog("toggleStatus", estancia)}
        onDelete={(estancia) => openDialog("delete", estancia)}
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
