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
import { EyeIcon } from "@/icons";
import { PESAJE_ROUTES } from "../constants";
import { PESAJES_PERMISSIONS } from "../permissions";
import { Pesaje } from "../types";
import { formatAnimalLabel, formatPeso } from "../utils";

interface Props {
  pesajes: Pesaje[];
  meta?: PaginationMeta;
  onPageChange?: (page: number) => void;
}

export default function PesajeTable({ pesajes, meta, onPageChange }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start text-gray-800 dark:text-white">
                Animal
              </TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start text-gray-800 dark:text-white">
                Fecha
              </TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start text-gray-800 dark:text-white">
                Peso
              </TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start text-gray-800 dark:text-white">
                Observaciones
              </TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-center text-gray-800 dark:text-white">
                Opciones
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {pesajes.length === 0 ? (
              <TableRow>
                <TableCell className="px-5 py-8 text-center text-gray-500" colSpan={5}>
                  No hay pesajes para mostrar.
                </TableCell>
              </TableRow>
            ) : (
              pesajes.map((pesaje) => (
                <TableRow
                  key={pesaje.id}
                  className="transition hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                >
                  <TableCell className="px-5 py-4">
                    <div>
                      <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {formatAnimalLabel(pesaje.animal_codigo, pesaje.animal_arete)}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                    {pesaje.fecha
                      ? new Date(`${pesaje.fecha}T00:00:00`).toLocaleDateString("es-PY")
                      : "—"}
                  </TableCell>

                  <TableCell className="px-5 py-4 text-theme-sm font-medium text-gray-700 dark:text-gray-300">
                    {formatPeso(pesaje.peso)}
                  </TableCell>

                  <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                    {pesaje.es_nacimiento ? (
                      <span className="mr-2 inline-flex rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
                        Nacimiento
                      </span>
                    ) : null}
                    {pesaje.observaciones || "Sin observaciones"}
                  </TableCell>

                  <TableCell className="px-5 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <PermissionGate permission={PESAJES_PERMISSIONS.view}>
                        <Link
                          to={PESAJE_ROUTES.detail(pesaje.id)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 transition hover:border-blue-200 hover:bg-blue-50 dark:border-white/[0.05] dark:hover:bg-white/[0.05]"
                          title="Ver detalle"
                        >
                          <EyeIcon className="size-4" />
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
