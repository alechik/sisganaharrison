import { Link } from "react-router-dom";

import Pagination from "@/components/common/Pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EyeIcon, PencilIcon } from "@/icons";
import { PaginationMeta } from "@/types/api";
import { canManageTareas, canReceiveTareas } from "@/utils/roles";
import { getCurrentUserId } from "@/modules/user/utils/currentUser";
import { TAREA_ROUTES } from "../constants";
import { Tarea } from "../types";
import { formatDateTime } from "../utils";
import TareaStatusBadge from "./TareaStatusBadge";

interface Props {
  tareas: Tarea[];
  meta?: PaginationMeta;
  onPageChange?: (page: number) => void;
  onTerminar?: (tarea: Tarea) => void;
}

export default function TareaTable({ tareas, meta, onPageChange, onTerminar }: Props) {
  const showVista = canManageTareas();
  const currentUserId = getCurrentUserId();

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start text-gray-800 dark:text-white">
                Código
              </TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start text-gray-800 dark:text-white">
                Asignado
              </TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start text-gray-800 dark:text-white">
                Estado
              </TableCell>
              {showVista && (
                <TableCell isHeader className="px-5 py-4 font-semibold text-start text-gray-800 dark:text-white">
                  Vista
                </TableCell>
              )}
              <TableCell isHeader className="px-5 py-4 font-semibold text-start text-gray-800 dark:text-white">
                Inicio
              </TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start text-gray-800 dark:text-white">
                Fin
              </TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-center text-gray-800 dark:text-white">
                Opciones
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {tareas.length === 0 ? (
              <TableRow>
                <TableCell className="px-5 py-8 text-center text-gray-500" colSpan={showVista ? 7 : 6}>
                  No hay tareas para mostrar.
                </TableCell>
              </TableRow>
            ) : (
              tareas.map((tarea) => {
                const esAsignado = Number(currentUserId) === Number(tarea.user_trabajador_id);
                const puedeGestionar = canReceiveTareas() && esAsignado && tarea.estado !== "TERMINADO";

                return (
                  <TableRow
                    key={tarea.id}
                    className="transition hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                  >
                    <TableCell className="px-5 py-4">
                      <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {tarea.codigo_tarea}
                      </span>
                      <span className="block max-w-xs truncate text-gray-500 text-theme-xs dark:text-gray-400">
                        {tarea.indicacion}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                      {tarea.trabajador?.nombre ?? "—"}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <TareaStatusBadge estado={tarea.estado} />
                    </TableCell>
                    {showVista && (
                      <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                        {tarea.vista ?? "—"}
                      </TableCell>
                    )}
                    <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                      {formatDateTime(tarea.fecha_inicio)}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                      {formatDateTime(tarea.fecha_fin)}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          to={TAREA_ROUTES.detail(tarea.id)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 transition hover:border-blue-200 hover:bg-blue-50 dark:border-white/[0.05] dark:hover:bg-white/[0.05]"
                          title="Ver tarea"
                        >
                          <EyeIcon className="size-4" />
                        </Link>

                        {puedeGestionar && (
                          <>
                            <Link
                              to={TAREA_ROUTES.edit(tarea.id)}
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 transition hover:border-blue-200 hover:bg-blue-50 dark:border-white/[0.05] dark:hover:bg-white/[0.05]"
                              title="Responder"
                            >
                              <PencilIcon className="size-4" />
                            </Link>
                            <button
                              type="button"
                              onClick={() => onTerminar?.(tarea)}
                              className="inline-flex items-center rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-white/[0.05] dark:text-gray-300 dark:hover:bg-white/[0.05]"
                            >
                              Terminar tarea
                            </button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
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
