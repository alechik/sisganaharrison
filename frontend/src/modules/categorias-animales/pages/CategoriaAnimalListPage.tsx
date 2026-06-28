import { useState } from "react";

import ConfirmDialog from "@/components/common/ConfirmDialog";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import {
  CategoriaAnimalFiltersBar,
  CategoriaAnimalTable,
  CategoriaAnimalToolbar,
} from "../components";
import { useCategoriasAnimales, useDeleteCategoriaAnimal } from "../hooks";
import { CategoriaAnimal } from "../types";

type DialogAction = "delete" | "toggleStatus";

export default function CategoriaAnimalListPage() {
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
  } = useCategoriasAnimales();
  const { execute, loading: processing, error: actionError, setError } =
    useDeleteCategoriaAnimal();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<DialogAction>("delete");
  const [selectedCategoria, setSelectedCategoria] = useState<CategoriaAnimal | null>(null);

  const openDialog = (action: DialogAction, categoria: CategoriaAnimal) => {
    setDialogAction(action);
    setSelectedCategoria(categoria);
    setError(null);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedCategoria(null);
    setError(null);
  };

  const handleConfirm = async () => {
    if (!selectedCategoria) {
      return;
    }

    try {
      const response = await execute(
        selectedCategoria.id,
        dialogAction === "delete" ? "delete" : "toggleStatus"
      );
      showSuccess(response.message);
      closeDialog();
      refresh();
    } catch {
      // Error handled in hook
    }
  };

  if (loading && categorias.length === 0) {
    return <div>Cargando categorías...</div>;
  }

  const dialogCopy =
    dialogAction === "delete"
      ? {
          title: "Eliminar categoría",
          message: `¿Desea eliminar la categoría ${selectedCategoria?.nombre}? Quedará inactiva y fuera del listado principal.`,
          confirmLabel: "Eliminar",
        }
      : {
          title: selectedCategoria?.activo ? "Desactivar categoría" : "Activar categoría",
          message: selectedCategoria?.activo
            ? `¿Desea desactivar la categoría ${selectedCategoria?.nombre}?`
            : `¿Desea activar la categoría ${selectedCategoria?.nombre}?`,
          confirmLabel: selectedCategoria?.activo ? "Desactivar" : "Activar",
        };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Categorías de Animales</h1>
          <PageBreadCrumb
            pageTitle="Categorías"
            items={breadcrumbs.categoriasAnimales}
          />
        </div>
        <CategoriaAnimalToolbar />
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

      <CategoriaAnimalFiltersBar filters={filters} onChange={updateFilters} />

      <CategoriaAnimalTable
        categorias={categorias}
        meta={meta}
        onPageChange={setPage}
        onToggleStatus={(categoria) => openDialog("toggleStatus", categoria)}
        onDelete={(categoria) => openDialog("delete", categoria)}
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
