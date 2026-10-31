import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import ConfirmDialog from "@/components/common/ConfirmDialog";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { getCurrentUserId } from "@/modules/user/utils/currentUser";
import { canCrearInformesDiarios, canRevisarInformesDiarios } from "@/utils/roles";
import { InformeStatusBadge } from "../components";
import { INFORME_DIARIO_ROUTES } from "../constants";
import { useRevisarInformeDiario } from "../hooks";
import { getInformeDiario } from "../services";
import { InformeDiario } from "../types";
import { formatDate } from "../utils";

export default function InformeDetailPage() {
  const { id } = useParams();
  const informeId = Number(id);
  const currentUserId = getCurrentUserId();
  const esGestor = canRevisarInformesDiarios();
  const esTrabajador = canCrearInformesDiarios();

  const [informe, setInforme] = useState<InformeDiario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { execute, loading: processing, error: actionError, setError: setActionError } =
    useRevisarInformeDiario();

  useEffect(() => {
    const load = async () => {
      try {
        setInforme(await getInformeDiario(informeId));
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar el detalle del informe diario.");
      } finally {
        setLoading(false);
      }
    };

    if (informeId) {
      load();
      return;
    }

    setLoading(false);
    setError("Informe diario no encontrado.");
  }, [informeId]);

  const handleRevisar = async () => {
    if (!informe) {
      return;
    }

    try {
      const response = await execute(informe.id);
      setInforme(response.data);
      setDialogOpen(false);
    } catch {
      // hook
    }
  };

  if (loading) {
    return <div>Cargando detalle...</div>;
  }

  if (error || !informe) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
        {error ?? "Informe diario no encontrado."}
      </div>
    );
  }

  const esAutor = Number(currentUserId) === Number(informe.user_trabajador_id);
  const puedeEditar = esTrabajador && esAutor && informe.revisado === "NO";
  const yaRevisado = informe.revisado === "SI";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <PageBreadCrumb pageTitle={informe.codigo_informe} items={breadcrumbs.informeDiarioDetalle} />
        <div className="flex flex-wrap gap-3">
          <Link
            to={INFORME_DIARIO_ROUTES.list}
            className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-3 text-sm text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700"
          >
            Volver al listado
          </Link>
          {puedeEditar && (
            <Link
              to={INFORME_DIARIO_ROUTES.edit(informe.id)}
              className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-3 text-sm text-white hover:bg-brand-600"
            >
              Editar
            </Link>
          )}
          {esGestor && (
            <button
              type="button"
              disabled={yaRevisado}
              onClick={() => {
                setActionError(null);
                setDialogOpen(true);
              }}
              className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-3 text-sm text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Revisado
            </button>
          )}
        </div>
      </div>

      <ComponentCard title="Detalle de informe diario">
        <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Código</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{informe.codigo_informe}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Revisado</dt>
            <dd className="mt-1">
              <InformeStatusBadge revisado={informe.revisado} />
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Trabajador</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {informe.trabajador?.nombre ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Fecha</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{formatDate(informe.fecha)}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Revisor</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {informe.revisor?.nombre ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Fecha de revisión</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {formatDate(informe.fecha_revision)}
            </dd>
          </div>
          <div className="md:col-span-2">
            <dt className="text-sm text-gray-500 dark:text-gray-400">Detalle del informe</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-700 dark:text-gray-300">
              {informe.detalle_informe}
            </dd>
          </div>
        </dl>
      </ComponentCard>

      <ConfirmDialog
        isOpen={dialogOpen}
        title="Marcar como revisado"
        message={
          actionError
            ? `¿Desea marcar el informe ${informe.codigo_informe} como revisado?\n\n${actionError}`
            : `¿Desea marcar el informe ${informe.codigo_informe} como revisado? El trabajador ya no podrá modificarlo.`
        }
        confirmLabel="Revisado"
        loading={processing}
        onConfirm={handleRevisar}
        onCancel={() => setDialogOpen(false)}
      />
    </div>
  );
}
