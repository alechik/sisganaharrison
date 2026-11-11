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
import { TIPO_INGRESO_ROUTES } from "../constants";
import { TIPOS_INGRESOS_PERMISSIONS } from "../permissions";
import { TipoIngreso } from "../types";
import TipoIngresoStatusBadge from "./TipoIngresoStatusBadge";

interface Props {
  tipos: TipoIngreso[];
  meta?: PaginationMeta;
  deletedView?: boolean;
  onPageChange?: (page: number) => void;
  onToggleStatus?: (tipo: TipoIngreso) => void;
  onDelete?: (tipo: TipoIngreso) => void;
  onRestore?: (tipo: TipoIngreso) => void;
}

export default function TipoIngresoTable({
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
              <TableCell isHeader className="px-5 py-4 font-semibold text-start text-gray-800 dark:text-white">
                Tipo
              </TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start text-gray-800 dark:text-white">
                Código
              </TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start text-gray-800 dark:text-white">
                Iniciales
              </TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start text-gray-800 dark:text-white">
                Prefijo
              </TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start text-gray-800 dark:text-white">
                Proveedor
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
            {tipos.length === 0 ? (
              <TableRow>
                <TableCell className="px-5 py-8 text-center text-gray-500" colSpan={7}>
                  No hay tipos de ingreso para mostrar.
                </TableCell>
              </TableRow>
            ) : (
              tipos.map((tipo) => (
                <TableRow key={tipo.id} className="transition hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                  <TableCell className="px-5 py-4">
                    <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {tipo.nombre}
                    </span>
                    <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                      {tipo.descripcion || "Sin descripción"}
                    </span>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                    {tipo.codigo}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                    {tipo.iniciales}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                    IN{tipo.iniciales}000001
                  </TableCell>
                  <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                    {tipo.requiere_proveedor ? "Obligatorio" : "Opcional"}
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    {!deletedView ? (
                      <PermissionGate permission={TIPOS_INGRESOS_PERMISSIONS.activate}>
                        <TipoIngresoStatusBadge
                          active={tipo.estado}
                          onClick={() => onToggleStatus?.(tipo)}
                          disabled={!onToggleStatus}
                        />
                      </PermissionGate>
                    ) : (
                      <TipoIngresoStatusBadge active={tipo.estado} />
                    )}
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <PermissionGate permission={TIPOS_INGRESOS_PERMISSIONS.view}>
                        <Link
                          to={TIPO_INGRESO_ROUTES.detail(tipo.id)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 transition hover:border-blue-200 hover:bg-blue-50 dark:border-white/[0.05] dark:hover:bg-white/[0.05]"
                          title="Ver detalle"
                        >
                          <EyeIcon className="size-4" />
                        </Link>
                      </PermissionGate>

                      {!deletedView && (
                        <>
                          <PermissionGate permission={TIPOS_INGRESOS_PERMISSIONS.update}>
                            <Link
                              to={TIPO_INGRESO_ROUTES.edit(tipo.id)}
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 transition hover:border-blue-200 hover:bg-blue-50 dark:border-white/[0.05] dark:hover:bg-white/[0.05]"
                              title="Editar tipo"
                            >
                              <PencilIcon className="size-4" />
                            </Link>
                          </PermissionGate>
                          <PermissionGate permission={TIPOS_INGRESOS_PERMISSIONS.delete}>
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
                        <PermissionGate permission={TIPOS_INGRESOS_PERMISSIONS.restore}>
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
      {meta && onPageChange && <Pagination meta={meta} onPageChange={onPageChange} />}
    </div>
  );
}
