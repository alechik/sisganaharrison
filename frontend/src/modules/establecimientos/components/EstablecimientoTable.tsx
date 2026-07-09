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
import { EyeIcon, PencilIcon, TrashBinIcon } from "@/icons";
import { ESTABLECIMIENTO_ROUTES } from "../constants";
import { ESTABLECIMIENTOS_PERMISSIONS } from "../permissions";
import { Establecimiento } from "../types";
import EstablecimientoStatusBadge from "./EstablecimientoStatusBadge";

interface Props {
  establecimientos: Establecimiento[];
  meta?: PaginationMeta;
  deletedView?: boolean;
  onPageChange?: (page: number) => void;
  onToggleStatus?: (establecimiento: Establecimiento) => void;
  onDelete?: (establecimiento: Establecimiento) => void;
  onRestore?: (establecimiento: Establecimiento) => void;
}

export default function EstablecimientoTable({
  establecimientos,
  meta,
  deletedView = false,
  onPageChange,
  onToggleStatus,
  onDelete,
  onRestore,
}: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start">
                Establecimiento
              </TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start">
                Código
              </TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start">
                Propietario
              </TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start">
                Ubicación
              </TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start">
                Área (ha)
              </TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start">
                Estado
              </TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-center">
                Opciones
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {establecimientos.length === 0 ? (
              <TableRow>
                <TableCell className="px-5 py-8 text-center text-gray-500" colSpan={7}>
                  No hay establecimientos para mostrar.
                </TableCell>
              </TableRow>
            ) : (
              establecimientos.map((establecimiento) => (
                <TableRow
                  key={establecimiento.id}
                  className="transition hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                >
                  <TableCell className="px-5 py-4">
                    <div>
                      <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {establecimiento.nombre}
                      </span>
                      <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                        ID: {establecimiento.id}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                    {establecimiento.codigo}
                  </TableCell>

                  <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                    {establecimiento.propietario || "—"}
                  </TableCell>

                  <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                    {[establecimiento.municipio, establecimiento.departamento]
                      .filter(Boolean)
                      .join(", ") || "—"}
                  </TableCell>

                  <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                    {establecimiento.area_total_ha != null
                      ? establecimiento.area_total_ha.toLocaleString("es-PY")
                      : "—"}
                  </TableCell>

                  <TableCell className="px-5 py-4">
                    {!deletedView ? (
                      <PermissionGate permission={ESTABLECIMIENTOS_PERMISSIONS.activate}>
                        <EstablecimientoStatusBadge
                          active={establecimiento.activo}
                          onClick={() => onToggleStatus?.(establecimiento)}
                          disabled={!onToggleStatus}
                        />
                      </PermissionGate>
                    ) : (
                      <EstablecimientoStatusBadge active={establecimiento.activo} />
                    )}
                  </TableCell>

                  <TableCell className="px-5 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <PermissionGate permission={ESTABLECIMIENTOS_PERMISSIONS.view}>
                        <Link
                          to={ESTABLECIMIENTO_ROUTES.detail(establecimiento.id)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 transition hover:border-blue-200 hover:bg-blue-50 dark:border-white/[0.05] dark:hover:bg-white/[0.05]"
                          title="Ver detalle"
                        >
                          <EyeIcon className="size-4" />
                        </Link>
                      </PermissionGate>

                      {!deletedView && (
                        <>
                          <PermissionGate permission={ESTABLECIMIENTOS_PERMISSIONS.update}>
                            <Link
                              to={ESTABLECIMIENTO_ROUTES.edit(establecimiento.id)}
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 transition hover:border-blue-200 hover:bg-blue-50 dark:border-white/[0.05] dark:hover:bg-white/[0.05]"
                              title="Editar establecimiento"
                            >
                              <PencilIcon className="size-4" />
                            </Link>
                          </PermissionGate>

                          <PermissionGate permission={ESTABLECIMIENTOS_PERMISSIONS.delete}>
                            <button
                              type="button"
                              onClick={() => onDelete?.(establecimiento)}
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 transition hover:border-red-200 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/[0.05] dark:hover:bg-red-500/10"
                              title="Eliminar establecimiento"
                            >
                              <TrashBinIcon className="size-4" />
                            </button>
                          </PermissionGate>
                        </>
                      )}

                      {deletedView && (
                        <PermissionGate permission={ESTABLECIMIENTOS_PERMISSIONS.restore}>
                          <button
                            type="button"
                            onClick={() => onRestore?.(establecimiento)}
                            className="inline-flex items-center rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-white/[0.05] dark:text-gray-300 dark:hover:bg-white/[0.05]"
                          >
                            Restaurar
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
