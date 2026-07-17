import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import PermissionGate from "@/components/auth/PermissionGate";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { GESTACION_ROUTES } from "../constants";
import { GestacionEstadoBadge } from "../components";
import { GESTACIONES_PERMISSIONS } from "../permissions";
import { getGestacion } from "../services";
import { Gestacion } from "../types";
import {
  formatAnimalLabel,
  formatDate,
  getResultadoLabel,
  getTipoServicioLabel,
} from "../utils";

export default function GestacionDetailPage() {
  const { id } = useParams();
  const gestacionId = Number(id);

  const [gestacion, setGestacion] = useState<Gestacion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGestacion = async () => {
      try {
        const data = await getGestacion(gestacionId);
        setGestacion(data);
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar el detalle de la gestación.");
      } finally {
        setLoading(false);
      }
    };

    if (gestacionId) {
      loadGestacion();
    }
  }, [gestacionId]);

  if (loading) {
    return <div>Cargando detalle...</div>;
  }

  if (error || !gestacion) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
        {error ?? "Gestación no encontrada."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <PageBreadCrumb
          pageTitle={`Gestación #${gestacion.id}`}
          items={breadcrumbs.gestacionDetalle}
        />
        <div className="flex gap-3">
          <Link
            to={GESTACION_ROUTES.list}
            className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-3 text-sm text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700"
          >
            Volver al listado
          </Link>
          <PermissionGate permission={GESTACIONES_PERMISSIONS.update}>
            <Link
              to={GESTACION_ROUTES.edit(gestacion.id)}
              className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-3 text-sm text-white hover:bg-brand-600"
            >
              Editar
            </Link>
          </PermissionGate>
        </div>
      </div>

      <ComponentCard title="Detalle de Gestación">
        <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Servicio reproductivo</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              #{gestacion.servicio_id}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Estado</dt>
            <dd>
              <GestacionEstadoBadge estado={gestacion.estado} />
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Hembra</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {formatAnimalLabel(
                gestacion.servicio_hembra_codigo,
                gestacion.servicio_hembra_arete
              )}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Macho</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {gestacion.servicio_macho_codigo
                ? formatAnimalLabel(
                    gestacion.servicio_macho_codigo,
                    gestacion.servicio_macho_arete
                  )
                : "Sin macho registrado"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Fecha de servicio</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {formatDate(gestacion.servicio_fecha_servicio)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Tipo de servicio</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {getTipoServicioLabel(gestacion.servicio_tipo_servicio)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Resultado del servicio</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {getResultadoLabel(gestacion.servicio_resultado)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Fecha de confirmación</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {formatDate(gestacion.fecha_confirmacion)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Fecha probable de parto</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {formatDate(gestacion.fecha_probable_parto)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Última actualización</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {gestacion.updated_at
                ? new Date(gestacion.updated_at).toLocaleString("es-PY")
                : "—"}
            </dd>
          </div>
          <div className="md:col-span-2">
            <dt className="text-sm text-gray-500 dark:text-gray-400">Observaciones</dt>
            <dd className="mt-1 text-gray-700 dark:text-gray-300">
              {gestacion.observaciones || "Sin observaciones"}
            </dd>
          </div>
        </dl>
      </ComponentCard>
    </div>
  );
}
