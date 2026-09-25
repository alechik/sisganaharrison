import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import PermissionGate from "@/components/auth/PermissionGate";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { TIPO_SALIDA_ROUTES } from "../constants";
import { TIPOS_SALIDAS_PERMISSIONS } from "../permissions";
import { getTipoSalida } from "../services";
import { TipoSalida } from "../types";

export default function TipoSalidaDetailPage() {
  const { id } = useParams();
  const tipoSalidaId = Number(id);

  const [tipo, setTipo] = useState<TipoSalida | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setTipo(await getTipoSalida(tipoSalidaId));
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar el detalle del tipo de salida.");
      } finally {
        setLoading(false);
      }
    };

    if (tipoSalidaId) {
      load();
    }
  }, [tipoSalidaId]);

  if (loading) {
    return <div>Cargando detalle...</div>;
  }

  if (error || !tipo) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
        {error ?? "Tipo de salida no encontrado."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <PageBreadCrumb pageTitle={tipo.nombre} items={breadcrumbs.tipoSalidaDetalle} />
        <div className="flex gap-3">
          <Link
            to={TIPO_SALIDA_ROUTES.list}
            className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-3 text-sm text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700"
          >
            Volver al listado
          </Link>
          <PermissionGate permission={TIPOS_SALIDAS_PERMISSIONS.update}>
            <Link
              to={TIPO_SALIDA_ROUTES.edit(tipo.id)}
              className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-3 text-sm text-white hover:bg-brand-600"
            >
              Editar
            </Link>
          </PermissionGate>
        </div>
      </div>

      <ComponentCard title="Detalle de tipo de salida">
        <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Nombre</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{tipo.nombre}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Fecha de creación</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {tipo.created_at ? new Date(tipo.created_at).toLocaleString("es-PY") : "—"}
            </dd>
          </div>
        </dl>
      </ComponentCard>
    </div>
  );
}
