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
import { SERVICIO_REPRODUCTIVO_ROUTES } from "../constants";
import { SERVICIOS_REPRODUCTIVOS_PERMISSIONS } from "../permissions";
import { ServicioReproductivo } from "../types";
import { formatAnimalLabel, getResultadoLabel, getTipoServicioLabel } from "../utils";

interface Props {
  servicios: ServicioReproductivo[];
  meta?: PaginationMeta;
  onPageChange?: (page: number) => void;
}

export default function ServicioReproductivoTable({ servicios, meta, onPageChange }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start text-gray-800 dark:text-white">
                Hembra
              </TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start text-gray-800 dark:text-white">
                Macho
              </TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start text-gray-800 dark:text-white">
                Fecha
              </TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start text-gray-800 dark:text-white">
                Tipo
              </TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start text-gray-800 dark:text-white">
                Resultado
              </TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-center text-gray-800 dark:text-white">
                Opciones
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {servicios.length === 0 ? (
              <TableRow>
                <TableCell className="px-5 py-8 text-center text-gray-500" colSpan={6}>
                  No hay servicios reproductivos para mostrar.
                </TableCell>
              </TableRow>
            ) : (
              servicios.map((servicio) => (
                <TableRow
                  key={servicio.id}
                  className="transition hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                >
                  <TableCell className="px-5 py-4">
                    <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {formatAnimalLabel(servicio.hembra_codigo, servicio.hembra_arete)}
                    </span>
                  </TableCell>

                  <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                    {servicio.macho_id
                      ? formatAnimalLabel(servicio.macho_codigo, servicio.macho_arete)
                      : "—"}
                  </TableCell>

                  <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                    {servicio.fecha_servicio
                      ? new Date(`${servicio.fecha_servicio}T00:00:00`).toLocaleDateString("es-PY")
                      : "—"}
                  </TableCell>

                  <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                    {getTipoServicioLabel(servicio.tipo_servicio)}
                  </TableCell>

                  <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                    {getResultadoLabel(servicio.resultado)}
                  </TableCell>

                  <TableCell className="px-5 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <PermissionGate permission={SERVICIOS_REPRODUCTIVOS_PERMISSIONS.view}>
                        <Link
                          to={SERVICIO_REPRODUCTIVO_ROUTES.detail(servicio.id)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 transition hover:border-blue-200 hover:bg-blue-50 dark:border-white/[0.05] dark:hover:bg-white/[0.05]"
                          title="Ver detalle"
                        >
                          <EyeIcon className="size-4" />
                        </Link>
                      </PermissionGate>

                      <PermissionGate permission={SERVICIOS_REPRODUCTIVOS_PERMISSIONS.update}>
                        <Link
                          to={SERVICIO_REPRODUCTIVO_ROUTES.edit(servicio.id)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 transition hover:border-blue-200 hover:bg-blue-50 dark:border-white/[0.05] dark:hover:bg-white/[0.05]"
                          title="Editar servicio"
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
