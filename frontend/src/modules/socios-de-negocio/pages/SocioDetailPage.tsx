import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import PermissionGate from "@/components/auth/PermissionGate";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { SocioStatusBadge, SocioTipoBadges } from "../components";
import { SOCIO_ROUTES } from "../constants";
import { SOCIOS_PERMISSIONS } from "../permissions";
import { getSocio } from "../services";
import { Socio } from "../types";
import { formatDate, getEstadoCivilLabel, getSexoLabel, isSocioActivo } from "../utils";

export default function SocioDetailPage() {
  const { id } = useParams();
  const socioId = Number(id);
  const [socio, setSocio] = useState<Socio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setSocio(await getSocio(socioId));
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar el detalle del socio de negocio.");
      } finally {
        setLoading(false);
      }
    };

    if (socioId) {
      load();
    }
  }, [socioId]);

  if (loading) {
    return <div>Cargando detalle...</div>;
  }

  if (error || !socio) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
        {error ?? "Socio de negocio no encontrado."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <PageBreadCrumb pageTitle={socio.razon_social} items={breadcrumbs.socioDetalle} />
        <div className="flex gap-3">
          <Link
            to={SOCIO_ROUTES.list}
            className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-3 text-sm text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700"
          >
            Volver al listado
          </Link>
          <PermissionGate permission={SOCIOS_PERMISSIONS.update}>
            <Link
              to={SOCIO_ROUTES.edit(socio.id)}
              className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-3 text-sm text-white hover:bg-brand-600"
            >
              Editar
            </Link>
          </PermissionGate>
        </div>
      </div>

      <ComponentCard title="Detalle de socio de negocio">
        <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <dt className="text-sm text-gray-500">Razón social</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{socio.razon_social}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Tipo</dt>
            <dd className="mt-1"><SocioTipoBadges tipos={socio.tipos} /></dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Responsable</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{socio.responsable || "—"}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Email</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{socio.email || "—"}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">CI</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{socio.ci ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">NIT</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{socio.nit || "—"}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Celular</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{socio.celular ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Fecha de nacimiento</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{formatDate(socio.fecha_nacimiento)}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Sexo</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{getSexoLabel(socio.sexo)}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Estado civil</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{getEstadoCivilLabel(socio.estado_civil)}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Dirección</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{socio.direccion || "—"}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Estado</dt>
            <dd className="mt-1"><SocioStatusBadge active={isSocioActivo(socio.estado)} /></dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Fecha de registro</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{formatDate(socio.fecha_reg)}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Registrado por</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{socio.registrado_por_nombre || "—"}</dd>
          </div>
        </dl>
      </ComponentCard>
    </div>
  );
}
