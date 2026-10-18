import { useState } from "react";
import { Link } from "react-router-dom";

import ConfirmDialog from "@/components/common/ConfirmDialog";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { CATEGORIA_PRODUCTO_ROUTES } from "../constants";
import { CategoriaProductoTable } from "../components";
import { useDeleteCategoriaProducto, useCategoriasProductos } from "../hooks";
import { CategoriaProducto } from "../types";

export default function CategoriaProductoDeletedPage() {
  const {
    categorias,
    loading,
    error,
    meta,
    setPage,
    refresh,
    showSuccess,
    successMessage,
    clearSuccess,
  } = useCategoriasProductos({ deleted: true });
  const { execute, loading: processing, error: actionError, setError } = useDeleteCategoriaProducto();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<CategoriaProducto | null>(null);

  const openDialog = (item: CategoriaProducto) => {
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
      const response = await execute(selected.id, "restore");
      showSuccess(response.message);
      closeDialog();
      refresh();
    } catch {
      // handled
    }
  };

  if (loading && categorias.length === 0) {
    return <div>Cargando categorías eliminadas...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Categorías eliminadas</h1>
          <PageBreadCrumb pageTitle="Eliminadas" items={breadcrumbs.categoriasProductosEliminados} />
        </div>
        <Link
          to={CATEGORIA_PRODUCTO_ROUTES.list}
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

      <CategoriaProductoTable
        categorias={categorias}
        meta={meta}
        deletedView
        onPageChange={setPage}
        onRestore={openDialog}
      />

      <ConfirmDialog
        isOpen={dialogOpen}
        title="Restaurar categoría"
        message={
          actionError
            ? `¿Desea restaurar la categoría ${selected?.nombre}?\n\n${actionError}`
            : `¿Desea restaurar la categoría ${selected?.nombre}?`
        }
        confirmLabel="Restaurar"
        loading={processing}
        onConfirm={handleConfirm}
        onCancel={closeDialog}
      />
    </div>
  );
}
