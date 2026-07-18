import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PermissionGate from "@/components/auth/PermissionGate";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { NACIMIENTO_ROUTES } from "../constants";
import { NacimientoEstadoBadge } from "../components";
import { NACIMIENTOS_PERMISSIONS } from "../permissions";
import { getNacimiento } from "../services";
import { Nacimiento } from "../types";
import {
  formatDate,
  getEstadoGestacionLabel,
  getSexoLabel,
  getTipoServicioLabel,
} from "../utils";

export default function NacimientoDetailPage() {
  const { id } = useParams();
  const nacimientoId = Number(id);
  const [nacimiento, setNacimiento] = useState<Nacimiento | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setNacimiento(await getNacimiento(nacimientoId));
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar el detalle del nacimiento.");
      } finally {
        setLoading(false);
      }
    };
    if (nacimientoId) load();
  }, [nacimientoId]);

  if (loading) return <div>Cargando detalle...</div>;
  if (error || !nacimiento) {
    return <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error ?? "Nacimiento no encontrado."}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <PageBreadCrumb pageTitle={`Nacimiento #${nacimiento.id}`} items={breadcrumbs.nacimientoDetalle} />
        <div className="flex gap-3">
          <Link to={NACIMIENTO_ROUTES.list} className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-3 text-sm text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700">Volver al listado</Link>
          <PermissionGate permission={NACIMIENTOS_PERMISSIONS.update}>
            <Link to={NACIMIENTO_ROUTES.edit(nacimiento.id)} className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-3 text-sm text-white hover:bg-brand-600">Editar</Link>
          </PermissionGate>
        </div>
      </div>

      <ComponentCard title="Detalle de Nacimiento">
        <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div><dt className="text-sm text-gray-500">Fecha de parto</dt><dd className="font-medium text-gray-800 dark:text-white/90">{formatDate(nacimiento.parto_fecha_parto)}</dd></div>
          <div><dt className="text-sm text-gray-500">Estado de gestación</dt><dd className="font-medium text-gray-800 dark:text-white/90">{getEstadoGestacionLabel(nacimiento.parto_gestacion_estado)}</dd></div>
          <div><dt className="text-sm text-gray-500">Fecha de servicio</dt><dd className="font-medium text-gray-800 dark:text-white/90">{formatDate(nacimiento.parto_gestacion_servicio_fecha_servicio)}</dd></div>
          <div><dt className="text-sm text-gray-500">Tipo de servicio</dt><dd className="font-medium text-gray-800 dark:text-white/90">{getTipoServicioLabel(nacimiento.parto_gestacion_servicio_tipo_servicio)}</dd></div>
          <div><dt className="text-sm text-gray-500">Código hembra</dt><dd className="font-medium text-gray-800 dark:text-white/90">{nacimiento.parto_gestacion_servicio_hembra_codigo || "—"}</dd></div>
          <div><dt className="text-sm text-gray-500">Arete hembra</dt><dd className="font-medium text-gray-800 dark:text-white/90">{nacimiento.parto_gestacion_servicio_hembra_arete || "—"}</dd></div>
          <div><dt className="text-sm text-gray-500">Código macho</dt><dd className="font-medium text-gray-800 dark:text-white/90">{nacimiento.parto_gestacion_servicio_macho_codigo || "—"}</dd></div>
          <div><dt className="text-sm text-gray-500">Arete macho</dt><dd className="font-medium text-gray-800 dark:text-white/90">{nacimiento.parto_gestacion_servicio_macho_arete || "—"}</dd></div>
          <div><dt className="text-sm text-gray-500">Código animal</dt><dd className="font-medium text-gray-800 dark:text-white/90">{nacimiento.animal_codigo || "—"}</dd></div>
          <div><dt className="text-sm text-gray-500">Arete animal</dt><dd className="font-medium text-gray-800 dark:text-white/90">{nacimiento.animal_arete || "—"}</dd></div>
          <div><dt className="text-sm text-gray-500">Estado de nacimiento</dt><dd><NacimientoEstadoBadge estado={nacimiento.estado_nacimiento} /></dd></div>
          <div><dt className="text-sm text-gray-500">Sexo</dt><dd className="font-medium text-gray-800 dark:text-white/90">{getSexoLabel(nacimiento.sexo)}</dd></div>
          <div><dt className="text-sm text-gray-500">Arete cría</dt><dd className="font-medium text-gray-800 dark:text-white/90">{nacimiento.arete || "—"}</dd></div>
          <div><dt className="text-sm text-gray-500">Peso al nacer</dt><dd className="font-medium text-gray-800 dark:text-white/90">{nacimiento.peso_nacimiento ?? "—"}</dd></div>
          <div><dt className="text-sm text-gray-500">Registrado por</dt><dd className="font-medium text-gray-800 dark:text-white/90">{nacimiento.registrado_por_nombre || "—"}</dd></div>
          <div><dt className="text-sm text-gray-500">Última actualización</dt><dd className="font-medium text-gray-800 dark:text-white/90">{nacimiento.updated_at ? new Date(nacimiento.updated_at).toLocaleString("es-PY") : "—"}</dd></div>
          {nacimiento.estado_nacimiento === "MUERTO" && (
            <div className="md:col-span-2"><dt className="text-sm text-gray-500">Causa de muerte</dt><dd className="font-medium text-gray-800 dark:text-white/90">{nacimiento.causa_muerte || "—"}</dd></div>
          )}
          <div className="md:col-span-2"><dt className="text-sm text-gray-500">Observaciones</dt><dd className="mt-1 text-gray-700 dark:text-gray-300">{nacimiento.observaciones || "Sin observaciones"}</dd></div>
        </dl>
      </ComponentCard>
    </div>
  );
}
