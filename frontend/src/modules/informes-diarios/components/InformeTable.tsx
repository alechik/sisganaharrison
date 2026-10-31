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
import { getCurrentUserId } from "@/modules/user/utils/currentUser";
import { canCrearInformesDiarios, canRevisarInformesDiarios } from "@/utils/roles";
import { INFORME_DIARIO_ROUTES } from "../constants";
import { InformeDiario } from "../types";
import { formatDate } from "../utils";
import InformeStatusBadge from "./InformeStatusBadge";

interface Props {
  informes: InformeDiario[];
  meta?: PaginationMeta;
  onPageChange?: (page: number) => void;
}

export default function InformeTable({ informes, meta, onPageChange }: Props) {
  const currentUserId = getCurrentUserId();
  const esGestor = canRevisarInformesDiarios();
  const esTrabajador = canCrearInformesDiarios();

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
                Trabajador
              </TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start text-gray-800 dark:text-white">
                Fecha
              </TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start text-gray-800 dark:text-white">
                Revisado
              </TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-center text-gray-800 dark:text-white">
                Opciones
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {informes.length === 0 ? (
              <TableRow>
                <TableCell className="px-5 py-8 text-center text-gray-500" colSpan={5}>
                  No hay informes diarios para mostrar.
                </TableCell>
              </TableRow>
            ) : (
              informes.map((informe) => {
                const esAutor = Number(currentUserId) === Number(informe.user_trabajador_id);
                const puedeEditar = esTrabajador && esAutor && informe.revisado === "NO";

                return (
                  <TableRow
                    key={informe.id}
                    className="transition hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                  >
                    <TableCell className="px-5 py-4">
                      <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {informe.codigo_informe}
                      </span>
                      <span className="block max-w-xs truncate text-gray-500 text-theme-xs dark:text-gray-400">
                        {informe.detalle_informe}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                      {informe.trabajador?.nombre ?? "—"}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                      {formatDate(informe.fecha)}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <InformeStatusBadge revisado={informe.revisado} />
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          to={INFORME_DIARIO_ROUTES.detail(informe.id)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 transition hover:border-blue-200 hover:bg-blue-50 dark:border-white/[0.05] dark:hover:bg-white/[0.05]"
                          title="Ver informe"
                        >
                          <EyeIcon className="size-4" />
                        </Link>

                        {!esGestor && puedeEditar && (
                          <Link
                            to={INFORME_DIARIO_ROUTES.edit(informe.id)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 transition hover:border-blue-200 hover:bg-blue-50 dark:border-white/[0.05] dark:hover:bg-white/[0.05]"
                            title="Editar informe"
                          >
                            <PencilIcon className="size-4" />
                          </Link>
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
