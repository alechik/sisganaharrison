import { useState } from "react";
import { Link } from "react-router-dom";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { GrupoTable } from "../components";
import { GRUPO_ROUTES } from "../constants";
import { useDeleteGrupo, useGrupos } from "../hooks";
import { Grupo } from "../types";

export default function GrupoDeletedPage() {
  const { grupos, loading, error, meta, setPage, refresh, showSuccess, successMessage, clearSuccess } = useGrupos({ deleted: true });
  const { execute, loading: processing, error: actionError, setError } = useDeleteGrupo();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<Grupo | null>(null);

  const handleConfirm = async () => {
    if (!selected) return;
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

  if (loading && grupos.length === 0) return <div>Cargando grupos eliminados...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Grupos eliminados</h1>
          <PageBreadCrumb pageTitle="Eliminados" items={breadcrumbs.gruposEliminados} />
        </div>
        <Link to={GRUPO_ROUTES.list} className="inline-flex items-center rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-white/[0.05] dark:text-gray-300">
          Volver al listado
        </Link>
      </div>
      {successMessage && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMessage}
          <button type="button" className="ml-3 underline" onClick={clearSuccess}>Cerrar</button>
        </div>
      )}
      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
      <GrupoTable grupos={grupos} meta={meta} deletedView onPageChange={setPage} onRestore={(grupo) => { setSelected(grupo); setError(null); setDialogOpen(true); }} />
      <ConfirmDialog isOpen={dialogOpen} title="Restaurar grupo" message={actionError ? `¿Restaurar ${selected?.nombre}?\n\n${actionError}` : `¿Restaurar el grupo ${selected?.nombre}?`} confirmLabel="Restaurar" loading={processing} onConfirm={handleConfirm} onCancel={() => setDialogOpen(false)} />
    </div>
  );
}
