import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import PermissionGate from "@/components/auth/PermissionGate";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { SERVICIO_REPRODUCTIVO_ROUTES } from "../constants";
import { SERVICIOS_REPRODUCTIVOS_PERMISSIONS } from "../permissions";
import { getServicioReproductivo } from "../services";
import { ServicioReproductivo } from "../types";
import { formatAnimalLabel, getResultadoLabel, getTipoServicioLabel } from "../utils";

export default function ServicioReproductivoDetailPage() {
  const { id } = useParams();
  const servicioId = Number(id);

  const [servicio, setServicio] = useState<ServicioReproductivo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadServicio = async () => {
      try {
        const data = await getServicioReproductivo(servicioId);
        setServicio(data);
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar el detalle del servicio reproductivo.");
      } finally {
        setLoading(false);
      }
    };

    if (servicioId) {
      loadServicio();
    }
  }, [servicioId]);

  if (loading) {
    return <div>Cargando detalle...</div>;
  }

  if (error || !servicio) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
        {error ?? "Servicio reproductivo no encontrado."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <PageBreadCrumb
          pageTitle={`Servicio #${servicio.id}`}
          items={breadcrumbs.servicioReproductivoDetalle}
        />
        <div className="flex gap-3">
          <Link
            to={SERVICIO_REPRODUCTIVO_ROUTES.list}
            className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-3 text-sm text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700"
          >
            Volver al listado
          </Link>
          <PermissionGate permission={SERVICIOS_REPRODUCTIVOS_PERMISSIONS.update}>
            <Link
              to={SERVICIO_REPRODUCTIVO_ROUTES.edit(servicio.id)}
              className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-3 text-sm text-white hover:bg-brand-600"
            >
              Editar
            </Link>
          </PermissionGate>
        </div>
      </div>

      <ComponentCard title="Detalle de Servicio Reproductivo">
        <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Hembra</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {formatAnimalLabel(servicio.hembra_codigo, servicio.hembra_arete)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Macho</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {servicio.macho_id
                ? formatAnimalLabel(servicio.macho_codigo, servicio.macho_arete)
                : "Sin macho registrado"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Fecha de servicio</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {servicio.fecha_servicio
                ? new Date(`${servicio.fecha_servicio}T00:00:00`).toLocaleDateString("es-PY")
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Tipo de servicio</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {getTipoServicioLabel(servicio.tipo_servicio)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Resultado</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {getResultadoLabel(servicio.resultado)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Última actualización</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {servicio.updated_at
                ? new Date(servicio.updated_at).toLocaleString("es-PY")
                : "—"}
            </dd>
          </div>
          <div className="md:col-span-2">
            <dt className="text-sm text-gray-500 dark:text-gray-400">Observaciones</dt>
            <dd className="mt-1 text-gray-700 dark:text-gray-300">
              {servicio.observaciones || "Sin observaciones"}
            </dd>
          </div>
        </dl>
      </ComponentCard>
    </div>
  );
}
