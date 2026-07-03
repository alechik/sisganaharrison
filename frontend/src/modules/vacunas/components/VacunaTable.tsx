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
import { VACUNA_ROUTES } from "../constants";
import { VACUNAS_PERMISSIONS } from "../permissions";
import { Vacuna } from "../types";
import VacunaStatusBadge from "./VacunaStatusBadge";

interface Props {
  vacunas: Vacuna[];
  meta?: PaginationMeta;
  deletedView?: boolean;
  onPageChange?: (page: number) => void;
  onToggleStatus?: (vacuna: Vacuna) => void;
  onDelete?: (vacuna: Vacuna) => void;
  onRestore?: (vacuna: Vacuna) => void;
}

export default function VacunaTable({
  vacunas,
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
                Vacuna
              </TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start">
                Código
              </TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start">
                Laboratorio
              </TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start">
                Descripción
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
            {vacunas.length === 0 ? (
              <TableRow>
                <TableCell className="px-5 py-8 text-center text-gray-500" colSpan={6}>
                  No hay vacunas para mostrar.
                </TableCell>
              </TableRow>
            ) : (
              vacunas.map((vacuna) => (
                <TableRow
                  key={vacuna.id}
                  className="transition hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                >
                  <TableCell className="px-5 py-4">
                    <div>
                      <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {vacuna.nombre}
                      </span>
                      <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                        ID: {vacuna.id}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                    {vacuna.codigo}
                  </TableCell>

                  <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                    {vacuna.laboratorio || "—"}
                  </TableCell>

                  <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                    {vacuna.descripcion || "Sin descripción"}
                  </TableCell>

                  <TableCell className="px-5 py-4">
                    {!deletedView ? (
                      <PermissionGate permission={VACUNAS_PERMISSIONS.activate}>
                        <VacunaStatusBadge
                          active={vacuna.activo}
                          onClick={() => onToggleStatus?.(vacuna)}
                          disabled={!onToggleStatus}
                        />
                      </PermissionGate>
                    ) : (
                      <VacunaStatusBadge active={vacuna.activo} />
                    )}
                  </TableCell>

                  <TableCell className="px-5 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <PermissionGate permission={VACUNAS_PERMISSIONS.view}>
                        <Link
                          to={VACUNA_ROUTES.detail(vacuna.id)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 transition hover:border-blue-200 hover:bg-blue-50 dark:border-white/[0.05] dark:hover:bg-white/[0.05]"
                          title="Ver detalle"
                        >
                          <EyeIcon className="size-4" />
                        </Link>
                      </PermissionGate>

                      {!deletedView && (
                        <>
                          <PermissionGate permission={VACUNAS_PERMISSIONS.update}>
                            <Link
                              to={VACUNA_ROUTES.edit(vacuna.id)}
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 transition hover:border-blue-200 hover:bg-blue-50 dark:border-white/[0.05] dark:hover:bg-white/[0.05]"
                              title="Editar vacuna"
                            >
                              <PencilIcon className="size-4" />
                            </Link>
                          </PermissionGate>

                          <PermissionGate permission={VACUNAS_PERMISSIONS.delete}>
                            <button
                              type="button"
                              onClick={() => onDelete?.(vacuna)}
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 transition hover:border-red-200 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/[0.05] dark:hover:bg-red-500/10"
                              title="Eliminar vacuna"
                            >
                              <TrashBinIcon className="size-4" />
                            </button>
                          </PermissionGate>
                        </>
                      )}

                      {deletedView && (
                        <PermissionGate permission={VACUNAS_PERMISSIONS.restore}>
                          <button
                            type="button"
                            onClick={() => onRestore?.(vacuna)}
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
