import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import PermissionGate from "@/components/auth/PermissionGate";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { ParcelaStatusBadge } from "../components";
import { PARCELA_ROUTES } from "../constants";
import { PARCELAS_PERMISSIONS } from "../permissions";
import { getParcela } from "../services";
import { Parcela } from "../types";

export default function ParcelaDetailPage() {
  const { id } = useParams();
  const parcelaId = Number(id);

  const [parcela, setParcela] = useState<Parcela | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadParcela = async () => {
      try {
        const data = await getParcela(parcelaId);
        setParcela(data);
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar el detalle de la parcela.");
      } finally {
        setLoading(false);
      }
    };

    if (parcelaId) {
      loadParcela();
    }
  }, [parcelaId]);

  if (loading) {
    return <div>Cargando detalle...</div>;
  }

  if (error || !parcela) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
        {error ?? "Parcela no encontrada."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <PageBreadCrumb
          pageTitle={parcela.nombre}
          items={breadcrumbs.parcelaDetalle}
        />
        <div className="flex gap-3">
          <Link
            to={PARCELA_ROUTES.list}
            className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-3 text-sm text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700"
          >
            Volver al listado
          </Link>
          <PermissionGate permission={PARCELAS_PERMISSIONS.update}>
            <Link
              to={PARCELA_ROUTES.edit(parcela.id)}
              className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-3 text-sm text-white hover:bg-brand-600"
            >
              Editar
            </Link>
          </PermissionGate>
        </div>
      </div>

      <ComponentCard title="Detalle de la parcela">
        <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Estancia</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {parcela.estancia_nombre || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Código</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{parcela.codigo}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Nombre</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{parcela.nombre}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Área (ha)</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {parcela.area_ha != null ? parcela.area_ha.toLocaleString("es-PY") : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Tipo de pasto</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {parcela.tipo_pasto || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Disponibilidad</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {parcela.disponibilidad ? "Disponible" : "No disponible"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Estado</dt>
            <dd className="mt-1">
              <ParcelaStatusBadge active={parcela.activo} />
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Fecha de creación</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {parcela.created_at
                ? new Date(parcela.created_at).toLocaleString("es-PY")
                : "—"}
            </dd>
          </div>
          <div className="md:col-span-2">
            <dt className="text-sm text-gray-500 dark:text-gray-400">Descripción</dt>
            <dd className="mt-1 text-gray-700 dark:text-gray-300">
              {parcela.descripcion || "Sin descripción"}
            </dd>
          </div>
        </dl>
      </ComponentCard>
    </div>
  );
}
