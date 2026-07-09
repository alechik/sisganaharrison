import { useState } from "react";
import { Link } from "react-router-dom";

import ConfirmDialog from "@/components/common/ConfirmDialog";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { PotreroTable } from "../components";
import { POTRERO_ROUTES } from "../constants";
import { useDeletePotrero, usePotreros } from "../hooks";
import { Potrero } from "../types";

export default function PotreroDeletedPage() {
  const {
    potreros,
    loading,
    error,
    meta,
    setPage,
    refresh,
    showSuccess,
    successMessage,
    clearSuccess,
  } = usePotreros({ deleted: true });
  const { execute, loading: processing, error: actionError, setError } =
    useDeletePotrero();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<Potrero | null>(null);

  const openDialog = (potrero: Potrero) => {
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
      const response = await execute(selected.id, "restore");
      showSuccess(response.message);
      closeDialog();
      refresh();
    } catch {
      // Error handled in hook
    }
  };

  if (loading && potreros.length === 0) {
    return <div>Cargando potreros eliminados...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Potreros Eliminados</h1>
          <PageBreadCrumb
            pageTitle="Eliminados"
            items={breadcrumbs.potrerosEliminados}
          />
        </div>
        <Link
          to={POTRERO_ROUTES.list}
          className="inline-flex items-center rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-white/[0.05] dark:text-gray-300 dark:hover:bg-white/[0.05]"
        >
          Volver al listado
        </Link>
      </div>

      {successMessage && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
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

      <PotreroTable
        potreros={potreros}
        meta={meta}
        deletedView
        onPageChange={setPage}
        onRestore={openDialog}
      />

      <ConfirmDialog
        isOpen={dialogOpen}
        title="Restaurar potrero"
        message={
          actionError
            ? `¿Desea restaurar el potrero ${selected?.nombre}?\n\n${actionError}`
            : `¿Desea restaurar el potrero ${selected?.nombre}?`
        }
        confirmLabel="Restaurar"
        loading={processing}
        onConfirm={handleConfirm}
        onCancel={closeDialog}
      />
    </div>
  );
}
