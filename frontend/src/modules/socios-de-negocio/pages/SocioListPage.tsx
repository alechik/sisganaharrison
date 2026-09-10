import { useState } from "react";

import ConfirmDialog from "@/components/common/ConfirmDialog";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { SocioFiltersBar, SocioTable, SocioToolbar } from "../components";
import { useDeleteSocio, useSocios } from "../hooks";
import { Socio } from "../types";
import { isSocioActivo } from "../utils";

type DialogAction = "delete" | "toggleStatus";

export default function SocioListPage() {
  const {
    socios,
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
  } = useSocios();
  const { execute, loading: processing, error: actionError, setError } = useDeleteSocio();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<DialogAction>("delete");
  const [selected, setSelected] = useState<Socio | null>(null);

  const openDialog = (action: DialogAction, socio: Socio) => {
    setDialogAction(action);
    setSelected(socio);
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
      // handled
    }
  };

  if (loading && socios.length === 0) {
    return <div>Cargando socios de negocios...</div>;
  }

  const dialogCopy =
    dialogAction === "delete"
      ? {
          title: "Desactivar socio",
          message: `¿Desea desactivar a ${selected?.razon_social}? No se eliminará físicamente.`,
          confirmLabel: "Desactivar",
        }
      : {
          title: isSocioActivo(selected?.estado) ? "Desactivar socio" : "Activar socio",
          message: isSocioActivo(selected?.estado)
            ? `¿Desea desactivar a ${selected?.razon_social}?`
            : `¿Desea activar a ${selected?.razon_social}?`,
          confirmLabel: isSocioActivo(selected?.estado) ? "Desactivar" : "Activar",
        };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Socios de Negocios</h1>
          <PageBreadCrumb pageTitle="Socios de Negocios" items={breadcrumbs.socios} />
          <p className="mt-1 text-sm text-gray-500">
            Un socio puede ser Cliente, Proveedor o ambos, según los tipos asignados.
          </p>
        </div>
        <SocioToolbar />
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

      <SocioFiltersBar filters={filters} onChange={updateFilters} />

      <SocioTable
        socios={socios}
        meta={meta}
        onPageChange={setPage}
        onToggleStatus={(socio) => openDialog("toggleStatus", socio)}
        onDelete={(socio) => openDialog("delete", socio)}
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
