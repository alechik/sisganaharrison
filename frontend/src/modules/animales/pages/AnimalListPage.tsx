import { useState } from "react";

import ConfirmDialog from "@/components/common/ConfirmDialog";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { AnimalFiltersBar, AnimalTable, AnimalToolbar } from "../components";
import { useAnimales, useDeleteAnimal } from "../hooks";
import { Animal } from "../types";

type DialogAction = "delete" | "toggleStatus";

export default function AnimalListPage() {
  const {
    animales,
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
  } = useAnimales();
  const { execute, loading: processing, error: actionError, setError } =
    useDeleteAnimal();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<DialogAction>("delete");
  const [selected, setSelected] = useState<Animal | null>(null);

  const openDialog = (action: DialogAction, animal: Animal) => {
    setDialogAction(action);
    setSelected(animal);
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
      // Error handled in hook
    }
  };

  if (loading && animales.length === 0) {
    return <div>Cargando animales...</div>;
  }

  const displayName = selected?.nombre || selected?.codigo;

  const dialogCopy =
    dialogAction === "delete"
      ? {
          title: "Eliminar animal",
          message: `¿Desea eliminar el animal ${displayName}? Quedará inactivo y fuera del listado principal.`,
          confirmLabel: "Eliminar",
        }
      : {
          title: selected?.activo ? "Desactivar animal" : "Activar animal",
          message: selected?.activo
            ? `¿Desea desactivar el animal ${displayName}?`
            : `¿Desea activar el animal ${displayName}?`,
          confirmLabel: selected?.activo ? "Desactivar" : "Activar",
        };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Animales</h1>
          <PageBreadCrumb pageTitle="Animales" items={breadcrumbs.animales} />
        </div>
        <AnimalToolbar />
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

      <AnimalFiltersBar filters={filters} onChange={updateFilters} />

      <AnimalTable
        animales={animales}
        meta={meta}
        onPageChange={setPage}
        onToggleStatus={(animal) => openDialog("toggleStatus", animal)}
        onDelete={(animal) => openDialog("delete", animal)}
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
