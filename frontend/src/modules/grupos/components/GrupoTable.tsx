import { Link } from "react-router-dom";
import PermissionGate from "@/components/auth/PermissionGate";
import Pagination from "@/components/common/Pagination";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { PaginationMeta } from "@/types/api";
import { EyeIcon, PencilIcon, TrashBinIcon } from "@/icons";
import { GRUPO_ROUTES } from "../constants";
import { GRUPOS_PERMISSIONS } from "../permissions";
import { Grupo } from "../types";
import GrupoStatusBadge from "./GrupoStatusBadge";

interface Props {
  grupos: Grupo[];
  meta?: PaginationMeta;
  deletedView?: boolean;
  onPageChange?: (page: number) => void;
  onToggleStatus?: (grupo: Grupo) => void;
  onDelete?: (grupo: Grupo) => void;
  onRestore?: (grupo: Grupo) => void;
}

export default function GrupoTable({ grupos, meta, deletedView = false, onPageChange, onToggleStatus, onDelete, onRestore }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start">Grupo</TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start">Potrero</TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start">Estado</TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-center">Opciones</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {grupos.length === 0 ? (
              <TableRow>
                <TableCell className="px-5 py-8 text-center text-gray-500" colSpan={4}>No hay grupos para mostrar.</TableCell>
              </TableRow>
            ) : (
              grupos.map((grupo) => (
                <TableRow key={grupo.id} className="transition hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                  <TableCell className="px-5 py-4">
                    <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">{grupo.nombre}</span>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">{grupo.lote_nombre || "—"}</TableCell>
                  <TableCell className="px-5 py-4">
                    {!deletedView ? (
                      <PermissionGate permission={GRUPOS_PERMISSIONS.activate}>
                        <GrupoStatusBadge active={grupo.activo} onClick={() => onToggleStatus?.(grupo)} disabled={!onToggleStatus} />
                      </PermissionGate>
                    ) : (
                      <GrupoStatusBadge active={grupo.activo} />
                    )}
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <PermissionGate permission={GRUPOS_PERMISSIONS.view}>
                        <Link to={GRUPO_ROUTES.detail(grupo.id)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 transition hover:border-blue-200 hover:bg-blue-50 dark:border-white/[0.05] dark:hover:bg-white/[0.05]" title="Ver detalle">
                          <EyeIcon className="size-4" />
                        </Link>
                      </PermissionGate>
                      {!deletedView && (
                        <>
                          <PermissionGate permission={GRUPOS_PERMISSIONS.update}>
                            <Link to={GRUPO_ROUTES.edit(grupo.id)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 transition hover:border-blue-200 hover:bg-blue-50 dark:border-white/[0.05] dark:hover:bg-white/[0.05]" title="Editar grupo">
                              <PencilIcon className="size-4" />
                            </Link>
                          </PermissionGate>
                          <PermissionGate permission={GRUPOS_PERMISSIONS.delete}>
                            <button type="button" onClick={() => onDelete?.(grupo)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 transition hover:border-red-200 hover:bg-red-50 dark:border-white/[0.05] dark:hover:bg-red-500/10" title="Eliminar grupo">
                              <TrashBinIcon className="size-4" />
                            </button>
                          </PermissionGate>
                        </>
                      )}
                      {deletedView && (
                        <PermissionGate permission={GRUPOS_PERMISSIONS.restore}>
                          <button type="button" onClick={() => onRestore?.(grupo)} className="inline-flex items-center rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-white/[0.05] dark:text-gray-300">
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
