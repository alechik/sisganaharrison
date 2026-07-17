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
import { GESTACION_ROUTES } from "../constants";
import { GESTACIONES_PERMISSIONS } from "../permissions";
import { Gestacion } from "../types";
import {
  formatDate,
  formatServicioResumen,
  getResultadoLabel,
  getTipoServicioLabel,
} from "../utils";
import GestacionEstadoBadge from "./GestacionEstadoBadge";

interface Props {
  gestaciones: Gestacion[];
  meta?: PaginationMeta;
  onPageChange?: (page: number) => void;
}

export default function GestacionTable({ gestaciones, meta, onPageChange }: Props) {
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
                Servicio
              </TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start text-gray-800 dark:text-white">
                Fecha servicio
              </TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start text-gray-800 dark:text-white">
                Tipo / Resultado
              </TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start text-gray-800 dark:text-white">
                Confirmación
              </TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start text-gray-800 dark:text-white">
                Parto probable
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
            {gestaciones.length === 0 ? (
              <TableRow>
                <TableCell className="px-5 py-8 text-center text-gray-500" colSpan={9}>
                  No hay gestaciones para mostrar.
                </TableCell>
              </TableRow>
            ) : (
              gestaciones.map((gestacion) => (
                <TableRow
                  key={gestacion.id}
                  className="transition hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                >
                  <TableCell className="px-5 py-4">
                    <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {gestacion.servicio_hembra_codigo || "—"}
                    </span>
                  </TableCell>

                  <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                    {gestacion.servicio_hembra_arete || "—"}
                  </TableCell>

                  <TableCell className="px-5 py-4">
                    <span
                      className="block max-w-xs truncate text-theme-sm text-gray-500 dark:text-gray-400"
                      title={formatServicioResumen(gestacion)}
                    >
                      #{gestacion.servicio_id}
                    </span>
                  </TableCell>

                  <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                    {formatDate(gestacion.servicio_fecha_servicio)}
                  </TableCell>

                  <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                    {getTipoServicioLabel(gestacion.servicio_tipo_servicio)}
                    <span className="mx-1">·</span>
                    {getResultadoLabel(gestacion.servicio_resultado)}
                  </TableCell>

                  <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                    {formatDate(gestacion.fecha_confirmacion)}
                  </TableCell>

                  <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                    {formatDate(gestacion.fecha_probable_parto)}
                  </TableCell>

                  <TableCell className="px-5 py-4">
                    <GestacionEstadoBadge estado={gestacion.estado} />
                  </TableCell>

                  <TableCell className="px-5 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <PermissionGate permission={GESTACIONES_PERMISSIONS.view}>
                        <Link
                          to={GESTACION_ROUTES.detail(gestacion.id)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 transition hover:border-blue-200 hover:bg-blue-50 dark:border-white/[0.05] dark:hover:bg-white/[0.05]"
                          title="Ver detalle"
                        >
                          <EyeIcon className="size-4" />
                        </Link>
                      </PermissionGate>

                      <PermissionGate permission={GESTACIONES_PERMISSIONS.update}>
                        <Link
                          to={GESTACION_ROUTES.edit(gestacion.id)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 transition hover:border-blue-200 hover:bg-blue-50 dark:border-white/[0.05] dark:hover:bg-white/[0.05]"
                          title="Editar gestación"
                        >
                          <PencilIcon className="size-4" />
                        </Link>
                      </PermissionGate>
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
