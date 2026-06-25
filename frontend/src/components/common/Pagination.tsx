import Button from "@/components/ui/button/Button";
import { PaginationMeta } from "@/types/api";

interface Props {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}

export default function Pagination({ meta, onPageChange }: Props) {
  if (meta.last_page <= 1) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 px-6 py-4 border-t border-gray-100 dark:border-white/[0.05] sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Mostrando {meta.from ?? 0}–{meta.to ?? 0} de {meta.total} registros
      </p>

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={meta.current_page <= 1}
          onClick={() => onPageChange(meta.current_page - 1)}
        >
          Anterior
        </Button>

        <span className="text-sm text-gray-600 dark:text-gray-300">
          Página {meta.current_page} de {meta.last_page}
        </span>

        <Button
          size="sm"
          variant="outline"
          disabled={meta.current_page >= meta.last_page}
          onClick={() => onPageChange(meta.current_page + 1)}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
}
