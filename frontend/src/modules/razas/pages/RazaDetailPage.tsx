import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import PermissionGate from "@/components/auth/PermissionGate";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { RazaStatusBadge } from "../components";
import { RAZA_ROUTES } from "../constants";
import { RAZAS_PERMISSIONS } from "../permissions";
import { getRaza } from "../services";
import { Raza } from "../types";

export default function RazaDetailPage() {
  const { id } = useParams();
  const razaId = Number(id);

  const [raza, setRaza] = useState<Raza | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRaza = async () => {
      try {
        const data = await getRaza(razaId);
        setRaza(data);
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar el detalle de la raza.");
      } finally {
        setLoading(false);
      }
    };

    if (razaId) {
      loadRaza();
    }
  }, [razaId]);

  if (loading) {
    return <div>Cargando detalle...</div>;
  }

  if (error || !raza) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
        {error ?? "Raza no encontrada."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <PageBreadCrumb pageTitle={raza.nombre} items={breadcrumbs.razaDetalle} />
        <div className="flex gap-3">
          <Link
            to={RAZA_ROUTES.list}
            className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-3 text-sm text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700"
          >
            Volver al listado
          </Link>
          <PermissionGate permission={RAZAS_PERMISSIONS.update}>
            <Link
              to={RAZA_ROUTES.edit(raza.id)}
              className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-3 text-sm text-white hover:bg-brand-600"
            >
              Editar
            </Link>
          </PermissionGate>
        </div>
      </div>

      <ComponentCard title="Detalle de Raza">
        <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Nombre</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{raza.nombre}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Código</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{raza.codigo}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Estado</dt>
            <dd className="mt-1">
              <RazaStatusBadge active={raza.estado} />
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Fecha de creación</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {raza.created_at
                ? new Date(raza.created_at).toLocaleString("es-PY")
                : "—"}
            </dd>
          </div>
          <div className="md:col-span-2">
            <dt className="text-sm text-gray-500 dark:text-gray-400">Descripción</dt>
            <dd className="mt-1 text-gray-700 dark:text-gray-300">
              {raza.descripcion || "Sin descripción"}
            </dd>
          </div>
        </dl>
      </ComponentCard>
    </div>
  );
}
