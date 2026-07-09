import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import PermissionGate from "@/components/auth/PermissionGate";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { PotreroStatusBadge } from "../components";
import { POTRERO_ROUTES } from "../constants";
import { POTREROS_PERMISSIONS } from "../permissions";
import { getPotrero } from "../services";
import { Potrero } from "../types";

export default function PotreroDetailPage() {
  const { id } = useParams();
  const potreroId = Number(id);

  const [potrero, setPotrero] = useState<Potrero | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPotrero = async () => {
      try {
        const data = await getPotrero(potreroId);
        setPotrero(data);
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar el detalle del potrero.");
      } finally {
        setLoading(false);
      }
    };

    if (potreroId) {
      loadPotrero();
    }
  }, [potreroId]);

  if (loading) {
    return <div>Cargando detalle...</div>;
  }

  if (error || !potrero) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
        {error ?? "Potrero no encontrado."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <PageBreadCrumb
          pageTitle={potrero.nombre}
          items={breadcrumbs.potreroDetalle}
        />
        <div className="flex gap-3">
          <Link
            to={POTRERO_ROUTES.list}
            className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-3 text-sm text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700"
          >
            Volver al listado
          </Link>
          <PermissionGate permission={POTREROS_PERMISSIONS.update}>
            <Link
              to={POTRERO_ROUTES.edit(potrero.id)}
              className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-3 text-sm text-white hover:bg-brand-600"
            >
              Editar
            </Link>
          </PermissionGate>
        </div>
      </div>

      <ComponentCard title="Detalle del potrero">
        <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Establecimiento</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {potrero.establecimiento_nombre || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Código</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{potrero.codigo}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Nombre</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{potrero.nombre}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Área (ha)</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {potrero.area_ha != null ? potrero.area_ha.toLocaleString("es-PY") : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Tipo de pasto</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {potrero.tipo_pasto || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Disponibilidad</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {potrero.disponibilidad ? "Disponible" : "No disponible"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Estado</dt>
            <dd className="mt-1">
              <PotreroStatusBadge active={potrero.activo} />
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Fecha de creación</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {potrero.created_at
                ? new Date(potrero.created_at).toLocaleString("es-PY")
                : "—"}
            </dd>
          </div>
          <div className="md:col-span-2">
            <dt className="text-sm text-gray-500 dark:text-gray-400">Descripción</dt>
            <dd className="mt-1 text-gray-700 dark:text-gray-300">
              {potrero.descripcion || "Sin descripción"}
            </dd>
          </div>
        </dl>
      </ComponentCard>
    </div>
  );
}
