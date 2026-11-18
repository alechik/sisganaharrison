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
import { ESTANCIA_ROUTES } from "../constants";
import { ESTANCIAS_PERMISSIONS } from "../permissions";
import { Estancia } from "../types";
import EstanciaStatusBadge from "./EstanciaStatusBadge";

interface Props {
  estancias: Estancia[];
  meta?: PaginationMeta;
  deletedView?: boolean;
  onPageChange?: (page: number) => void;
  onToggleStatus?: (estancia: Estancia) => void;
  onDelete?: (estancia: Estancia) => void;
  onRestore?: (estancia: Estancia) => void;
}

export default function EstanciaTable({
  estancias,
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
                Estancia
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
            {estancias.length === 0 ? (
              <TableRow>
                <TableCell className="px-5 py-8 text-center text-gray-500" colSpan={7}>
                  No hay estancias para mostrar.
                </TableCell>
              </TableRow>
            ) : (
              estancias.map((estancia) => (
                <TableRow
                  key={estancia.id}
                  className="transition hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                >
                  <TableCell className="px-5 py-4">
                    <div>
                      <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {estancia.nombre}
                      </span>
                      <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                        ID: {estancia.id}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                    {estancia.codigo}
                  </TableCell>

                  <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                    {estancia.propietario || "—"}
                  </TableCell>

                  <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                    {[estancia.municipio, estancia.departamento]
                      .filter(Boolean)
                      .join(", ") || "—"}
                  </TableCell>

                  <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                    {estancia.area_total_ha != null
                      ? estancia.area_total_ha.toLocaleString("es-PY")
                      : "—"}
                  </TableCell>

                  <TableCell className="px-5 py-4">
                    {!deletedView ? (
                      <PermissionGate permission={ESTANCIAS_PERMISSIONS.activate}>
                        <EstanciaStatusBadge
                          active={estancia.activo}
                          onClick={() => onToggleStatus?.(estancia)}
                          disabled={!onToggleStatus}
                        />
                      </PermissionGate>
                    ) : (
                      <EstanciaStatusBadge active={estancia.activo} />
                    )}
                  </TableCell>

                  <TableCell className="px-5 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <PermissionGate permission={ESTANCIAS_PERMISSIONS.view}>
                        <Link
                          to={ESTANCIA_ROUTES.detail(estancia.id)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 transition hover:border-blue-200 hover:bg-blue-50 dark:border-white/[0.05] dark:hover:bg-white/[0.05]"
                          title="Ver detalle"
                        >
                          <EyeIcon className="size-4" />
                        </Link>
                      </PermissionGate>

                      {!deletedView && (
                        <>
                          <PermissionGate permission={ESTANCIAS_PERMISSIONS.update}>
                            <Link
                              to={ESTANCIA_ROUTES.edit(estancia.id)}
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 transition hover:border-blue-200 hover:bg-blue-50 dark:border-white/[0.05] dark:hover:bg-white/[0.05]"
                              title="Editar estancia"
                            >
                              <PencilIcon className="size-4" />
                            </Link>
                          </PermissionGate>

                          <PermissionGate permission={ESTANCIAS_PERMISSIONS.delete}>
                            <button
                              type="button"
                              onClick={() => onDelete?.(estancia)}
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 transition hover:border-red-200 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/[0.05] dark:hover:bg-red-500/10"
                              title="Eliminar estancia"
                            >
                              <TrashBinIcon className="size-4" />
                            </button>
                          </PermissionGate>
                        </>
                      )}

                      {deletedView && (
                        <PermissionGate permission={ESTANCIAS_PERMISSIONS.restore}>
                          <button
                            type="button"
                            onClick={() => onRestore?.(estancia)}
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
