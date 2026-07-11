import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import PermissionGate from "@/components/auth/PermissionGate";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { LoteStatusBadge } from "../components";
import { LOTE_ROUTES } from "../constants";
import { LOTES_PERMISSIONS } from "../permissions";
import { getLote } from "../services";
import { Lote } from "../types";

export default function LoteDetailPage() {
  const { id } = useParams();
  const loteId = Number(id);

  const [lote, setLote] = useState<Lote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLote = async () => {
      try {
        const data = await getLote(loteId);
        setLote(data);
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar el detalle del lote.");
      } finally {
        setLoading(false);
      }
    };

    if (loteId) {
      loadLote();
    }
  }, [loteId]);

  if (loading) {
    return <div>Cargando detalle...</div>;
  }

  if (error || !lote) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
        {error ?? "Lote no encontrado."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <PageBreadCrumb
          pageTitle={lote.nombre}
          items={breadcrumbs.loteDetalle}
        />
        <div className="flex gap-3">
          <Link
            to={LOTE_ROUTES.list}
            className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-3 text-sm text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700"
          >
            Volver al listado
          </Link>
          <PermissionGate permission={LOTES_PERMISSIONS.update}>
            <Link
              to={LOTE_ROUTES.edit(lote.id)}
              className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-3 text-sm text-white hover:bg-brand-600"
            >
              Editar
            </Link>
          </PermissionGate>
        </div>
      </div>

      <ComponentCard title="Detalle del lote">
        <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Potrero</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {lote.potrero_nombre || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Código</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{lote.codigo}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Nombre</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{lote.nombre}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Capacidad de animales</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {lote.capacidad_animales.toLocaleString("es-PY")}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Área (ha)</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {lote.area_ha != null ? lote.area_ha.toLocaleString("es-PY") : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Estado</dt>
            <dd className="mt-1">
              <LoteStatusBadge active={lote.activo} />
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Fecha de creación</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {lote.created_at
                ? new Date(lote.created_at).toLocaleString("es-PY")
                : "—"}
            </dd>
          </div>
          <div className="md:col-span-2">
            <dt className="text-sm text-gray-500 dark:text-gray-400">Observaciones</dt>
            <dd className="mt-1 text-gray-700 dark:text-gray-300">
              {lote.observaciones || "Sin observaciones"}
            </dd>
          </div>
        </dl>
      </ComponentCard>
    </div>
  );
}
