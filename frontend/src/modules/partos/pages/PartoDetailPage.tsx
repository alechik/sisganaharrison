import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import PermissionGate from "@/components/auth/PermissionGate";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { PARTO_ROUTES } from "../constants";
import { PARTOS_PERMISSIONS } from "../permissions";
import { getParto } from "../services";
import { Parto } from "../types";
import {
  formatDate,
  formatGestacionResumen,
  getEstadoGestacionLabel,
  getResultadoLabel,
  getTipoServicioLabel,
} from "../utils";

export default function PartoDetailPage() {
  const { id } = useParams();
  const partoId = Number(id);

  const [parto, setParto] = useState<Parto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadParto = async () => {
      try {
        const data = await getParto(partoId);
        setParto(data);
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar el detalle del parto.");
      } finally {
        setLoading(false);
      }
    };

    if (partoId) {
      loadParto();
    }
  }, [partoId]);

  if (loading) {
    return <div>Cargando detalle...</div>;
  }

  if (error || !parto) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
        {error ?? "Parto no encontrado."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <PageBreadCrumb
          pageTitle={`Parto #${parto.id}`}
          items={breadcrumbs.partoDetalle}
        />
        <div className="flex gap-3">
          <Link
            to={PARTO_ROUTES.list}
            className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-3 text-sm text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700"
          >
            Volver al listado
          </Link>
          <PermissionGate permission={PARTOS_PERMISSIONS.update}>
            <Link
              to={PARTO_ROUTES.edit(parto.id)}
              className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-3 text-sm text-white hover:bg-brand-600"
            >
              Editar
            </Link>
          </PermissionGate>
        </div>
      </div>

      <ComponentCard title="Detalle de Parto">
        <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <dt className="text-sm text-gray-500 dark:text-gray-400">Gestación</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {formatGestacionResumen(parto)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Estado de gestación</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {getEstadoGestacionLabel(parto.gestacion_estado)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Fecha probable de parto</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {formatDate(parto.gestacion_fecha_probable_parto)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Código hembra</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {parto.gestacion_servicio_hembra_codigo || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Arete hembra</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {parto.gestacion_servicio_hembra_arete || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Código macho</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {parto.gestacion_servicio_macho_codigo || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Arete macho</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {parto.gestacion_servicio_macho_arete || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Fecha de servicio</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {formatDate(parto.gestacion_servicio_fecha_servicio)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Tipo de servicio</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {getTipoServicioLabel(parto.gestacion_servicio_tipo_servicio)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Resultado del servicio</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {getResultadoLabel(parto.gestacion_servicio_resultado)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Fecha de parto</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {formatDate(parto.fecha_parto)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Última actualización</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {parto.updated_at
                ? new Date(parto.updated_at).toLocaleString("es-PY")
                : "—"}
            </dd>
          </div>
          <div className="md:col-span-2">
            <dt className="text-sm text-gray-500 dark:text-gray-400">Observaciones</dt>
            <dd className="mt-1 text-gray-700 dark:text-gray-300">
              {parto.observaciones || "Sin observaciones"}
            </dd>
          </div>
        </dl>
      </ComponentCard>
    </div>
  );
}
