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
import { ANIMAL_ROUTES } from "../constants";
import { ANIMALES_PERMISSIONS } from "../permissions";
import { Animal } from "../types";
import AnimalStatusBadge from "./AnimalStatusBadge";

interface Props {
  animales: Animal[];
  meta?: PaginationMeta;
  deletedView?: boolean;
  onPageChange?: (page: number) => void;
  onToggleStatus?: (animal: Animal) => void;
  onDelete?: (animal: Animal) => void;
  onRestore?: (animal: Animal) => void;
}

const sexoLabel = (sexo: Animal["sexo"]) => (sexo === "M" ? "Macho" : "Hembra");

export default function AnimalTable({
  animales,
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
                Animal
              </TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start">
                Código / Arete
              </TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start">
                Sexo
              </TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start">
                Raza
              </TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start">
                Categoría
              </TableCell>
              <TableCell isHeader className="px-5 py-4 font-semibold text-start">
                Lote
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
            {animales.length === 0 ? (
              <TableRow>
                <TableCell className="px-5 py-8 text-center text-gray-500" colSpan={8}>
                  No hay animales para mostrar.
                </TableCell>
              </TableRow>
            ) : (
              animales.map((animal) => (
                <TableRow
                  key={animal.id}
                  className="transition hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                >
                  <TableCell className="px-5 py-4">
                    <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {animal.nombre || animal.codigo}
                    </span>
                  </TableCell>

                  <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                    <span className="block">{animal.codigo}</span>
                    <span className="block text-theme-xs">{animal.arete || "—"}</span>
                  </TableCell>

                  <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                    {sexoLabel(animal.sexo)}
                  </TableCell>

                  <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                    {animal.raza_nombre || "—"}
                  </TableCell>

                  <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                    {animal.categoria_nombre || "—"}
                  </TableCell>

                  <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                    {animal.lote_nombre || "—"}
                  </TableCell>

                  <TableCell className="px-5 py-4">
                    {!deletedView ? (
                      <PermissionGate permission={ANIMALES_PERMISSIONS.activate}>
                        <AnimalStatusBadge
                          active={animal.activo}
                          onClick={() => onToggleStatus?.(animal)}
                          disabled={!onToggleStatus}
                        />
                      </PermissionGate>
                    ) : (
                      <AnimalStatusBadge active={animal.activo} />
                    )}
                  </TableCell>

                  <TableCell className="px-5 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <PermissionGate permission={ANIMALES_PERMISSIONS.view}>
                        <Link
                          to={ANIMAL_ROUTES.detail(animal.id)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 transition hover:border-blue-200 hover:bg-blue-50 dark:border-white/[0.05] dark:hover:bg-white/[0.05]"
                          title="Ver detalle"
                        >
                          <EyeIcon className="size-4" />
                        </Link>
                      </PermissionGate>

                      {!deletedView && (
                        <>
                          <PermissionGate permission={ANIMALES_PERMISSIONS.update}>
                            <Link
                              to={ANIMAL_ROUTES.edit(animal.id)}
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 transition hover:border-blue-200 hover:bg-blue-50 dark:border-white/[0.05] dark:hover:bg-white/[0.05]"
                              title="Editar animal"
                            >
                              <PencilIcon className="size-4" />
                            </Link>
                          </PermissionGate>

                          <PermissionGate permission={ANIMALES_PERMISSIONS.delete}>
                            <button
                              type="button"
                              onClick={() => onDelete?.(animal)}
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 transition hover:border-red-200 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/[0.05] dark:hover:bg-red-500/10"
                              title="Eliminar animal"
                            >
                              <TrashBinIcon className="size-4" />
                            </button>
                          </PermissionGate>
                        </>
                      )}

                      {deletedView && (
                        <PermissionGate permission={ANIMALES_PERMISSIONS.restore}>
                          <button
                            type="button"
                            onClick={() => onRestore?.(animal)}
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
