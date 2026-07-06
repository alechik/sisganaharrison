import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import PermissionGate from "@/components/auth/PermissionGate";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { TipoMovimientoStatusBadge } from "../components";
import { TIPO_MOVIMIENTO_ROUTES } from "../constants";
import { TIPOS_MOVIMIENTOS_PERMISSIONS } from "../permissions";
import { getTipoMovimiento } from "../services";
import { TipoMovimiento } from "../types";

export default function TipoMovimientoDetailPage() {
  const { id } = useParams();
  const tipoMovimientoId = Number(id);

  const [estado, setEstado] = useState<TipoMovimiento | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEstado = async () => {
      try {
        const data = await getTipoMovimiento(tipoMovimientoId);
        setEstado(data);
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar el detalle del tipo de movimiento.");
      } finally {
        setLoading(false);
      }
    };

    if (tipoMovimientoId) {
      loadEstado();
    }
  }, [tipoMovimientoId]);

  if (loading) {
    return <div>Cargando detalle...</div>;
  }

  if (error || !estado) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
        {error ?? "tipo de movimiento no encontrado."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <PageBreadCrumb
          pageTitle={estado.nombre}
          items={breadcrumbs.tipoMovimientoDetalle}
        />
        <div className="flex gap-3">
          <Link
            to={TIPO_MOVIMIENTO_ROUTES.list}
            className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-3 text-sm text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700"
          >
            Volver al listado
          </Link>
          <PermissionGate permission={TIPOS_MOVIMIENTOS_PERMISSIONS.update}>
            <Link
              to={TIPO_MOVIMIENTO_ROUTES.edit(estado.id)}
              className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-3 text-sm text-white hover:bg-brand-600"
            >
              Editar
            </Link>
          </PermissionGate>
        </div>
      </div>

      <ComponentCard title="Detalle de tipo de movimiento">
        <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Código</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{estado.codigo}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Nombre</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{estado.nombre}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Estado</dt>
            <dd className="mt-1">
              <TipoMovimientoStatusBadge active={estado.activo} />
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Fecha de creación</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {estado.created_at
                ? new Date(estado.created_at).toLocaleString("es-PY")
                : "—"}
            </dd>
          </div>
          <div className="md:col-span-2">
            <dt className="text-sm text-gray-500 dark:text-gray-400">Descripción</dt>
            <dd className="mt-1 text-gray-700 dark:text-gray-300">
              {estado.descripcion || "Sin descripción"}
            </dd>
          </div>
        </dl>
      </ComponentCard>
    </div>
  );
}
