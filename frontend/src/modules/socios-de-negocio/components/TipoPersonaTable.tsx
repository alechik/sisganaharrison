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
import { PencilIcon, TrashBinIcon } from "@/icons";
import { SOCIO_ROUTES } from "../constants";
import { TIPOS_PERSONA_PERMISSIONS } from "../permissions";
import { TipoPersona } from "../types";
import { getTipoLabel } from "../utils";

interface Props {
  tipos: TipoPersona[];
  meta?: PaginationMeta;
  onPageChange?: (page: number) => void;
  onDelete?: (tipo: TipoPersona) => void;
}

export default function TipoPersonaTable({ tipos, meta, onPageChange, onDelete }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start text-gray-800 dark:text-white">Nombre</TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start text-gray-800 dark:text-white">Código</TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-center text-gray-800 dark:text-white">Opciones</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {tipos.length === 0 ? (
              <TableRow>
                <TableCell className="px-5 py-8 text-center text-gray-500" colSpan={3}>
                  No hay tipos de persona para mostrar.
                </TableCell>
              </TableRow>
            ) : (
              tipos.map((tipo) => (
                <TableRow key={tipo.id} className="transition hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                  <TableCell className="px-5 py-4 font-medium text-gray-800 text-theme-sm dark:text-white/90">
                    {getTipoLabel(tipo.nombre)}
                    {tipo.protegido ? (
                      <span className="ml-2 text-xs text-gray-400">(protegido)</span>
                    ) : null}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">{tipo.nombre}</TableCell>
                  <TableCell className="px-5 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <PermissionGate permission={TIPOS_PERSONA_PERMISSIONS.update}>
                        <Link
                          to={SOCIO_ROUTES.tiposEdit(tipo.id)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 transition hover:border-blue-200 hover:bg-blue-50 disabled:opacity-60 dark:border-white/[0.05]"
                          title="Editar tipo"
                        >
                          <PencilIcon className="size-4" />
                        </Link>
                      </PermissionGate>
                      <PermissionGate permission={TIPOS_PERSONA_PERMISSIONS.delete}>
                        <button
                          type="button"
                          disabled={tipo.protegido}
                          onClick={() => onDelete?.(tipo)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 transition hover:border-red-200 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/[0.05]"
                          title={tipo.protegido ? "Tipo protegido" : "Eliminar tipo"}
                        >
                          <TrashBinIcon className="size-4" />
                        </button>
                      </PermissionGate>
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
