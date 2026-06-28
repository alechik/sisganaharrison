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
import { CATEGORIA_ANIMAL_ROUTES } from "../constants";
import { CATEGORIAS_ANIMALES_PERMISSIONS } from "../permissions";
import { CategoriaAnimal } from "../types";
import CategoriaAnimalStatusBadge from "./CategoriaAnimalStatusBadge";

interface Props {
  categorias: CategoriaAnimal[];
  meta?: PaginationMeta;
  deletedView?: boolean;
  onPageChange?: (page: number) => void;
  onToggleStatus?: (categoria: CategoriaAnimal) => void;
  onDelete?: (categoria: CategoriaAnimal) => void;
  onRestore?: (categoria: CategoriaAnimal) => void;
}

export default function CategoriaAnimalTable({
  categorias,
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
                Categoría
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
            {categorias.length === 0 ? (
              <TableRow>
                <TableCell className="px-5 py-8 text-center text-gray-500" colSpan={5}>
                  No hay categorías para mostrar.
                </TableCell>
              </TableRow>
            ) : (
              categorias.map((categoria) => (
                <TableRow
                  key={categoria.id}
                  className="transition hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                >
                  <TableCell className="px-5 py-4">
                    <div>
                      <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {categoria.nombre}
                      </span>
                      <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                        ID: {categoria.id}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                    {categoria.codigo}
                  </TableCell>

                  <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                    {categoria.descripcion || "Sin descripción"}
                  </TableCell>

                  <TableCell className="px-5 py-4">
                    {!deletedView ? (
                      <PermissionGate permission={CATEGORIAS_ANIMALES_PERMISSIONS.activate}>
                        <CategoriaAnimalStatusBadge
                          active={categoria.activo}
                          onClick={() => onToggleStatus?.(categoria)}
                          disabled={!onToggleStatus}
                        />
                      </PermissionGate>
                    ) : (
                      <CategoriaAnimalStatusBadge active={categoria.activo} />
                    )}
                  </TableCell>

                  <TableCell className="px-5 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <PermissionGate permission={CATEGORIAS_ANIMALES_PERMISSIONS.view}>
                        <Link
                          to={CATEGORIA_ANIMAL_ROUTES.detail(categoria.id)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 transition hover:border-blue-200 hover:bg-blue-50 dark:border-white/[0.05] dark:hover:bg-white/[0.05]"
                          title="Ver detalle"
                        >
                          <EyeIcon className="size-4" />
                        </Link>
                      </PermissionGate>

                      {!deletedView && (
                        <>
                          <PermissionGate permission={CATEGORIAS_ANIMALES_PERMISSIONS.update}>
                            <Link
                              to={CATEGORIA_ANIMAL_ROUTES.edit(categoria.id)}
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 transition hover:border-blue-200 hover:bg-blue-50 dark:border-white/[0.05] dark:hover:bg-white/[0.05]"
                              title="Editar categoría"
                            >
                              <PencilIcon className="size-4" />
                            </Link>
                          </PermissionGate>

                          <PermissionGate permission={CATEGORIAS_ANIMALES_PERMISSIONS.delete}>
                            <button
                              type="button"
                              onClick={() => onDelete?.(categoria)}
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 transition hover:border-red-200 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/[0.05] dark:hover:bg-red-500/10"
                              title="Eliminar categoría"
                            >
                              <TrashBinIcon className="size-4" />
                            </button>
                          </PermissionGate>
                        </>
                      )}

                      {deletedView && (
                        <PermissionGate permission={CATEGORIAS_ANIMALES_PERMISSIONS.restore}>
                          <button
                            type="button"
                            onClick={() => onRestore?.(categoria)}
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
