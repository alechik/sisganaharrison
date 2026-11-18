import { useState } from "react";

import ConfirmDialog from "@/components/common/ConfirmDialog";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { ProductoFiltersBar, ProductoTable, ProductoToolbar } from "../components";
import { useDeleteProducto, useProductos } from "../hooks";
import { Producto } from "../types";

type DialogAction = "delete" | "toggleStatus";

export default function ProductoListPage() {
  const {
    productos,
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
  } = useProductos();
  const { execute, loading: processing, error: actionError, setError } =
    useDeleteProducto();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<DialogAction>("delete");
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);

  const openDialog = (action: DialogAction, producto: Producto) => {
    setDialogAction(action);
    setSelectedProducto(producto);
    setError(null);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedProducto(null);
    setError(null);
  };

  const handleConfirm = async () => {
    if (!selectedProducto) {
      return;
    }

    try {
      const response = await execute(
        selectedProducto.id,
        dialogAction === "delete" ? "delete" : "toggleStatus"
      );
      showSuccess(response.message);
      closeDialog();
      refresh();
    } catch {
      // Error handled in hook
    }
  };

  if (loading && productos.length === 0) {
    return <div>Cargando productos...</div>;
  }

  const dialogCopy =
    dialogAction === "delete"
      ? {
          title: "Eliminar producto",
          message: `¿Desea eliminar el producto ${selectedProducto?.nombre}? Quedará inactivo y fuera del listado principal.`,
          confirmLabel: "Eliminar",
        }
      : {
          title: selectedProducto?.activo ? "Desactivar producto" : "Activar producto",
          message: selectedProducto?.activo
            ? `¿Desea desactivar el producto ${selectedProducto?.nombre}?`
            : `¿Desea activar el producto ${selectedProducto?.nombre}?`,
          confirmLabel: selectedProducto?.activo ? "Desactivar" : "Activar",
        };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Productos</h1>
          <PageBreadCrumb pageTitle="Productos" items={breadcrumbs.productos} />
        </div>
        <ProductoToolbar />
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

      <ProductoFiltersBar filters={filters} onChange={updateFilters} />

      <ProductoTable
        productos={productos}
        meta={meta}
        onPageChange={setPage}
        onToggleStatus={(producto) => openDialog("toggleStatus", producto)}
        onDelete={(producto) => openDialog("delete", producto)}
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
