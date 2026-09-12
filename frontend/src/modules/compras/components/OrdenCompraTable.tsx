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
import { ORDEN_COMPRA_ROUTES } from "../constants";
import { COMPRAS_PERMISSIONS } from "../permissions";
import { OrdenCompra } from "../types";
import { formatDate, formatMoney, formatPeso, isPendiente } from "../utils";
import OrdenCompraStatusBadge from "./OrdenCompraStatusBadge";

interface Props {
  ordenes: OrdenCompra[];
  meta?: PaginationMeta;
  onPageChange?: (page: number) => void;
  onDownloadPdf?: (orden: OrdenCompra) => void;
}

export default function OrdenCompraTable({
  ordenes,
  meta,
  onPageChange,
  onDownloadPdf,
}: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start text-gray-800 dark:text-white">Código</TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start text-gray-800 dark:text-white">Proveedor</TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start text-gray-800 dark:text-white">Fecha</TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start text-gray-800 dark:text-white">Usuario</TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start text-gray-800 dark:text-white">Cantidad</TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start text-gray-800 dark:text-white">Peso total</TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start text-gray-800 dark:text-white">Monto total</TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start text-gray-800 dark:text-white">Estado</TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-center text-gray-800 dark:text-white">Opciones</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {ordenes.length === 0 ? (
              <TableRow>
                <TableCell className="px-5 py-8 text-center text-gray-500" colSpan={9}>
                  No hay órdenes de compra para mostrar.
                </TableCell>
              </TableRow>
            ) : (
              ordenes.map((orden) => (
                <TableRow key={orden.id} className="transition hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                  <TableCell className="px-5 py-4 font-medium text-gray-800 text-theme-sm dark:text-white/90">
                    {orden.cod_compra}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                    {orden.proveedor_razon_social || "—"}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                    {formatDate(orden.fecha)}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                    {orden.creador_nombre || "—"}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                    {orden.cantidad_total ?? 0}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                    {formatPeso(orden.total_peso)}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-theme-sm font-medium text-gray-800 dark:text-white/90">
                    {formatMoney(orden.monto_total)}
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <OrdenCompraStatusBadge estado={orden.estado} />
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <PermissionGate permission={COMPRAS_PERMISSIONS.view}>
                        <Link
                          to={ORDEN_COMPRA_ROUTES.detail(orden.id)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 transition hover:border-blue-200 hover:bg-blue-50 dark:border-white/[0.05] dark:hover:bg-white/[0.05]"
                          title="Ver detalle"
                        >
                          <EyeIcon className="size-4" />
                        </Link>
                      </PermissionGate>
                      {isPendiente(orden.estado) && (
                        <PermissionGate permission={COMPRAS_PERMISSIONS.update}>
                          <Link
                            to={ORDEN_COMPRA_ROUTES.edit(orden.id)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 transition hover:border-blue-200 hover:bg-blue-50 dark:border-white/[0.05] dark:hover:bg-white/[0.05]"
                            title="Editar orden"
                          >
                            <PencilIcon className="size-4" />
                          </Link>
                        </PermissionGate>
                      )}
                      <PermissionGate permission={COMPRAS_PERMISSIONS.view}>
                        <button
                          type="button"
                          onClick={() => onDownloadPdf?.(orden)}
                          className="inline-flex items-center rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-white/[0.05] dark:text-gray-300 dark:hover:bg-white/[0.05]"
                        >
                          PDF
                        </button>
                      </PermissionGate>
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
