import { Link } from "react-router-dom";

import PermissionGate from "@/components/auth/PermissionGate";
import Pagination from "@/components/common/Pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PaginationMeta } from "@/types/api";
import { EyeIcon, PencilIcon } from "@/icons";
import { VENTA_ROUTES } from "../constants";
import { VENTAS_PERMISSIONS } from "../permissions";
import { Venta } from "../types";
import { formatDate, formatMoney, formatPeso, isPendiente } from "../utils";
import VentaStatusBadge from "./VentaStatusBadge";

interface Props {
  ventas: Venta[];
  meta?: PaginationMeta;
  onPageChange?: (page: number) => void;
  onDownloadPdf?: (venta: Venta) => void;
  onAutorizar?: (venta: Venta) => void;
  onAnular?: (venta: Venta) => void;
}

export default function VentaTable({
  ventas,
  meta,
  onPageChange,
  onDownloadPdf,
  onAutorizar,
  onAnular,
}: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start">Código</TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start">Cliente</TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start">Fecha</TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start">Usuario</TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start">Animales</TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start">Peso total</TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start">Monto total</TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start">Estado</TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-center">Opciones</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {ventas.length === 0 ? (
              <TableRow>
                <TableCell className="px-5 py-8 text-center text-gray-500" colSpan={9}>
                  No hay ventas para mostrar.
                </TableCell>
              </TableRow>
            ) : (
              ventas.map((venta) => (
                <TableRow key={venta.id}>
                  <TableCell className="px-5 py-4 font-medium">{venta.cod_venta}</TableCell>
                  <TableCell className="px-5 py-4 text-gray-500">{venta.cliente_razon_social || "—"}</TableCell>
                  <TableCell className="px-5 py-4 text-gray-500">{formatDate(venta.fecha_venta)}</TableCell>
                  <TableCell className="px-5 py-4 text-gray-500">{venta.creador_nombre || "—"}</TableCell>
                  <TableCell className="px-5 py-4 text-gray-500">{venta.cantidad_total ?? 0}</TableCell>
                  <TableCell className="px-5 py-4 text-gray-500">{formatPeso(venta.total_peso)}</TableCell>
                  <TableCell className="px-5 py-4 font-medium">{formatMoney(venta.monto_total)}</TableCell>
                  <TableCell className="px-5 py-4">
                    <VentaStatusBadge estado={venta.estado} />
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <PermissionGate permission={VENTAS_PERMISSIONS.view}>
                        <Link
                          to={VENTA_ROUTES.detail(venta.id)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200"
                          title="Ver detalle"
                        >
                          <EyeIcon className="size-4" />
                        </Link>
                      </PermissionGate>
                      {isPendiente(venta.estado) && (
                        <PermissionGate permission={VENTAS_PERMISSIONS.update}>
                          <Link
                            to={VENTA_ROUTES.edit(venta.id)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200"
                            title="Editar venta"
                          >
                            <PencilIcon className="size-4" />
                          </Link>
                        </PermissionGate>
                      )}
                      <PermissionGate permission={VENTAS_PERMISSIONS.view}>
                        <button
                          type="button"
                          onClick={() => onDownloadPdf?.(venta)}
                          className="inline-flex items-center rounded-lg border border-gray-200 px-3 py-1.5 text-xs"
                        >
                          PDF
                        </button>
                      </PermissionGate>
                      {isPendiente(venta.estado) && (
                        <PermissionGate permission={VENTAS_PERMISSIONS.authorize}>
                          <>
                            <button
                              type="button"
                              onClick={() => onAutorizar?.(venta)}
                              className="inline-flex items-center rounded-lg bg-brand-500 px-3 py-1.5 text-xs text-white"
                            >
                              Autorizar
                            </button>
                            <button
                              type="button"
                              onClick={() => onAnular?.(venta)}
                              className="inline-flex items-center rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-600"
                            >
                              Anular
                            </button>
                          </>
                        </PermissionGate>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {meta && onPageChange && <Pagination meta={meta} onPageChange={onPageChange} />}
    </div>
  );
}
