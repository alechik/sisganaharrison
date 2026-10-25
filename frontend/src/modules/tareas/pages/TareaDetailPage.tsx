import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import ConfirmDialog from "@/components/common/ConfirmDialog";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { getCurrentUserId } from "@/modules/user/utils/currentUser";
import { canManageTareas, canReceiveTareas } from "@/utils/roles";
import { TareaStatusBadge } from "../components";
import { TAREA_ROUTES } from "../constants";
import { useTerminarTarea } from "../hooks";
import { getTarea } from "../services";
import { Tarea } from "../types";
import { formatDateTime } from "../utils";

export default function TareaDetailPage() {
  const { id } = useParams();
  const tareaId = Number(id);
  const currentUserId = getCurrentUserId();
  const showVista = canManageTareas();

  const [tarea, setTarea] = useState<Tarea | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { execute, loading: processing, error: actionError, setError: setActionError } = useTerminarTarea();

  useEffect(() => {
    const load = async () => {
      try {
        setTarea(await getTarea(tareaId));
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar el detalle de la tarea.");
      } finally {
        setLoading(false);
      }
    };

    if (tareaId) {
      load();
      return;
    }

    setLoading(false);
    setError("Tarea no encontrada.");
  }, [tareaId]);

  const handleTerminar = async () => {
    if (!tarea) {
      return;
    }

    try {
      const response = await execute(tarea.id);
      setTarea(response.data);
      setDialogOpen(false);
    } catch {
      // hook
    }
  };

  if (loading) {
    return <div>Cargando detalle...</div>;
  }

  if (error || !tarea) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
        {error ?? "Tarea no encontrada."}
      </div>
    );
  }

  const esAsignado = Number(currentUserId) === Number(tarea.user_trabajador_id);
  const puedeGestionar = canReceiveTareas() && esAsignado && tarea.estado !== "TERMINADO";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <PageBreadCrumb pageTitle={tarea.codigo_tarea} items={breadcrumbs.tareaDetalle} />
        <div className="flex flex-wrap gap-3">
          <Link
            to={TAREA_ROUTES.list}
            className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-3 text-sm text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700"
          >
            Volver al listado
          </Link>
          {puedeGestionar && (
            <>
              <Link
                to={TAREA_ROUTES.edit(tarea.id)}
                className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-3 text-sm text-white hover:bg-brand-600"
              >
                Responder
              </Link>
              <button
                type="button"
                onClick={() => {
                  setActionError(null);
                  setDialogOpen(true);
                }}
                className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-3 text-sm text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700"
              >
                Terminar tarea
              </button>
            </>
          )}
        </div>
      </div>

      <ComponentCard title="Detalle de tarea">
        <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Código</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{tarea.codigo_tarea}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Estado</dt>
            <dd className="mt-1">
              <TareaStatusBadge estado={tarea.estado} />
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Asignado por</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{tarea.gerencia?.nombre ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Usuario asignado</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{tarea.trabajador?.nombre ?? "—"}</dd>
          </div>
          {showVista && (
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">Vista</dt>
              <dd className="font-medium text-gray-800 dark:text-white/90">{tarea.vista ?? "—"}</dd>
            </div>
          )}
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Fecha de inicio</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{formatDateTime(tarea.fecha_inicio)}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Fecha de fin</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{formatDateTime(tarea.fecha_fin)}</dd>
          </div>
          <div className="md:col-span-2">
            <dt className="text-sm text-gray-500 dark:text-gray-400">Indicación</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-700 dark:text-gray-300">{tarea.indicacion}</dd>
          </div>
          <div className="md:col-span-2">
            <dt className="text-sm text-gray-500 dark:text-gray-400">Respuesta</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-700 dark:text-gray-300">
              {tarea.respuesta_indicacion || "Sin respuesta"}
            </dd>
          </div>
        </dl>
      </ComponentCard>

      <ConfirmDialog
        isOpen={dialogOpen}
        title="Terminar tarea"
        message={
          actionError
            ? `¿Desea terminar la tarea ${tarea.codigo_tarea}?\n\n${actionError}`
            : `¿Desea terminar la tarea ${tarea.codigo_tarea}? Se registrará la fecha de fin.`
        }
        confirmLabel="Terminar tarea"
        loading={processing}
        onConfirm={handleTerminar}
        onCancel={() => setDialogOpen(false)}
      />
    </div>
  );
}
