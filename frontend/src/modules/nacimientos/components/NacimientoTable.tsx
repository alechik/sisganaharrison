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
import { EyeIcon, PencilIcon } from "@/icons";
import { NACIMIENTO_ROUTES } from "../constants";
import { NACIMIENTOS_PERMISSIONS } from "../permissions";
import { Nacimiento } from "../types";
import {
  formatDate,
  getEstadoGestacionLabel,
  getSexoLabel,
  getTipoServicioLabel,
} from "../utils";
import NacimientoEstadoBadge from "./NacimientoEstadoBadge";

interface Props {
  nacimientos: Nacimiento[];
  meta?: PaginationMeta;
  onPageChange?: (page: number) => void;
}

export default function NacimientoTable({ nacimientos, meta, onPageChange }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start text-gray-800 dark:text-white">Fecha parto</TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start text-gray-800 dark:text-white">Estado gestación</TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start text-gray-800 dark:text-white">Fecha servicio</TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start text-gray-800 dark:text-white">Tipo servicio</TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start text-gray-800 dark:text-white">Código hembra</TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start text-gray-800 dark:text-white">Arete hembra</TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start text-gray-800 dark:text-white">Código macho</TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start text-gray-800 dark:text-white">Arete macho</TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start text-gray-800 dark:text-white">Código animal</TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start text-gray-800 dark:text-white">Arete animal</TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start text-gray-800 dark:text-white">Sexo</TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start text-gray-800 dark:text-white">Estado</TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-center text-gray-800 dark:text-white">Opciones</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {nacimientos.length === 0 ? (
              <TableRow>
                <TableCell className="px-5 py-8 text-center text-gray-500" colSpan={13}>
                  No hay nacimientos para mostrar.
                </TableCell>
              </TableRow>
            ) : (
              nacimientos.map((nacimiento) => (
                <TableRow key={nacimiento.id} className="transition hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                  <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">{formatDate(nacimiento.parto_fecha_parto)}</TableCell>
                  <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">{getEstadoGestacionLabel(nacimiento.parto_gestacion_estado)}</TableCell>
                  <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">{formatDate(nacimiento.parto_gestacion_servicio_fecha_servicio)}</TableCell>
                  <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">{getTipoServicioLabel(nacimiento.parto_gestacion_servicio_tipo_servicio)}</TableCell>
                  <TableCell className="px-5 py-4 font-medium text-gray-800 text-theme-sm dark:text-white/90">{nacimiento.parto_gestacion_servicio_hembra_codigo || "—"}</TableCell>
                  <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">{nacimiento.parto_gestacion_servicio_hembra_arete || "—"}</TableCell>
                  <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">{nacimiento.parto_gestacion_servicio_macho_codigo || "—"}</TableCell>
                  <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">{nacimiento.parto_gestacion_servicio_macho_arete || "—"}</TableCell>
                  <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">{nacimiento.animal_codigo || "—"}</TableCell>
                  <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">{nacimiento.animal_arete || "—"}</TableCell>
                  <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">{getSexoLabel(nacimiento.sexo)}</TableCell>
                  <TableCell className="px-5 py-4"><NacimientoEstadoBadge estado={nacimiento.estado_nacimiento} /></TableCell>
                  <TableCell className="px-5 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <PermissionGate permission={NACIMIENTOS_PERMISSIONS.view}>
                        <Link to={NACIMIENTO_ROUTES.detail(nacimiento.id)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 transition hover:border-blue-200 hover:bg-blue-50 dark:border-white/[0.05] dark:hover:bg-white/[0.05]" title="Ver detalle">
                          <EyeIcon className="size-4" />
                        </Link>
                      </PermissionGate>
                      <PermissionGate permission={NACIMIENTOS_PERMISSIONS.update}>
                        <Link to={NACIMIENTO_ROUTES.edit(nacimiento.id)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 transition hover:border-blue-200 hover:bg-blue-50 dark:border-white/[0.05] dark:hover:bg-white/[0.05]" title="Editar nacimiento">
                          <PencilIcon className="size-4" />
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
      {meta && onPageChange && <Pagination meta={meta} onPageChange={onPageChange} />}
    </div>
  );
}
