import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import PermissionGate from "@/components/auth/PermissionGate";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import Button from "@/components/ui/button/Button";
import { SERVICIO_REPRODUCTIVO_ROUTES, TIPO_INSEMINACION_ARTIFICIAL } from "../constants";
import { SERVICIOS_REPRODUCTIVOS_PERMISSIONS } from "../permissions";
import { downloadServicioReproductivoPdf, getServicioReproductivo } from "../services";
import { ServicioReproductivo } from "../types";
import { formatAnimalLabel, getResultadoLabel, getTipoServicioLabel } from "../utils";

export default function ServicioReproductivoDetailPage() {
  const { id } = useParams();
  const servicioId = Number(id);

  const [servicio, setServicio] = useState<ServicioReproductivo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadServicio = async () => {
      try {
        const data = await getServicioReproductivo(servicioId);
        setServicio(data);
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar el detalle del servicio reproductivo.");
      } finally {
        setLoading(false);
      }
    };

    if (servicioId) {
      loadServicio();
    }
  }, [servicioId]);

  if (loading) {
    return <div>Cargando detalle...</div>;
  }

  if (error || !servicio) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
        {error ?? "Servicio reproductivo no encontrado."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <PageBreadCrumb
          pageTitle={servicio.codigo_servicio || `Servicio #${servicio.id}`}
          items={breadcrumbs.servicioReproductivoDetalle}
        />
        <div className="flex gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              downloadServicioReproductivoPdf(servicio.id, servicio.codigo_servicio || `SRV-${servicio.id}`)
            }
          >
            PDF
          </Button>
          <Link
            to={SERVICIO_REPRODUCTIVO_ROUTES.listByTipo(servicio.tipo_servicio)}
            className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-3 text-sm text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700"
          >
            Volver al listado
          </Link>
          <PermissionGate permission={SERVICIOS_REPRODUCTIVOS_PERMISSIONS.update}>
            <Link
              to={SERVICIO_REPRODUCTIVO_ROUTES.edit(servicio.id)}
              className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-3 text-sm text-white hover:bg-brand-600"
            >
              Editar
            </Link>
          </PermissionGate>
        </div>
      </div>

      <ComponentCard title="Detalle de Servicio Reproductivo">
        <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Código</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {servicio.codigo_servicio || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Registrado por</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {servicio.usuario_nombre || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Hembra</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {formatAnimalLabel(servicio.hembra_codigo, servicio.hembra_arete)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">
              {servicio.tipo_servicio === TIPO_INSEMINACION_ARTIFICIAL ? "Semen" : "Macho"}
            </dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {servicio.tipo_servicio === TIPO_INSEMINACION_ARTIFICIAL
                ? servicio.semen_nombre || "—"
                : servicio.macho_id
                  ? formatAnimalLabel(servicio.macho_codigo, servicio.macho_arete)
                  : "Sin macho registrado"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Fecha de servicio</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {servicio.fecha_servicio
                ? new Date(`${servicio.fecha_servicio}T00:00:00`).toLocaleDateString("es-PY")
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Tipo de servicio</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {getTipoServicioLabel(servicio.tipo_servicio)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Resultado</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {getResultadoLabel(servicio.resultado)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Última actualización</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {servicio.updated_at
                ? new Date(servicio.updated_at).toLocaleString("es-PY")
                : "—"}
            </dd>
          </div>
          <div className="md:col-span-2">
            <dt className="text-sm text-gray-500 dark:text-gray-400">Observaciones</dt>
            <dd className="mt-1 text-gray-700 dark:text-gray-300">
              {servicio.observaciones || "Sin observaciones"}
            </dd>
          </div>
        </dl>
      </ComponentCard>

      <ComponentCard title="Gestación, parto y nacimiento">
        {!servicio.gestacion ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Aún no hay gestación confirmada para este servicio.
          </p>
        ) : (
          <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">Estado de gestación</dt>
              <dd className="font-medium text-gray-800 dark:text-white/90">{servicio.gestacion.estado}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">Fecha de confirmación</dt>
              <dd className="font-medium text-gray-800 dark:text-white/90">
                {servicio.gestacion.fecha_confirmacion
                  ? new Date(`${servicio.gestacion.fecha_confirmacion}T00:00:00`).toLocaleDateString("es-PY")
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">Fecha probable de parto</dt>
              <dd className="font-medium text-gray-800 dark:text-white/90">
                {servicio.gestacion.fecha_probable_parto
                  ? new Date(`${servicio.gestacion.fecha_probable_parto}T00:00:00`).toLocaleDateString("es-PY")
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">Parto</dt>
              <dd className="font-medium text-gray-800 dark:text-white/90">
                {servicio.gestacion.parto?.fecha_parto
                  ? new Date(`${servicio.gestacion.parto.fecha_parto}T00:00:00`).toLocaleDateString("es-PY")
                  : "Sin parto"}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">Nacimiento</dt>
              <dd className="font-medium text-gray-800 dark:text-white/90">
                {servicio.gestacion.parto?.nacimiento
                  ? `${servicio.gestacion.parto.nacimiento.estado_nacimiento} — ${servicio.gestacion.parto.nacimiento.sexo}`
                  : "Sin nacimiento"}
              </dd>
            </div>
          </dl>
        )}
      </ComponentCard>

      {servicio.tipo_servicio === TIPO_INSEMINACION_ARTIFICIAL ? (
      <ComponentCard title="Semen utilizado">
        {(servicio.insumos ?? []).length === 0 ? (
          <p className="text-sm text-gray-500">Sin semen asociado.</p>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left">Producto</th>
                <th className="px-3 py-2 text-left">Almacén</th>
                <th className="px-3 py-2 text-right">Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {(servicio.insumos ?? []).map((insumo) => (
                <tr key={insumo.id ?? `${insumo.producto_id}-${insumo.almacen_id}`}>
                  <td className="px-3 py-2">{insumo.producto_nombre || insumo.producto_codigo || insumo.producto_id}</td>
                  <td className="px-3 py-2">{insumo.almacen_nombre || "—"}</td>
                  <td className="px-3 py-2 text-right">{insumo.cantidad}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </ComponentCard>
      ) : null}
    </div>
  );
}
