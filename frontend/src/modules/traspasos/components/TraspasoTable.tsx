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
import { TRASPASO_ROUTES } from "../constants";
import { TRASPASOS_PERMISSIONS } from "../permissions";
import { Traspaso } from "../types";
import { formatDate, formatMoney, formatPeso, loteLabel } from "../utils";

interface Props {
  traspasos: Traspaso[];
  meta?: PaginationMeta;
  onPageChange?: (page: number) => void;
  onDownloadPdf?: (traspaso: Traspaso) => void;
}

export default function TraspasoTable({ traspasos, meta, onPageChange, onDownloadPdf }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start">ID</TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start">Fecha</TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start">Lote salida</TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start">Lote ingreso</TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start">Animales</TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start">Total peso</TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start">Monto total</TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start">Usuario</TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-center">Opciones</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {traspasos.length === 0 ? (
              <TableRow>
                <TableCell className="px-5 py-8 text-center text-gray-500" colSpan={9}>
                  No hay traspasos para mostrar.
                </TableCell>
              </TableRow>
            ) : (
              traspasos.map((traspaso) => (
                <TableRow key={traspaso.id}>
                  <TableCell className="px-5 py-4 font-medium">{traspaso.id}</TableCell>
                  <TableCell className="px-5 py-4 text-gray-500">{formatDate(traspaso.fecha_traspaso)}</TableCell>
                  <TableCell className="px-5 py-4 text-gray-500">
                    {loteLabel(traspaso.lote_salida_codigo, traspaso.lote_salida_nombre)}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-gray-500">
                    {loteLabel(traspaso.lote_ingreso_codigo, traspaso.lote_ingreso_nombre)}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-gray-500">{traspaso.cantidad_animales ?? 0}</TableCell>
                  <TableCell className="px-5 py-4 text-gray-500">{formatPeso(traspaso.total_peso)}</TableCell>
                  <TableCell className="px-5 py-4">{formatMoney(traspaso.monto_total)}</TableCell>
                  <TableCell className="px-5 py-4 text-gray-500">{traspaso.usuario_nombre || "—"}</TableCell>
                  <TableCell className="px-5 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <PermissionGate permission={TRASPASOS_PERMISSIONS.view}>
                        <Link
                          to={TRASPASO_ROUTES.detail(traspaso.id)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200"
                          title="Ver detalle"
                        >
                          <EyeIcon className="size-4" />
                        </Link>
                      </PermissionGate>
                      <PermissionGate permission={TRASPASOS_PERMISSIONS.update}>
                        <Link
                          to={TRASPASO_ROUTES.edit(traspaso.id)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200"
                          title="Editar traspaso"
                        >
                          <PencilIcon className="size-4" />
                        </Link>
                      </PermissionGate>
                      <PermissionGate permission={TRASPASOS_PERMISSIONS.view}>
                        <button
                          type="button"
                          onClick={() => onDownloadPdf?.(traspaso)}
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
