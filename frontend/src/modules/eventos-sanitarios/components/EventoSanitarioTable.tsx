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
import { EVENTO_SANITARIO_ROUTES } from "../constants";
import { EVENTOS_SANITARIOS_PERMISSIONS } from "../permissions";
import { EventoSanitario } from "../types";
import { formatAnimalLabel } from "../utils";

interface Props {
  eventos: EventoSanitario[];
  meta?: PaginationMeta;
  onPageChange?: (page: number) => void;
}

export default function EventoSanitarioTable({ eventos, meta, onPageChange }: Props) {
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
                Tipo
              </TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start text-gray-800 dark:text-white">
                Vacuna
              </TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start text-gray-800 dark:text-white">
                Fecha
              </TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start text-gray-800 dark:text-white">
                Diagnóstico
              </TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-center text-gray-800 dark:text-white">
                Opciones
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {eventos.length === 0 ? (
              <TableRow>
                <TableCell className="px-5 py-8 text-center text-gray-500" colSpan={6}>
                  No hay eventos sanitarios para mostrar.
                </TableCell>
              </TableRow>
            ) : (
              eventos.map((evento) => (
                <TableRow
                  key={evento.id}
                  className="transition hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                >
                  <TableCell className="px-5 py-4">
                    <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {formatAnimalLabel(evento.animal_codigo, evento.animal_arete)}
                    </span>
                  </TableCell>

                  <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                    {evento.tipo_evento_nombre || "—"}
                  </TableCell>

                  <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                    {evento.vacuna_nombre || "—"}
                  </TableCell>

                  <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                    {evento.fecha
                      ? new Date(`${evento.fecha}T00:00:00`).toLocaleDateString("es-PY")
                      : "—"}
                  </TableCell>

                  <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                    {evento.diagnostico || "—"}
                  </TableCell>

                  <TableCell className="px-5 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <PermissionGate permission={EVENTOS_SANITARIOS_PERMISSIONS.view}>
                        <Link
                          to={EVENTO_SANITARIO_ROUTES.detail(evento.id)}
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
