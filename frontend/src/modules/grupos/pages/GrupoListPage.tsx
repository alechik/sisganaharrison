import { useState } from "react";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { GrupoFiltersBar, GrupoTable, GrupoToolbar } from "../components";
import { useDeleteGrupo, useGrupos } from "../hooks";
import { Grupo } from "../types";

type DialogAction = "delete" | "toggleStatus";

export default function GrupoListPage() {
  const { grupos, loading, error, meta, filters, successMessage, setPage, updateFilters, refresh, showSuccess, clearSuccess } = useGrupos();
  const { execute, loading: processing, error: actionError, setError } = useDeleteGrupo();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<DialogAction>("delete");
  const [selected, setSelected] = useState<Grupo | null>(null);

  const openDialog = (action: DialogAction, grupo: Grupo) => {
    setDialogAction(action);
    setSelected(grupo);
    setError(null);
    setDialogOpen(true);
  };

  const handleConfirm = async () => {
    if (!selected) return;
    try {
      const response = await execute(selected.id, dialogAction === "delete" ? "delete" : "toggleStatus");
      showSuccess(response.message);
      setDialogOpen(false);
      setSelected(null);
      refresh();
    } catch {
      // handled
    }
  };

  if (loading && grupos.length === 0) return <div>Cargando grupos...</div>;

  const dialogCopy =
    dialogAction === "delete"
      ? { title: "Eliminar grupo", message: `¿Desea eliminar el grupo ${selected?.nombre}?`, confirmLabel: "Eliminar" }
      : {
          title: selected?.activo ? "Desactivar grupo" : "Activar grupo",
          message: selected?.activo ? `¿Desea desactivar el grupo ${selected?.nombre}?` : `¿Desea activar el grupo ${selected?.nombre}?`,
          confirmLabel: selected?.activo ? "Desactivar" : "Activar",
        };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Grupos</h1>
          <PageBreadCrumb pageTitle="Grupos" items={breadcrumbs.grupos} />
        </div>
        <GrupoToolbar />
      </div>
      {successMessage && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-300">
          {successMessage}
          <button type="button" className="ml-3 underline" onClick={clearSuccess}>Cerrar</button>
        </div>
      )}
      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
      <GrupoFiltersBar filters={filters} onChange={updateFilters} />
      <GrupoTable grupos={grupos} meta={meta} onPageChange={setPage} onToggleStatus={(grupo) => openDialog("toggleStatus", grupo)} onDelete={(grupo) => openDialog("delete", grupo)} />
      <ConfirmDialog isOpen={dialogOpen} title={dialogCopy.title} message={actionError ? `${dialogCopy.message}\n\n${actionError}` : dialogCopy.message} confirmLabel={dialogCopy.confirmLabel} loading={processing} onConfirm={handleConfirm} onCancel={() => setDialogOpen(false)} />
    </div>
  );
}
