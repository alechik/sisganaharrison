import { useState } from "react";

import ConfirmDialog from "@/components/common/ConfirmDialog";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { PotreroFiltersBar, PotreroTable, PotreroToolbar } from "../components";
import { useDeletePotrero, usePotreros } from "../hooks";
import { Potrero } from "../types";

type DialogAction = "delete" | "toggleStatus";

export default function PotreroListPage() {
  const {
    potreros,
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
  } = usePotreros();
  const { execute, loading: processing, error: actionError, setError } =
    useDeletePotrero();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<DialogAction>("delete");
  const [selected, setSelected] = useState<Potrero | null>(null);

  const openDialog = (action: DialogAction, potrero: Potrero) => {
    setDialogAction(action);
    setSelected(potrero);
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

  if (loading && potreros.length === 0) {
    return <div>Cargando potreros...</div>;
  }

  const dialogCopy =
    dialogAction === "delete"
      ? {
          title: "Eliminar potrero",
          message: `¿Desea eliminar el potrero ${selected?.nombre}? Quedará inactivo y fuera del listado principal.`,
          confirmLabel: "Eliminar",
        }
      : {
          title: selected?.activo ? "Desactivar potrero" : "Activar potrero",
          message: selected?.activo
            ? `¿Desea desactivar el potrero ${selected?.nombre}?`
            : `¿Desea activar el potrero ${selected?.nombre}?`,
          confirmLabel: selected?.activo ? "Desactivar" : "Activar",
        };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Potreros</h1>
          <PageBreadCrumb pageTitle="Potreros" items={breadcrumbs.potreros} />
        </div>
        <PotreroToolbar />
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

      <PotreroFiltersBar filters={filters} onChange={updateFilters} />

      <PotreroTable
        potreros={potreros}
        meta={meta}
        onPageChange={setPage}
        onToggleStatus={(potrero) => openDialog("toggleStatus", potrero)}
        onDelete={(potrero) => openDialog("delete", potrero)}
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
