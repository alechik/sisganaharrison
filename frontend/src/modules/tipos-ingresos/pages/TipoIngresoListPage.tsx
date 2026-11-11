import { useState } from "react";

import ConfirmDialog from "@/components/common/ConfirmDialog";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { TipoIngresoFiltersBar, TipoIngresoTable, TipoIngresoToolbar } from "../components";
import { useDeleteTipoIngreso, useTiposIngresos } from "../hooks";
import { TipoIngreso } from "../types";

type DialogAction = "delete" | "toggleStatus";

export default function TipoIngresoListPage() {
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
  } = useTiposIngresos();
  const { execute, loading: processing, error: actionError, setError } = useDeleteTipoIngreso();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<DialogAction>("delete");
  const [selected, setSelected] = useState<TipoIngreso | null>(null);

  const openDialog = (action: DialogAction, tipo: TipoIngreso) => {
    setDialogAction(action);
    setSelected(tipo);
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

  if (loading && tipos.length === 0) {
    return <div>Cargando tipos de ingreso...</div>;
  }

  const dialogCopy =
    dialogAction === "delete"
      ? {
          title: "Eliminar tipo de ingreso",
          message: `¿Desea eliminar el tipo ${selected?.nombre}? Quedará inactivo y fuera del listado principal.`,
          confirmLabel: "Eliminar",
        }
      : {
          title: selected?.estado ? "Desactivar tipo" : "Activar tipo",
          message: selected?.estado
            ? `¿Desea desactivar el tipo ${selected?.nombre}?`
            : `¿Desea activar el tipo ${selected?.nombre}?`,
          confirmLabel: selected?.estado ? "Desactivar" : "Activar",
        };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Tipos de ingreso</h1>
          <PageBreadCrumb pageTitle="Tipos de ingreso" items={breadcrumbs.tiposIngresos} />
        </div>
        <TipoIngresoToolbar />
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

      <TipoIngresoFiltersBar filters={filters} onChange={updateFilters} />
      <TipoIngresoTable
        tipos={tipos}
        meta={meta}
        onPageChange={setPage}
        onToggleStatus={(tipo) => openDialog("toggleStatus", tipo)}
        onDelete={(tipo) => openDialog("delete", tipo)}
      />

      <ConfirmDialog
        isOpen={dialogOpen}
        title={dialogCopy.title}
        message={actionError ? `${dialogCopy.message}\n\n${actionError}` : dialogCopy.message}
        confirmLabel={dialogCopy.confirmLabel}
        loading={processing}
        onConfirm={handleConfirm}
        onCancel={closeDialog}
      />
    </div>
  );
}
