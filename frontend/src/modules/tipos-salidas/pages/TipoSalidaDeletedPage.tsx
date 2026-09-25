import { useState } from "react";
import { Link } from "react-router-dom";

import ConfirmDialog from "@/components/common/ConfirmDialog";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { TipoSalidaTable } from "../components";
import { TIPO_SALIDA_ROUTES } from "../constants";
import { useDeleteTipoSalida, useTiposSalidas } from "../hooks";
import { TipoSalida } from "../types";

export default function TipoSalidaDeletedPage() {
  const {
    tipos,
    loading,
    error,
    meta,
    setPage,
    refresh,
    showSuccess,
    successMessage,
    clearSuccess,
  } = useTiposSalidas({ deleted: true });
  const { execute, loading: processing, error: actionError, setError } =
    useDeleteTipoSalida();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTipo, setSelectedTipo] = useState<TipoSalida | null>(null);

  const openDialog = (tipo: TipoSalida) => {
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
      const response = await execute(selectedTipo.id, "restore");
      showSuccess(response.message);
      closeDialog();
      refresh();
    } catch {
      // handled
    }
  };

  if (loading && tipos.length === 0) {
    return <div>Cargando tipos eliminados...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tipos de Salida Eliminados</h1>
          <PageBreadCrumb
            pageTitle="Eliminados"
            items={breadcrumbs.tiposSalidasEliminados}
          />
        </div>
        <Link
          to={TIPO_SALIDA_ROUTES.list}
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

      <TipoSalidaTable
        tipos={tipos}
        meta={meta}
        deletedView
        onPageChange={setPage}
        onRestore={openDialog}
      />

      <ConfirmDialog
        isOpen={dialogOpen}
        title="Restaurar tipo de salida"
        message={
          actionError
            ? `¿Desea restaurar el tipo ${selectedTipo?.nombre}?\n\n${actionError}`
            : `¿Desea restaurar el tipo ${selectedTipo?.nombre}?`
        }
        confirmLabel="Restaurar"
        loading={processing}
        onConfirm={handleConfirm}
        onCancel={closeDialog}
      />
    </div>
  );
}
