import { useState } from "react";

import ConfirmDialog from "@/components/common/ConfirmDialog";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { TipoPersonaTable, TipoPersonaToolbar } from "../components";
import { useTiposPersona } from "../hooks";
import { deleteTipoPersona } from "../services";
import { TipoPersona } from "../types";
import { getTipoLabel } from "../utils";

export default function TipoPersonaListPage() {
  const { tipos, loading, error, meta, setPage, refresh, successMessage, showSuccess, clearSuccess } =
    useTiposPersona();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<TipoPersona | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleConfirm = async () => {
    if (!selected) {
      return;
    }

    setProcessing(true);
    setActionError(null);

    try {
      const response = await deleteTipoPersona(selected.id);
      showSuccess(response.message);
      setDialogOpen(false);
      setSelected(null);
      refresh();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "No se pudo eliminar el tipo.";
      setActionError(message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading && tipos.length === 0) {
    return <div>Cargando tipos de persona...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Tipos de persona</h1>
          <PageBreadCrumb pageTitle="Tipos de persona" items={breadcrumbs.tiposPersona} />
        </div>
        <TipoPersonaToolbar />
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

      <TipoPersonaTable
        tipos={tipos}
        meta={meta}
        onPageChange={setPage}
        onDelete={(tipo) => {
          setSelected(tipo);
          setActionError(null);
          setDialogOpen(true);
        }}
      />

      <ConfirmDialog
        isOpen={dialogOpen}
        title="Eliminar tipo"
        message={
          actionError
            ? `¿Desea eliminar el tipo ${getTipoLabel(selected?.nombre)}?\n\n${actionError}`
            : `¿Desea eliminar el tipo ${getTipoLabel(selected?.nombre)}?`
        }
        confirmLabel="Eliminar"
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
