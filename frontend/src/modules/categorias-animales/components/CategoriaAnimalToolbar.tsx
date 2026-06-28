import { Link } from "react-router-dom";

import PermissionGate from "@/components/auth/PermissionGate";
import { CATEGORIA_ANIMAL_ROUTES } from "../constants";
import { CATEGORIAS_ANIMALES_PERMISSIONS } from "../permissions";

interface Props {
  showDeletedLink?: boolean;
  showCreateButton?: boolean;
}

export default function CategoriaAnimalToolbar({
  showDeletedLink = true,
  showCreateButton = true,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {showDeletedLink && (
        <PermissionGate permission={CATEGORIAS_ANIMALES_PERMISSIONS.view}>
          <Link
            to={CATEGORIA_ANIMAL_ROUTES.deleted}
            className="inline-flex items-center rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-white/[0.05] dark:text-gray-300 dark:hover:bg-white/[0.05]"
          >
            Ver eliminadas
          </Link>
        </PermissionGate>
      )}

      {showCreateButton && (
        <PermissionGate permission={CATEGORIAS_ANIMALES_PERMISSIONS.create}>
          <Link
            to={CATEGORIA_ANIMAL_ROUTES.create}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600"
          >
            + Nueva Categoría
          </Link>
        </PermissionGate>
      )}
    </div>
  );
}
