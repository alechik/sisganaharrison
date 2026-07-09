import { useState } from "react";

import ConfirmDialog from "@/components/common/ConfirmDialog";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import {
  EstablecimientoFiltersBar,
  EstablecimientoTable,
  EstablecimientoToolbar,
} from "../components";
import { useDeleteEstablecimiento, useEstablecimientos } from "../hooks";
import { Establecimiento } from "../types";

type DialogAction = "delete" | "toggleStatus";

export default function EstablecimientoListPage() {
  const {
    establecimientos,
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
  } = useEstablecimientos();
  const { execute, loading: processing, error: actionError, setError } =
    useDeleteEstablecimiento();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<DialogAction>("delete");
  const [selected, setSelected] = useState<Establecimiento | null>(null);

  const openDialog = (action: DialogAction, establecimiento: Establecimiento) => {
    setDialogAction(action);
    setSelected(establecimiento);
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

  if (loading && establecimientos.length === 0) {
    return <div>Cargando establecimientos...</div>;
  }

  const dialogCopy =
    dialogAction === "delete"
      ? {
          title: "Eliminar establecimiento",
          message: `¿Desea eliminar el establecimiento ${selected?.nombre}? Quedará inactivo y fuera del listado principal.`,
          confirmLabel: "Eliminar",
        }
      : {
          title: selected?.activo ? "Desactivar establecimiento" : "Activar establecimiento",
          message: selected?.activo
            ? `¿Desea desactivar el establecimiento ${selected?.nombre}?`
            : `¿Desea activar el establecimiento ${selected?.nombre}?`,
          confirmLabel: selected?.activo ? "Desactivar" : "Activar",
        };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Establecimientos</h1>
          <PageBreadCrumb
            pageTitle="Establecimientos"
            items={breadcrumbs.establecimientos}
          />
        </div>
        <EstablecimientoToolbar />
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

      <EstablecimientoFiltersBar filters={filters} onChange={updateFilters} />

      <EstablecimientoTable
        establecimientos={establecimientos}
        meta={meta}
        onPageChange={setPage}
        onToggleStatus={(establecimiento) => openDialog("toggleStatus", establecimiento)}
        onDelete={(establecimiento) => openDialog("delete", establecimiento)}
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
