import { useState } from "react";

import ConfirmDialog from "@/components/common/ConfirmDialog";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { CategoriaProductoFiltersBar, CategoriaProductoTable, CategoriaProductoToolbar } from "../components";
import { useDeleteCategoriaProducto, useCategoriasProductos } from "../hooks";
import { CategoriaProducto } from "../types";

type DialogAction = "delete" | "toggleStatus";

export default function CategoriaProductoListPage() {
  const {
    categorias,
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
  } = useCategoriasProductos();
  const { execute, loading: processing, error: actionError, setError } = useDeleteCategoriaProducto();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<DialogAction>("delete");
  const [selected, setSelected] = useState<CategoriaProducto | null>(null);

  const openDialog = (action: DialogAction, item: CategoriaProducto) => {
    setDialogAction(action);
    setSelected(item);
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
      const response = await execute(selected.id, dialogAction === "delete" ? "delete" : "toggleStatus");
      showSuccess(response.message);
      closeDialog();
      refresh();
    } catch {
      // handled
    }
  };

  if (loading && categorias.length === 0) {
    return <div>Cargando categorías de productos...</div>;
  }

  const dialogCopy =
    dialogAction === "delete"
      ? {
          title: "Eliminar categoría",
          message: `¿Desea eliminar la categoría ${selected?.nombre}? Quedará inactiva y fuera del listado principal.`,
          confirmLabel: "Eliminar",
        }
      : {
          title: selected?.activo ? "Desactivar categoría" : "Activar categoría",
          message: selected?.activo
            ? `¿Desea desactivar la categoría ${selected?.nombre}?`
            : `¿Desea activar la categoría ${selected?.nombre}?`,
          confirmLabel: selected?.activo ? "Desactivar" : "Activar",
        };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Categorías de productos</h1>
          <PageBreadCrumb pageTitle="Categorías de productos" items={breadcrumbs.categoriasProductos} />
        </div>
        <CategoriaProductoToolbar />
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

      <CategoriaProductoFiltersBar filters={filters} onChange={updateFilters} />

      <CategoriaProductoTable
        categorias={categorias}
        meta={meta}
        onPageChange={setPage}
        onToggleStatus={(item) => openDialog("toggleStatus", item)}
        onDelete={(item) => openDialog("delete", item)}
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
