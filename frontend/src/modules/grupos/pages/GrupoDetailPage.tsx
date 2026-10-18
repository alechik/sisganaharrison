import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PermissionGate from "@/components/auth/PermissionGate";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { GrupoStatusBadge } from "../components";
import { GRUPO_ROUTES } from "../constants";
import { GRUPOS_PERMISSIONS } from "../permissions";
import { getGrupo } from "../services";
import { Grupo } from "../types";

export default function GrupoDetailPage() {
  const grupoId = Number(useParams().id);
  const [grupo, setGrupo] = useState<Grupo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!grupoId) return;
    getGrupo(grupoId)
      .then(setGrupo)
      .catch(() => setError("No se pudo cargar el detalle del grupo."))
      .finally(() => setLoading(false));
  }, [grupoId]);

  if (loading) return <div>Cargando detalle...</div>;
  if (error || !grupo) {
    return <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error ?? "Grupo no encontrado."}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <PageBreadCrumb pageTitle={grupo.nombre} items={breadcrumbs.grupoDetalle} />
        <div className="flex gap-3">
          <Link to={GRUPO_ROUTES.list} className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-3 text-sm text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700">
            Volver al listado
          </Link>
          <PermissionGate permission={GRUPOS_PERMISSIONS.update}>
            <Link to={GRUPO_ROUTES.edit(grupo.id)} className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-3 text-sm text-white hover:bg-brand-600">
              Editar
            </Link>
          </PermissionGate>
        </div>
      </div>
      <ComponentCard title="Detalle del grupo">
        <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Potrero</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{grupo.lote_nombre || "—"}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Nombre</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{grupo.nombre}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Estado</dt>
            <dd><GrupoStatusBadge active={grupo.activo} /></dd>
          </div>
          <div className="md:col-span-2">
            <dt className="text-sm text-gray-500 dark:text-gray-400">Observaciones</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{grupo.observaciones || "—"}</dd>
          </div>
        </dl>
      </ComponentCard>
    </div>
  );
}
