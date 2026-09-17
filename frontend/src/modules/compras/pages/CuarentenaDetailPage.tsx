import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import PermissionGate from "@/components/auth/PermissionGate";
import ComponentCard from "@/components/common/ComponentCard";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { breadcrumbs } from "@/config/breadcrumbs";
import { CuarentenaOrigenBadge, CuarentenaStatusBadge } from "../components";
import { CUARENTENA_ROUTES, INGRESO_ROUTES, ORDEN_COMPRA_ROUTES } from "../constants";
import { useGestionCuarentena } from "../hooks";
import { COMPRAS_PERMISSIONS } from "../permissions";
import { downloadCuarentenaPdf, getCuarentena } from "../services";
import { Cuarentena } from "../types";
import { formatDate, formatEdad, formatMoney, formatPeso, formatSexo, getEstadoLabel, isCompletada, isProcesada } from "../utils";

export default function CuarentenaDetailPage() {
  const { id } = useParams();
  const cuarentenaId = Number(id);
  const [item, setItem] = useState<Cuarentena | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmComplete, setConfirmComplete] = useState(false);
  const { completar, loading: completing, error: completeError, setError: setCompleteError } =
    useGestionCuarentena();

  useEffect(() => {
    const load = async () => {
      try {
        setItem(await getCuarentena(cuarentenaId));
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar el detalle de la cuarentena.");
      } finally {
        setLoading(false);
      }
    };

    if (cuarentenaId) {
      load();
    }
  }, [cuarentenaId]);

  const handlePdf = async () => {
    if (!item) {
      return;
    }
    try {
      await downloadCuarentenaPdf(item.id, item.cod_compra);
    } catch (err) {
      console.error(err);
      setError("No se pudo generar el PDF.");
    }
  };

  const handleCompletar = async () => {
    if (!item) {
      return;
    }
    try {
      const response = await completar(item.id);
      setItem(response.data);
      setConfirmComplete(false);
    } catch {
      // handled
    }
  };

  if (loading) {
    return <div>Cargando detalle...</div>;
  }

  if (error || !item) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
        {error ?? "Cuarentena no encontrada."}
      </div>
    );
  }

  const sumaLineas = (item.detalles ?? []).reduce((acc, line) => acc + (line.subtotal ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <PageBreadCrumb pageTitle={item.cod_compra} items={breadcrumbs.cuarentenaDetalle} />
        <div className="flex flex-wrap gap-3">
          <Link
            to={CUARENTENA_ROUTES.list}
            className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-3 text-sm text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700"
          >
            Volver al listado
          </Link>
          <button
            type="button"
            onClick={handlePdf}
            className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-3 text-sm text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700"
          >
            Descargar PDF
          </button>
          {isProcesada(item.estado) && (
            <>
              <PermissionGate permission={COMPRAS_PERMISSIONS.create}>
                <Link
                  to={CUARENTENA_ROUTES.edit(item.id)}
                  className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-3 text-sm text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                  Editar
                </Link>
              </PermissionGate>
              <PermissionGate permission={COMPRAS_PERMISSIONS.create}>
                <button
                  type="button"
                  onClick={() => {
                    setCompleteError(null);
                    setConfirmComplete(true);
                  }}
                  className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-3 text-sm text-white hover:bg-brand-600"
                >
                  Completar
                </button>
              </PermissionGate>
            </>
          )}
          {isCompletada(item.estado) && (
            <PermissionGate permission={COMPRAS_PERMISSIONS.create}>
              <Link
                to={`${INGRESO_ROUTES.create}?cuarentena_id=${item.id}`}
                className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-3 text-sm text-white hover:bg-brand-600"
              >
                Registrar ingreso
              </Link>
            </PermissionGate>
          )}
        </div>
      </div>

      {completeError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {completeError}
        </div>
      )}

      <ComponentCard title="Cabecera de la cuarentena">
        <dl className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm text-gray-500">Código</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{item.cod_compra}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Origen</dt>
            <dd className="mt-1">
              <CuarentenaOrigenBadge origen={item.origen} />
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Estado</dt>
            <dd className="mt-1">
              <CuarentenaStatusBadge estado={item.estado} />
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Proveedor</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {item.proveedor_razon_social || "—"}
              {item.proveedor_nit ? ` · NIT ${item.proveedor_nit}` : ""}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Usuario</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{item.creador_nombre || "—"}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Orden de compra</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {item.orden_compra_id ? (
                <Link className="text-brand-500 hover:underline" to={ORDEN_COMPRA_ROUTES.detail(item.orden_compra_id)}>
                  {item.orden_compra_codigo || `OC #${item.orden_compra_id}`}
                </Link>
              ) : (
                "Sin orden (excepción directa)"
              )}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Fecha de inicio</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{formatDate(item.fecha_inicio)}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Fecha de fin</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{formatDate(item.fecha_fin)}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Total peso</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{formatPeso(item.total_peso)}</dd>
          </div>
        </dl>
      </ComponentCard>

      <ComponentCard title="Animales identificados">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell isHeader className="px-4 py-3 font-semibold">Código</TableCell>
              <TableCell isHeader className="px-4 py-3 font-semibold">Sexo</TableCell>
              <TableCell isHeader className="px-4 py-3 font-semibold">Categoría</TableCell>
              <TableCell isHeader className="px-4 py-3 font-semibold">Edad</TableCell>
              <TableCell isHeader className="px-4 py-3 font-semibold">Cantidad</TableCell>
              <TableCell isHeader className="px-4 py-3 font-semibold">Peso</TableCell>
              <TableCell isHeader className="px-4 py-3 font-semibold">Precio</TableCell>
              <TableCell isHeader className="px-4 py-3 font-semibold">Descuento</TableCell>
              <TableCell isHeader className="px-4 py-3 font-semibold">Subtotal</TableCell>
              <TableCell isHeader className="px-4 py-3 font-semibold">Estado</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(item.detalles ?? []).map((detalle) => (
              <TableRow key={detalle.id}>
                <TableCell className="px-4 py-3">{detalle.animal_codigo || "—"}</TableCell>
                <TableCell className="px-4 py-3">{formatSexo(detalle.sexo)}</TableCell>
                <TableCell className="px-4 py-3">
                  {detalle.categoria_codigo} — {detalle.categoria_nombre}
                </TableCell>
                <TableCell className="px-4 py-3">{formatEdad(detalle.edad)}</TableCell>
                <TableCell className="px-4 py-3">{detalle.cantidad}</TableCell>
                <TableCell className="px-4 py-3">{formatPeso(detalle.peso)}</TableCell>
                <TableCell className="px-4 py-3">{formatMoney(detalle.precio)}</TableCell>
                <TableCell className="px-4 py-3">{formatMoney(detalle.descuento)}</TableCell>
                <TableCell className="px-4 py-3">{formatMoney(detalle.subtotal)}</TableCell>
                <TableCell className="px-4 py-3">{getEstadoLabel(detalle.estado)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="mt-4 space-y-1 text-sm">
          <p>Total peso: {formatPeso(item.total_peso)}</p>
          <p>Suma de subtotales: {formatMoney(sumaLineas)}</p>
          <p>Descuento general: {formatMoney(item.descuento)}</p>
          <p className="font-semibold">Monto total: {formatMoney(item.monto_total)}</p>
        </div>
      </ComponentCard>

      <ConfirmDialog
        isOpen={confirmComplete}
        title="Completar cuarentena"
        message={`¿Confirma que finalizó el proceso de ${item.cod_compra}? Se registrará la fecha de fin y no podrá modificarse.`}
        confirmLabel="Completar"
        loading={completing}
        onConfirm={handleCompletar}
        onCancel={() => setConfirmComplete(false)}
      />
    </div>
  );
}
