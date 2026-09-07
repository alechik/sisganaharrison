import { useState } from "react";
import { Link } from "react-router-dom";

import ConfirmDialog from "@/components/common/ConfirmDialog";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { SocioTable } from "../components";
import { SOCIO_ROUTES } from "../constants";
import { useDeleteSocio, useSocios } from "../hooks";
import { Socio } from "../types";

export default function SocioDeletedPage() {
  const { socios, loading, error, meta, setPage, refresh, showSuccess, successMessage, clearSuccess } =
    useSocios({ deleted: true });
  const { execute, loading: processing, error: actionError, setError } = useDeleteSocio();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<Socio | null>(null);

  const handleConfirm = async () => {
    if (!selected) {
      return;
    }

    try {
      const response = await execute(selected.id, "restore");
      showSuccess(response.message);
      setDialogOpen(false);
      setSelected(null);
      refresh();
    } catch {
      // handled
    }
  };

  if (loading && socios.length === 0) {
    return <div>Cargando socios desactivados...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Socios desactivados</h1>
          <PageBreadCrumb pageTitle="Desactivados" items={breadcrumbs.sociosEliminados} />
        </div>
        <Link
          to={SOCIO_ROUTES.clientes}
          className="inline-flex items-center rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-white/[0.05] dark:text-gray-300 dark:hover:bg-white/[0.05]"
        >
          Volver a clientes
        </Link>
      </div>

      {successMessage && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMessage}
          <button type="button" className="ml-3 underline" onClick={clearSuccess}>Cerrar</button>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      <SocioTable
        socios={socios}
        meta={meta}
        deletedView
        onPageChange={setPage}
        onRestore={(socio) => {
          setSelected(socio);
          setError(null);
          setDialogOpen(true);
        }}
      />

      <ConfirmDialog
        isOpen={dialogOpen}
        title="Restaurar socio"
        message={
          actionError
            ? `¿Desea restaurar a ${selected?.razon_social}?\n\n${actionError}`
            : `¿Desea restaurar a ${selected?.razon_social}?`
        }
        confirmLabel="Restaurar"
        loading={processing}
        onConfirm={handleConfirm}
        onCancel={() => {
          setDialogOpen(false);
          setSelected(null);
        }}
      />
    </div>
  );
}
