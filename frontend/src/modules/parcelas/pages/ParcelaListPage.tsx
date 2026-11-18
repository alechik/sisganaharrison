import { useState } from "react";

import ConfirmDialog from "@/components/common/ConfirmDialog";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { ParcelaFiltersBar, ParcelaTable, ParcelaToolbar } from "../components";
import { useDeleteParcela, useParcelas } from "../hooks";
import { Parcela } from "../types";

type DialogAction = "delete" | "toggleStatus";

export default function ParcelaListPage() {
  const {
    parcelas,
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
  } = useParcelas();
  const { execute, loading: processing, error: actionError, setError } =
    useDeleteParcela();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<DialogAction>("delete");
  const [selected, setSelected] = useState<Parcela | null>(null);

  const openDialog = (action: DialogAction, parcela: Parcela) => {
    setDialogAction(action);
    setSelected(parcela);
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

  if (loading && parcelas.length === 0) {
    return <div>Cargando parcelas...</div>;
  }

  const dialogCopy =
    dialogAction === "delete"
      ? {
          title: "Eliminar parcela",
          message: `¿Desea eliminar la parcela ${selected?.nombre}? Quedará inactiva y fuera del listado principal.`,
          confirmLabel: "Eliminar",
        }
      : {
          title: selected?.activo ? "Desactivar parcela" : "Activar parcela",
          message: selected?.activo
            ? `¿Desea desactivar la parcela ${selected?.nombre}?`
            : `¿Desea activar la parcela ${selected?.nombre}?`,
          confirmLabel: selected?.activo ? "Desactivar" : "Activar",
        };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Parcelas</h1>
          <PageBreadCrumb pageTitle="Parcelas" items={breadcrumbs.parcelas} />
        </div>
        <ParcelaToolbar />
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

      <ParcelaFiltersBar filters={filters} onChange={updateFilters} />

      <ParcelaTable
        parcelas={parcelas}
        meta={meta}
        onPageChange={setPage}
        onToggleStatus={(parcela) => openDialog("toggleStatus", parcela)}
        onDelete={(parcela) => openDialog("delete", parcela)}
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
