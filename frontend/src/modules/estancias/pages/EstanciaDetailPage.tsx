import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import PermissionGate from "@/components/auth/PermissionGate";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { EstanciaStatusBadge } from "../components";
import { ESTANCIA_ROUTES } from "../constants";
import { ESTANCIAS_PERMISSIONS } from "../permissions";
import { getEstancia } from "../services";
import { Estancia } from "../types";

export default function EstanciaDetailPage() {
  const { id } = useParams();
  const estanciaId = Number(id);

  const [estancia, setEstancia] = useState<Estancia | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEstancia = async () => {
      try {
        const data = await getEstancia(estanciaId);
        setEstancia(data);
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar el detalle de la estancia.");
      } finally {
        setLoading(false);
      }
    };

    if (estanciaId) {
      loadEstancia();
    }
  }, [estanciaId]);

  if (loading) {
    return <div>Cargando detalle...</div>;
  }

  if (error || !estancia) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
        {error ?? "Estancia no encontrada."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <PageBreadCrumb
          pageTitle={estancia.nombre}
          items={breadcrumbs.estanciaDetalle}
        />
        <div className="flex gap-3">
          <Link
            to={ESTANCIA_ROUTES.list}
            className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-3 text-sm text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700"
          >
            Volver al listado
          </Link>
          <PermissionGate permission={ESTANCIAS_PERMISSIONS.update}>
            <Link
              to={ESTANCIA_ROUTES.edit(estancia.id)}
              className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-3 text-sm text-white hover:bg-brand-600"
            >
              Editar
            </Link>
          </PermissionGate>
        </div>
      </div>

      <ComponentCard title="Detalle de la estancia">
        <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Código</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{estancia.codigo}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Nombre</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{estancia.nombre}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Propietario</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {estancia.propietario || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Teléfono</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {estancia.telefono || "—"}
            </dd>
          </div>
          <div className="md:col-span-2">
            <dt className="text-sm text-gray-500 dark:text-gray-400">Dirección</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {estancia.direccion || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Municipio</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {estancia.municipio || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Departamento</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {estancia.departamento || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">País</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{estancia.pais}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Área total (ha)</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {estancia.area_total_ha != null
                ? estancia.area_total_ha.toLocaleString("es-PY")
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Estado</dt>
            <dd className="mt-1">
              <EstanciaStatusBadge active={estancia.activo} />
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Fecha de creación</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {estancia.created_at
                ? new Date(estancia.created_at).toLocaleString("es-PY")
                : "—"}
            </dd>
          </div>
          <div className="md:col-span-2">
            <dt className="text-sm text-gray-500 dark:text-gray-400">Descripción</dt>
            <dd className="mt-1 text-gray-700 dark:text-gray-300">
              {estancia.descripcion || "Sin descripción"}
            </dd>
          </div>
        </dl>
      </ComponentCard>
    </div>
  );
}
