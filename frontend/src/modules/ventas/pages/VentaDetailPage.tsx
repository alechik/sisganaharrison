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
import { VentaStatusBadge } from "../components";
import { VENTA_ROUTES } from "../constants";
import { useDecidirVenta } from "../hooks";
import { VENTAS_PERMISSIONS } from "../permissions";
import { downloadVentaPdf, getVenta, viewVentaPdf } from "../services";
import { Venta } from "../types";
import { formatDate, formatMoney, formatPeso, formatSexo, isPendiente } from "../utils";

export default function VentaDetailPage() {
  const { id } = useParams();
  const ventaId = Number(id);
  const [venta, setVenta] = useState<Venta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [observacion, setObservacion] = useState("");
  const [dialog, setDialog] = useState<"autorizar" | "anular" | null>(null);
  const { autorizar, anular, loading: deciding, error: decisionError, setError: setDecisionError } =
    useDecidirVenta();

  useEffect(() => {
    const load = async () => {
      try {
        setVenta(await getVenta(ventaId));
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar el detalle de la venta.");
      } finally {
        setLoading(false);
      }
    };

    if (ventaId) {
      load();
    }
  }, [ventaId]);

  const handleConfirm = async () => {
    if (!venta || !dialog) {
      return;
    }
    try {
      const response =
        dialog === "autorizar"
          ? await autorizar(venta.id, observacion)
          : await anular(venta.id, observacion);
      setVenta(response.data);
      setDialog(null);
      setObservacion("");
    } catch {
      // handled
    }
  };

  if (loading) {
    return <div>Cargando detalle...</div>;
  }

  if (error || !venta) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
        {error ?? "Venta no encontrada."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <PageBreadCrumb pageTitle={venta.cod_venta} items={breadcrumbs.ventaDetalle} />
        <div className="flex flex-wrap gap-3">
          <Link
            to={VENTA_ROUTES.list}
            className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-3 text-sm text-gray-700 ring-1 ring-inset ring-gray-300"
          >
            Volver al listado
          </Link>
          <button
            type="button"
            onClick={() => viewVentaPdf(venta.id, venta.cod_venta)}
            className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-3 text-sm text-gray-700 ring-1 ring-inset ring-gray-300"
          >
            Ver / imprimir PDF
          </button>
          <button
            type="button"
            onClick={() => downloadVentaPdf(venta.id, venta.cod_venta)}
            className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-3 text-sm text-gray-700 ring-1 ring-inset ring-gray-300"
          >
            Descargar PDF
          </button>
          {isPendiente(venta.estado) && (
            <PermissionGate permission={VENTAS_PERMISSIONS.update}>
              <Link
                to={VENTA_ROUTES.edit(venta.id)}
                className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-3 text-sm text-white"
              >
                Editar
              </Link>
            </PermissionGate>
          )}
        </div>
      </div>

      <ComponentCard title="Cabecera de la venta">
        <dl className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm text-gray-500">Código</dt>
            <dd className="font-medium">{venta.cod_venta}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Cliente</dt>
            <dd className="font-medium">{venta.cliente_razon_social || "—"}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Fecha</dt>
            <dd className="font-medium">{formatDate(venta.fecha_venta)}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Estado</dt>
            <dd className="mt-1">
              <VentaStatusBadge estado={venta.estado} />
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Usuario</dt>
            <dd className="font-medium">{venta.creador_nombre || "—"}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Autorizó / anuló</dt>
            <dd className="font-medium">{venta.autorizador_nombre || "—"}</dd>
          </div>
        </dl>
      </ComponentCard>

      <ComponentCard title="Detalle de animales">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell isHeader className="px-4 py-3 font-semibold">Código</TableCell>
              <TableCell isHeader className="px-4 py-3 font-semibold">Arete</TableCell>
              <TableCell isHeader className="px-4 py-3 font-semibold">Sexo</TableCell>
              <TableCell isHeader className="px-4 py-3 font-semibold">Categoría</TableCell>
              <TableCell isHeader className="px-4 py-3 font-semibold">Potrero / Lote</TableCell>
              <TableCell isHeader className="px-4 py-3 font-semibold">Peso</TableCell>
              <TableCell isHeader className="px-4 py-3 font-semibold">Precio</TableCell>
              <TableCell isHeader className="px-4 py-3 font-semibold">Descuento</TableCell>
              <TableCell isHeader className="px-4 py-3 font-semibold">Subtotal</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(venta.detalles ?? []).map((detalle) => (
              <TableRow key={detalle.id}>
                <TableCell className="px-4 py-3">{detalle.animal_codigo || "—"}</TableCell>
                <TableCell className="px-4 py-3">{detalle.animal_arete || "—"}</TableCell>
                <TableCell className="px-4 py-3">{formatSexo(detalle.sexo)}</TableCell>
                <TableCell className="px-4 py-3">
                  {detalle.categoria_codigo} — {detalle.categoria_nombre}
                </TableCell>
                <TableCell className="px-4 py-3">
                  {detalle.potrero_nombre || "—"} / {detalle.lote_nombre || "—"}
                </TableCell>
                <TableCell className="px-4 py-3">{formatPeso(detalle.peso)}</TableCell>
                <TableCell className="px-4 py-3">{formatMoney(detalle.precio)}</TableCell>
                <TableCell className="px-4 py-3">{formatMoney(detalle.descuento)}</TableCell>
                <TableCell className="px-4 py-3">{formatMoney(detalle.subtotal)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="mt-4 space-y-1 text-sm">
          <p>Total peso: {formatPeso(venta.total_peso)}</p>
          <p>Descuento general: {formatMoney(venta.descuento)}</p>
          <p className="font-semibold">Monto total: {formatMoney(venta.monto_total)}</p>
        </div>
      </ComponentCard>

      {isPendiente(venta.estado) && (
        <PermissionGate permission={VENTAS_PERMISSIONS.authorize}>
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
              placeholder="Motivo de autorización o anulación"
            />
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setDecisionError(null);
                  setDialog("autorizar");
                }}
                className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-3 text-sm text-white"
              >
                Autorizar
              </button>
              <button
                type="button"
                onClick={() => {
                  setDecisionError(null);
                  setDialog("anular");
                }}
                className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-3 text-sm text-red-600 ring-1 ring-inset ring-red-200"
              >
                Anular
              </button>
            </div>
          </ComponentCard>
        </PermissionGate>
      )}

      <ConfirmDialog
        isOpen={dialog !== null}
        title={dialog === "autorizar" ? "Autorizar venta" : "Anular venta"}
        message={
          dialog === "autorizar"
            ? `¿Confirma la autorización de ${venta.cod_venta}? No podrá editarse. Los animales permanecen reservados.`
            : `¿Confirma la anulación de ${venta.cod_venta}? Se liberará la reserva de los animales.`
        }
        confirmLabel={dialog === "autorizar" ? "Autorizar" : "Anular"}
        loading={deciding}
        onConfirm={handleConfirm}
        onCancel={() => setDialog(null)}
      />
    </div>
  );
}
