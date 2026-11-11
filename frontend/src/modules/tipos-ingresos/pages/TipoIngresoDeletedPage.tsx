import { useState } from "react";
import { Link } from "react-router-dom";

import ConfirmDialog from "@/components/common/ConfirmDialog";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { TIPO_INGRESO_ROUTES } from "../constants";
import { TipoIngresoTable } from "../components";
import { useDeleteTipoIngreso, useTiposIngresos } from "../hooks";
import { TipoIngreso } from "../types";

export default function TipoIngresoDeletedPage() {
  const { tipos, loading, error, meta, setPage, refresh, showSuccess, successMessage, clearSuccess } =
    useTiposIngresos({ deleted: true });
  const { execute, loading: processing, error: actionError, setError } = useDeleteTipoIngreso();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<TipoIngreso | null>(null);

  const openDialog = (tipo: TipoIngreso) => {
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
      const response = await execute(selected.id, "restore");
      showSuccess(response.message);
      closeDialog();
      refresh();
    } catch {
      // Error handled in hook
    }
  };

  if (loading && tipos.length === 0) {
    return <div>Cargando tipos eliminados...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tipos de ingreso eliminados</h1>
          <PageBreadCrumb pageTitle="Eliminados" items={breadcrumbs.tiposIngresosEliminados} />
        </div>
        <Link
          to={TIPO_INGRESO_ROUTES.list}
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

      <TipoIngresoTable
        tipos={tipos}
        meta={meta}
        deletedView
        onPageChange={setPage}
        onRestore={openDialog}
      />

      <ConfirmDialog
        isOpen={dialogOpen}
        title="Restaurar tipo de ingreso"
        message={
          actionError
            ? `¿Desea restaurar el tipo ${selected?.nombre}?\n\n${actionError}`
            : `¿Desea restaurar el tipo ${selected?.nombre}?`
        }
        confirmLabel="Restaurar"
        loading={processing}
        onConfirm={handleConfirm}
        onCancel={closeDialog}
      />
    </div>
  );
}
