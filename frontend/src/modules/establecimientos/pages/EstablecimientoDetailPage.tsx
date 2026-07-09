import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import PermissionGate from "@/components/auth/PermissionGate";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { EstablecimientoStatusBadge } from "../components";
import { ESTABLECIMIENTO_ROUTES } from "../constants";
import { ESTABLECIMIENTOS_PERMISSIONS } from "../permissions";
import { getEstablecimiento } from "../services";
import { Establecimiento } from "../types";

export default function EstablecimientoDetailPage() {
  const { id } = useParams();
  const establecimientoId = Number(id);

  const [establecimiento, setEstablecimiento] = useState<Establecimiento | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEstablecimiento = async () => {
      try {
        const data = await getEstablecimiento(establecimientoId);
        setEstablecimiento(data);
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar el detalle del establecimiento.");
      } finally {
        setLoading(false);
      }
    };

    if (establecimientoId) {
      loadEstablecimiento();
    }
  }, [establecimientoId]);

  if (loading) {
    return <div>Cargando detalle...</div>;
  }

  if (error || !establecimiento) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
        {error ?? "Establecimiento no encontrado."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <PageBreadCrumb
          pageTitle={establecimiento.nombre}
          items={breadcrumbs.establecimientoDetalle}
        />
        <div className="flex gap-3">
          <Link
            to={ESTABLECIMIENTO_ROUTES.list}
            className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-3 text-sm text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700"
          >
            Volver al listado
          </Link>
          <PermissionGate permission={ESTABLECIMIENTOS_PERMISSIONS.update}>
            <Link
              to={ESTABLECIMIENTO_ROUTES.edit(establecimiento.id)}
              className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-3 text-sm text-white hover:bg-brand-600"
            >
              Editar
            </Link>
          </PermissionGate>
        </div>
      </div>

      <ComponentCard title="Detalle del establecimiento">
        <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Código</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{establecimiento.codigo}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Nombre</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{establecimiento.nombre}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Propietario</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {establecimiento.propietario || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Teléfono</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {establecimiento.telefono || "—"}
            </dd>
          </div>
          <div className="md:col-span-2">
            <dt className="text-sm text-gray-500 dark:text-gray-400">Dirección</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {establecimiento.direccion || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Municipio</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {establecimiento.municipio || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Departamento</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {establecimiento.departamento || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">País</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{establecimiento.pais}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Área total (ha)</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {establecimiento.area_total_ha != null
                ? establecimiento.area_total_ha.toLocaleString("es-PY")
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Estado</dt>
            <dd className="mt-1">
              <EstablecimientoStatusBadge active={establecimiento.activo} />
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Fecha de creación</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {establecimiento.created_at
                ? new Date(establecimiento.created_at).toLocaleString("es-PY")
                : "—"}
            </dd>
          </div>
          <div className="md:col-span-2">
            <dt className="text-sm text-gray-500 dark:text-gray-400">Descripción</dt>
            <dd className="mt-1 text-gray-700 dark:text-gray-300">
              {establecimiento.descripcion || "Sin descripción"}
            </dd>
          </div>
        </dl>
      </ComponentCard>
    </div>
  );
}
