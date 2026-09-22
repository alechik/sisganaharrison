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
import { CheckLineIcon, EyeIcon, PencilIcon } from "@/icons";
import { PARTO_ROUTES } from "../constants";
import { PARTOS_PERMISSIONS } from "../permissions";
import { Parto } from "../types";
import {
  formatDate,
  formatGestacionResumen,
  getEstadoGestacionLabel,
  getResultadoLabel,
  getTipoServicioLabel,
} from "../utils";
import PartoEstadoBadge from "./PartoEstadoBadge";

interface Props {
  partos: Parto[];
  meta?: PaginationMeta;
  onPageChange?: (page: number) => void;
  onFinalizar?: (parto: Parto) => void;
}

export default function PartoTable({ partos, meta, onPageChange, onFinalizar }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start text-gray-800 dark:text-white">
                Código hembra
              </TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start text-gray-800 dark:text-white">
                Arete hembra
              </TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start text-gray-800 dark:text-white">
                Código macho
              </TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start text-gray-800 dark:text-white">
                Arete macho
              </TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start text-gray-800 dark:text-white">
                Gestación
              </TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start text-gray-800 dark:text-white">
                Servicio
              </TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start text-gray-800 dark:text-white">
                Estado gestación
              </TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start text-gray-800 dark:text-white">
                Fecha parto
              </TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start text-gray-800 dark:text-white">
                Estado
              </TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-center text-gray-800 dark:text-white">
                Opciones
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {partos.length === 0 ? (
              <TableRow>
                <TableCell className="px-5 py-8 text-center text-gray-500" colSpan={10}>
                  No hay partos para mostrar.
                </TableCell>
              </TableRow>
            ) : (
              partos.map((parto) => (
                <TableRow
                  key={parto.id}
                  className="transition hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                >
                  <TableCell className="px-5 py-4">
                    <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {parto.gestacion_servicio_hembra_codigo || "—"}
                    </span>
                  </TableCell>

                  <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                    {parto.gestacion_servicio_hembra_arete || "—"}
                  </TableCell>

                  <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                    {parto.gestacion_servicio_macho_codigo || "—"}
                  </TableCell>

                  <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                    {parto.gestacion_servicio_macho_arete || "—"}
                  </TableCell>

                  <TableCell className="px-5 py-4">
                    <span
                      className="block max-w-xs truncate text-theme-sm text-gray-500 dark:text-gray-400"
                      title={formatGestacionResumen(parto)}
                    >
                      #{parto.gestacion_id}
                    </span>
                  </TableCell>

                  <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                    {formatDate(parto.gestacion_servicio_fecha_servicio)}
                    <span className="mx-1">·</span>
                    {getTipoServicioLabel(parto.gestacion_servicio_tipo_servicio)}
                    <span className="mx-1">·</span>
                    {getResultadoLabel(parto.gestacion_servicio_resultado)}
                  </TableCell>

                  <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                    {getEstadoGestacionLabel(parto.gestacion_estado)}
                  </TableCell>

                  <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                    {formatDate(parto.fecha_parto)}
                  </TableCell>

                  <TableCell className="px-5 py-4">
                    <PartoEstadoBadge estado={parto.estado} />
                  </TableCell>

                  <TableCell className="px-5 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <PermissionGate permission={PARTOS_PERMISSIONS.view}>
                        <Link
                          to={PARTO_ROUTES.detail(parto.id)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 transition hover:border-blue-200 hover:bg-blue-50 dark:border-white/[0.05] dark:hover:bg-white/[0.05]"
                          title="Ver detalle"
                        >
                          <EyeIcon className="size-4" />
                        </Link>
                      </PermissionGate>

                      <PermissionGate permission={PARTOS_PERMISSIONS.update}>
                        <Link
                          to={PARTO_ROUTES.edit(parto.id)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 transition hover:border-blue-200 hover:bg-blue-50 dark:border-white/[0.05] dark:hover:bg-white/[0.05]"
                          title="Editar parto"
                        >
                          <PencilIcon className="size-4" />
                        </Link>
                      </PermissionGate>

                      {parto.estado !== "FINALIZADA" && (
                        <PermissionGate permission={PARTOS_PERMISSIONS.update}>
                          <button
                            type="button"
                            onClick={() => onFinalizar?.(parto)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 transition hover:border-green-200 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/[0.05] dark:hover:bg-green-500/10"
                            title="Finalizar parto"
                          >
                            <CheckLineIcon className="size-4" />
                          </button>
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

      {meta && onPageChange && (
        <Pagination meta={meta} onPageChange={onPageChange} />
      )}
    </div>
  );
}
