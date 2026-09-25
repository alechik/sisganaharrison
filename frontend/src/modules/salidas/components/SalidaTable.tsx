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
import { EyeIcon } from "@/icons";
import { SALIDA_ROUTES } from "../constants";
import { SALIDAS_PERMISSIONS } from "../permissions";
import { Salida } from "../types";
import { formatDate, formatMoney } from "../utils";
import SalidaStatusBadge from "./SalidaStatusBadge";

interface Props {
  salidas: Salida[];
  meta?: PaginationMeta;
  onPageChange?: (page: number) => void;
  onDownloadPdf?: (salida: Salida) => void;
}

export default function SalidaTable({ salidas, meta, onPageChange, onDownloadPdf }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start">Código</TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start">Tipo</TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start">Fecha</TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start">Cliente</TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start">Venta</TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start">Animales</TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start">Monto</TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start">Estado</TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-center">Opciones</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {salidas.length === 0 ? (
              <TableRow>
                <TableCell className="px-5 py-8 text-center text-gray-500" colSpan={9}>
                  No hay salidas para mostrar.
                </TableCell>
              </TableRow>
            ) : (
              salidas.map((salida) => (
                <TableRow key={salida.id}>
                  <TableCell className="px-5 py-4 font-medium">{salida.codigo}</TableCell>
                  <TableCell className="px-5 py-4 text-gray-500">{salida.tipo_salida_nombre || "—"}</TableCell>
                  <TableCell className="px-5 py-4 text-gray-500">{formatDate(salida.fecha_salida)}</TableCell>
                  <TableCell className="px-5 py-4 text-gray-500">{salida.cliente_razon_social || "—"}</TableCell>
                  <TableCell className="px-5 py-4 text-gray-500">{salida.cod_venta || "—"}</TableCell>
                  <TableCell className="px-5 py-4 text-gray-500">{salida.cantidad_total ?? 0}</TableCell>
                  <TableCell className="px-5 py-4">{formatMoney(salida.monto_total)}</TableCell>
                  <TableCell className="px-5 py-4">
                    <SalidaStatusBadge estado={salida.estado} />
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <PermissionGate permission={SALIDAS_PERMISSIONS.view}>
                        <Link
                          to={SALIDA_ROUTES.detail(salida.id)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200"
                          title="Ver detalle"
                        >
                          <EyeIcon className="size-4" />
                        </Link>
                      </PermissionGate>
                      <PermissionGate permission={SALIDAS_PERMISSIONS.view}>
                        <button
                          type="button"
                          onClick={() => onDownloadPdf?.(salida)}
                          className="inline-flex items-center rounded-lg border border-gray-200 px-3 py-1.5 text-xs"
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
