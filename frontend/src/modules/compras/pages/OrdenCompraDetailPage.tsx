import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import PermissionGate from "@/components/auth/PermissionGate";
import ComponentCard from "@/components/common/ComponentCard";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import TextArea from "@/components/form/input/TextArea";
import Label from "@/components/form/Label";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { breadcrumbs } from "@/config/breadcrumbs";
import { OrdenCompraStatusBadge } from "../components";
import { ORDEN_COMPRA_ROUTES } from "../constants";
import { useDecidirOrdenCompra } from "../hooks";
import { COMPRAS_PERMISSIONS } from "../permissions";
import { downloadOrdenCompraPdf, getOrdenCompra } from "../services";
import { OrdenCompra } from "../types";
import { formatDate, formatMoney, isPendiente } from "../utils";

export default function OrdenCompraDetailPage() {
  const { id } = useParams();
  const ordenId = Number(id);
  const [orden, setOrden] = useState<OrdenCompra | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [observacion, setObservacion] = useState("");
  const [dialog, setDialog] = useState<"autorizar" | "rechazar" | null>(null);
  const { autorizar, rechazar, loading: deciding, error: decisionError, setError: setDecisionError } =
    useDecidirOrdenCompra();

  const load = async () => {
    try {
      setOrden(await getOrdenCompra(ordenId));
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar el detalle de la orden de compra.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ordenId) {
      load();
    }
  }, [ordenId]);

  const handlePdf = async () => {
    if (!orden) {
      return;
    }
    try {
      await downloadOrdenCompraPdf(orden.id, orden.cod_compra);
    } catch (err) {
      console.error(err);
      setError("No se pudo generar el PDF.");
    }
  };

  const handleConfirm = async () => {
    if (!orden || !dialog) {
      return;
    }
    try {
      const response =
        dialog === "autorizar"
          ? await autorizar(orden.id, observacion)
          : await rechazar(orden.id, observacion);
      setOrden(response.data);
      setDialog(null);
      setObservacion("");
    } catch {
      // handled
    }
  };

  if (loading) {
    return <div>Cargando detalle...</div>;
  }

  if (error || !orden) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
        {error ?? "Orden de compra no encontrada."}
      </div>
    );
  }

  const sumaLineas = (orden.detalles ?? []).reduce((acc, line) => acc + (line.subtotal ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <PageBreadCrumb pageTitle={orden.cod_compra} items={breadcrumbs.ordenCompraDetalle} />
        <div className="flex flex-wrap gap-3">
          <Link
            to={ORDEN_COMPRA_ROUTES.list}
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
          {isPendiente(orden.estado) && (
            <PermissionGate permission={COMPRAS_PERMISSIONS.update}>
              <Link
                to={ORDEN_COMPRA_ROUTES.edit(orden.id)}
                className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-3 text-sm text-white hover:bg-brand-600"
              >
                Editar
              </Link>
            </PermissionGate>
          )}
        </div>
      </div>

      <ComponentCard title="Cabecera de la orden">
        <dl className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm text-gray-500">Código</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{orden.cod_compra}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Fecha</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{formatDate(orden.fecha)}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Estado</dt>
            <dd className="mt-1">
              <OrdenCompraStatusBadge estado={orden.estado} />
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Proveedor</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {orden.proveedor_razon_social || "—"}
              {orden.proveedor_nit ? ` · NIT ${orden.proveedor_nit}` : ""}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Usuario creador</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{orden.creador_nombre || "—"}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Total peso</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{orden.total_peso ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Autorizado / rechazado por</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{orden.autorizador_nombre || "—"}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Fecha de decisión</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {orden.fecha_decision ? new Date(orden.fecha_decision).toLocaleString("es-PY") : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Observación</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {orden.observacion_estado || "—"}
            </dd>
          </div>
        </dl>
      </ComponentCard>

      <ComponentCard title="Detalle por categoría">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell isHeader className="px-4 py-3 font-semibold">Categoría</TableCell>
              <TableCell isHeader className="px-4 py-3 font-semibold">Cantidad</TableCell>
              <TableCell isHeader className="px-4 py-3 font-semibold">Precio</TableCell>
              <TableCell isHeader className="px-4 py-3 font-semibold">Descuento</TableCell>
              <TableCell isHeader className="px-4 py-3 font-semibold">Subtotal</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(orden.detalles ?? []).map((detalle) => (
              <TableRow key={detalle.id}>
                <TableCell className="px-4 py-3">
                  {detalle.categoria_codigo} — {detalle.categoria_nombre}
                </TableCell>
                <TableCell className="px-4 py-3">{detalle.cantidad}</TableCell>
                <TableCell className="px-4 py-3">{formatMoney(detalle.precio)}</TableCell>
                <TableCell className="px-4 py-3">{formatMoney(detalle.descuento)}</TableCell>
                <TableCell className="px-4 py-3">{formatMoney(detalle.subtotal)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="mt-4 space-y-1 text-sm">
          <p>Suma de subtotales: {formatMoney(sumaLineas)}</p>
          <p>Descuento general: {formatMoney(orden.descuento)}</p>
          <p className="font-semibold">Monto total: {formatMoney(orden.monto_total)}</p>
        </div>
      </ComponentCard>

      {isPendiente(orden.estado) && (
        <PermissionGate permission={COMPRAS_PERMISSIONS.authorize}>
          <ComponentCard title="Autorización">
            {decisionError && (
              <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {decisionError}
              </div>
            )}
            <Label>Observación (opcional)</Label>
            <TextArea
              value={observacion}
              onChange={setObservacion}
              placeholder="Motivo de autorización o rechazo"
            />
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setDecisionError(null);
                  setDialog("autorizar");
                }}
                className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-3 text-sm text-white hover:bg-brand-600"
              >
                Autorizar
              </button>
              <button
                type="button"
                onClick={() => {
                  setDecisionError(null);
                  setDialog("rechazar");
                }}
                className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-3 text-sm text-red-600 ring-1 ring-inset ring-red-200 hover:bg-red-50"
              >
                Rechazar
              </button>
            </div>
          </ComponentCard>
        </PermissionGate>
      )}

      <ConfirmDialog
        isOpen={dialog !== null}
        title={dialog === "autorizar" ? "Autorizar orden" : "Rechazar orden"}
        message={
          dialog === "autorizar"
            ? `¿Confirma la autorización de ${orden.cod_compra}? Quedará bloqueada para edición.`
            : `¿Confirma el rechazo de ${orden.cod_compra}? No podrá modificarse.`
        }
        confirmLabel={dialog === "autorizar" ? "Autorizar" : "Rechazar"}
        loading={deciding}
        onConfirm={handleConfirm}
        onCancel={() => setDialog(null)}
      />
    </div>
  );
}
