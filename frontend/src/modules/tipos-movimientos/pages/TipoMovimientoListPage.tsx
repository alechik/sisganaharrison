import { useState } from "react";

import ConfirmDialog from "@/components/common/ConfirmDialog";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import {
  TipoMovimientoFiltersBar,
  TipoMovimientoTable,
  TipoMovimientoToolbar,
} from "../components";
import { useDeleteTipoMovimiento, useTiposMovimientos } from "../hooks";
import { TipoMovimiento } from "../types";

type DialogAction = "delete" | "toggleStatus";

export default function TipoMovimientoListPage() {
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
  } = useTiposMovimientos();
  const { execute, loading: processing, error: actionError, setError } =
    useDeleteTipoMovimiento();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<DialogAction>("delete");
  const [selectedTipo, setSelectedTipo] = useState<TipoMovimiento | null>(null);

  const openDialog = (action: DialogAction, tipo: TipoMovimiento) => {
    setDialogAction(action);
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
      const response = await execute(
        selectedTipo.id,
        dialogAction === "delete" ? "delete" : "toggleStatus"
      );
      showSuccess(response.message);
      closeDialog();
      refresh();
    } catch {
      // Error handled in hook
    }
  };

  if (loading && tipos.length === 0) {
    return <div>Cargando Tipos de Movimiento...</div>;
  }

  const dialogCopy =
    dialogAction === "delete"
      ? {
          title: "Eliminar tipo de movimiento",
          message: `¿Desea eliminar el tipo ${selectedTipo?.nombre}? Quedará inactivo y fuera del listado principal.`,
          confirmLabel: "Eliminar",
        }
      : {
          title: selectedTipo?.activo ? "Desactivar tipo" : "Activar tipo",
          message: selectedTipo?.activo
            ? `¿Desea desactivar el tipo ${selectedTipo?.nombre}?`
            : `¿Desea activar el tipo ${selectedTipo?.nombre}?`,
          confirmLabel: selectedTipo?.activo ? "Desactivar" : "Activar",
        };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tipos de Movimiento</h1>
          <PageBreadCrumb
            pageTitle="Tipos de Movimiento"
            items={breadcrumbs.tiposMovimientos}
          />
        </div>
        <TipoMovimientoToolbar />
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

      <TipoMovimientoFiltersBar filters={filters} onChange={updateFilters} />

      <TipoMovimientoTable
        tipos={tipos}
        meta={meta}
        onPageChange={setPage}
        onToggleStatus={(tipo) => openDialog("toggleStatus", tipo)}
        onDelete={(tipo) => openDialog("delete", tipo)}
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
