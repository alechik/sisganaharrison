import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import PermissionGate from "@/components/auth/PermissionGate";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { AlmacenStatusBadge } from "../components";
import { ALMACEN_ROUTES } from "../constants";
import { ALMACEN_PERMISSIONS } from "../permissions";
import { getAlmacen } from "../services";
import { Almacen } from "../types";

export default function AlmacenDetailPage() {
  const { id } = useParams();
  const almacenId = Number(id);

  const [item, setItem] = useState<Almacen | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setItem(await getAlmacen(almacenId));
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar el detalle del almacén.");
      } finally {
        setLoading(false);
      }
    };

    if (almacenId) {
      load();
    }
  }, [almacenId]);

  if (loading) {
    return <div>Cargando detalle...</div>;
  }

  if (error || !item) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
        {error ?? "Almacén no encontrado."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <PageBreadCrumb pageTitle={item.nombre} items={breadcrumbs.almacenDetalle} />
        <div className="flex gap-3">
          <Link
            to={ALMACEN_ROUTES.list}
            className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-3 text-sm text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700"
          >
            Volver al listado
          </Link>
          <PermissionGate permission={ALMACEN_PERMISSIONS.update}>
            <Link
              to={ALMACEN_ROUTES.edit(item.id)}
              className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-3 text-sm text-white hover:bg-brand-600"
            >
              Editar
            </Link>
          </PermissionGate>
        </div>
      </div>

      <ComponentCard title="Detalle de almacén">
        <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Nombre</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{item.nombre}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Estancia</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {item.establecimiento_nombre || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Estado</dt>
            <dd className="mt-1">
              <AlmacenStatusBadge active={item.activo} />
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Fecha de creación</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {item.created_at ? new Date(item.created_at).toLocaleString("es-PY") : "—"}
            </dd>
          </div>
          <div className="md:col-span-2">
            <dt className="text-sm text-gray-500 dark:text-gray-400">Dirección</dt>
            <dd className="mt-1 text-gray-700 dark:text-gray-300">{item.direccion || "Sin dirección"}</dd>
          </div>
          <div className="md:col-span-2">
            <dt className="text-sm text-gray-500 dark:text-gray-400">Observación</dt>
            <dd className="mt-1 text-gray-700 dark:text-gray-300">{item.observacion || "Sin observación"}</dd>
          </div>
        </dl>
      </ComponentCard>
    </div>
  );
}
