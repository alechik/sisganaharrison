import { useState } from "react";

import ConfirmDialog from "@/components/common/ConfirmDialog";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import {
  TipoAlertaFiltersBar,
  TipoAlertaTable,
  TipoAlertaToolbar,
} from "../components";
import { useDeleteTipoAlerta, useTiposAlertas } from "../hooks";
import { TipoAlerta } from "../types";

type DialogAction = "delete" | "toggleStatus";

export default function TipoAlertaListPage() {
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
  } = useTiposAlertas();
  const { execute, loading: processing, error: actionError, setError } =
    useDeleteTipoAlerta();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<DialogAction>("delete");
  const [selectedTipo, setSelectedTipo] = useState<TipoAlerta | null>(null);

  const openDialog = (action: DialogAction, tipo: TipoAlerta) => {
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
    return <div>Cargando Tipos de Alerta...</div>;
  }

  const dialogCopy =
    dialogAction === "delete"
      ? {
          title: "Eliminar tipo de alerta",
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
          <h1 className="text-2xl font-bold">Tipos de Alerta</h1>
          <PageBreadCrumb
            pageTitle="Tipos de Alerta"
            items={breadcrumbs.tiposAlertas}
          />
        </div>
        <TipoAlertaToolbar />
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

      <TipoAlertaFiltersBar filters={filters} onChange={updateFilters} />

      <TipoAlertaTable
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
