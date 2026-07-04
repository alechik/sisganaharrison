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
import { TIPO_EVENTO_SANITARIO_ROUTES } from "../constants";
import { TIPOS_EVENTOS_SANITARIOS_PERMISSIONS } from "../permissions";
import { TipoEventoSanitario } from "../types";
import TipoEventoSanitarioStatusBadge from "./TipoEventoSanitarioStatusBadge";

interface Props {
  tipos: TipoEventoSanitario[];
  meta?: PaginationMeta;
  deletedView?: boolean;
  onPageChange?: (page: number) => void;
  onToggleStatus?: (estado: TipoEventoSanitario) => void;
  onDelete?: (estado: TipoEventoSanitario) => void;
  onRestore?: (estado: TipoEventoSanitario) => void;
}

export default function TipoEventoSanitarioTable({
  tipos,
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
                Tipo de Evento Sanitario
              </TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start">
                Código
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
            {tipos.length === 0 ? (
              <TableRow>
                <TableCell className="px-5 py-8 text-center text-gray-500" colSpan={5}>
                  No hay tipos de eventos sanitarios para mostrar.
                </TableCell>
              </TableRow>
            ) : (
              tipos.map((tipo) => (
                <TableRow
                  key={tipo.id}
                  className="transition hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                >
                  <TableCell className="px-5 py-4">
                    <div>
                      <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {tipo.nombre}
                      </span>
                      <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                        ID: {tipo.id}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                    {tipo.codigo}
                  </TableCell>

                  <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                    {tipo.descripcion || "Sin descripción"}
                  </TableCell>

                  <TableCell className="px-5 py-4">
                    {!deletedView ? (
                      <PermissionGate permission={TIPOS_EVENTOS_SANITARIOS_PERMISSIONS.activate}>
                        <TipoEventoSanitarioStatusBadge
                          active={tipo.activo}
                          onClick={() => onToggleStatus?.(tipo)}
                          disabled={!onToggleStatus}
                        />
                      </PermissionGate>
                    ) : (
                      <TipoEventoSanitarioStatusBadge active={tipo.activo} />
                    )}
                  </TableCell>

                  <TableCell className="px-5 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <PermissionGate permission={TIPOS_EVENTOS_SANITARIOS_PERMISSIONS.view}>
                        <Link
                          to={TIPO_EVENTO_SANITARIO_ROUTES.detail(tipo.id)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 transition hover:border-blue-200 hover:bg-blue-50 dark:border-white/[0.05] dark:hover:bg-white/[0.05]"
                          title="Ver detalle"
                        >
                          <EyeIcon className="size-4" />
                        </Link>
                      </PermissionGate>

                      {!deletedView && (
                        <>
                          <PermissionGate permission={TIPOS_EVENTOS_SANITARIOS_PERMISSIONS.update}>
                            <Link
                              to={TIPO_EVENTO_SANITARIO_ROUTES.edit(tipo.id)}
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 transition hover:border-blue-200 hover:bg-blue-50 dark:border-white/[0.05] dark:hover:bg-white/[0.05]"
                              title="Editar tipo"
                            >
                              <PencilIcon className="size-4" />
                            </Link>
                          </PermissionGate>

                          <PermissionGate permission={TIPOS_EVENTOS_SANITARIOS_PERMISSIONS.delete}>
                            <button
                              type="button"
                              onClick={() => onDelete?.(tipo)}
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 transition hover:border-red-200 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/[0.05] dark:hover:bg-red-500/10"
                              title="Eliminar tipo"
                            >
                              <TrashBinIcon className="size-4" />
                            </button>
                          </PermissionGate>
                        </>
                      )}

                      {deletedView && (
                        <PermissionGate permission={TIPOS_EVENTOS_SANITARIOS_PERMISSIONS.restore}>
                          <button
                            type="button"
                            onClick={() => onRestore?.(tipo)}
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
