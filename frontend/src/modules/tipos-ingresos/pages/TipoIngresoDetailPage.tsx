import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import PermissionGate from "@/components/auth/PermissionGate";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { TipoIngresoStatusBadge } from "../components";
import { TIPO_INGRESO_ROUTES } from "../constants";
import { TIPOS_INGRESOS_PERMISSIONS } from "../permissions";
import { getTipoIngreso } from "../services";
import { TipoIngreso } from "../types";

export default function TipoIngresoDetailPage() {
  const { id } = useParams();
  const tipoId = Number(id);

  const [tipo, setTipo] = useState<TipoIngreso | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setTipo(await getTipoIngreso(tipoId));
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar el detalle del tipo de ingreso.");
      } finally {
        setLoading(false);
      }
    };

    if (tipoId) {
      load();
    }
  }, [tipoId]);

  if (loading) {
    return <div>Cargando detalle...</div>;
  }

  if (error || !tipo) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
        {error ?? "Tipo de ingreso no encontrado."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <PageBreadCrumb pageTitle={tipo.nombre} items={breadcrumbs.tipoIngresoDetalle} />
        <div className="flex gap-3">
          <Link
            to={TIPO_INGRESO_ROUTES.list}
            className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-3 text-sm text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700"
          >
            Volver al listado
          </Link>
          <PermissionGate permission={TIPOS_INGRESOS_PERMISSIONS.update}>
            <Link
              to={TIPO_INGRESO_ROUTES.edit(tipo.id)}
              className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-3 text-sm text-white hover:bg-brand-600"
            >
              Editar
            </Link>
          </PermissionGate>
        </div>
      </div>

      <ComponentCard title="Detalle de tipo de ingreso">
        <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Nombre</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{tipo.nombre}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Código</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{tipo.codigo}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Iniciales</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{tipo.iniciales}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Prefijo de correlativo</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">IN{tipo.iniciales}000001</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Proveedor</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {tipo.requiere_proveedor ? "Obligatorio" : "Opcional"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Estado</dt>
            <dd className="mt-1">
              <TipoIngresoStatusBadge active={tipo.estado} />
            </dd>
          </div>
          <div className="md:col-span-2">
            <dt className="text-sm text-gray-500 dark:text-gray-400">Descripción</dt>
            <dd className="mt-1 text-gray-700 dark:text-gray-300">
              {tipo.descripcion || "Sin descripción"}
            </dd>
          </div>
        </dl>
      </ComponentCard>
    </div>
  );
}
