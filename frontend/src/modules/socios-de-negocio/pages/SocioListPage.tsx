import { useState } from "react";

import ConfirmDialog from "@/components/common/ConfirmDialog";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { SocioFiltersBar, SocioTable, SocioToolbar } from "../components";
import { TIPO_CLIENTE, TIPO_PROVEEDOR } from "../constants";
import { useDeleteSocio, useSocios } from "../hooks";
import { Socio } from "../types";
import { getTipoLabel, isSocioActivo } from "../utils";

interface Props {
  tipo: typeof TIPO_CLIENTE | typeof TIPO_PROVEEDOR;
}

type DialogAction = "delete" | "toggleStatus";

export default function SocioListPage({ tipo }: Props) {
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
  } = useSocios({ initialFilters: { tipo } });
  const { execute, loading: processing, error: actionError, setError } = useDeleteSocio();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<DialogAction>("delete");
  const [selected, setSelected] = useState<Socio | null>(null);

  const title = tipo === TIPO_CLIENTE ? "Clientes" : "Proveedores";
  const breadcrumbItems = tipo === TIPO_CLIENTE ? breadcrumbs.sociosClientes : breadcrumbs.sociosProveedores;

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
    return <div>Cargando {title.toLowerCase()}...</div>;
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
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{title}</h1>
          <PageBreadCrumb pageTitle={title} items={breadcrumbItems} />
          <p className="mt-1 text-sm text-gray-500">
            Socios de negocio con tipo {getTipoLabel(tipo)}. Una persona puede ser cliente y proveedor a la vez.
          </p>
        </div>
        <SocioToolbar tipo={tipo} />
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

      <SocioFiltersBar filters={filters} onChange={updateFilters} lockTipo />

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
