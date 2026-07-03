import { useState } from "react";
import { Link } from "react-router-dom";

import ConfirmDialog from "@/components/common/ConfirmDialog";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { EstadoProductivoTable } from "../components";
import { ESTADO_PRODUCTIVO_ROUTES } from "../constants";
import { useDeleteEstadoProductivo, useEstadosProductivos } from "../hooks";
import { EstadoProductivo } from "../types";

export default function EstadoProductivoDeletedPage() {
  const {
    estados,
    loading,
    error,
    meta,
    setPage,
    refresh,
    showSuccess,
    successMessage,
    clearSuccess,
  } = useEstadosProductivos({ deleted: true });
  const { execute, loading: processing, error: actionError, setError } =
    useDeleteEstadoProductivo();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEstado, setSelectedEstado] = useState<EstadoProductivo | null>(null);

  const openDialog = (estado: EstadoProductivo) => {
    setSelectedEstado(estado);
    setError(null);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedEstado(null);
    setError(null);
  };

  const handleConfirm = async () => {
    if (!selectedEstado) {
      return;
    }

    try {
      const response = await execute(selectedEstado.id, "restore");
      showSuccess(response.message);
      closeDialog();
      refresh();
    } catch {
      // Error handled in hook
    }
  };

  if (loading && estados.length === 0) {
    return <div>Cargando estados eliminados...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Estados Productivos Eliminados</h1>
          <PageBreadCrumb
            pageTitle="Eliminados"
            items={breadcrumbs.estadosProductivosEliminados}
          />
        </div>
        <Link
          to={ESTADO_PRODUCTIVO_ROUTES.list}
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

      <EstadoProductivoTable
        estados={estados}
        meta={meta}
        deletedView
        onPageChange={setPage}
        onRestore={openDialog}
      />

      <ConfirmDialog
        isOpen={dialogOpen}
        title="Restaurar estado productivo"
        message={
          actionError
            ? `¿Desea restaurar el estado ${selectedEstado?.nombre}?\n\n${actionError}`
            : `¿Desea restaurar el estado ${selectedEstado?.nombre}?`
        }
        confirmLabel="Restaurar"
        loading={processing}
        onConfirm={handleConfirm}
        onCancel={closeDialog}
      />
    </div>
  );
}
