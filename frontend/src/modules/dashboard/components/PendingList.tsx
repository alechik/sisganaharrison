import Badge from "@/components/ui/badge/Badge";
import { PendienteItem } from "../types";

const badgeColor = (nivel: PendienteItem["nivel"]) => {
  if (nivel === "error") return "error" as const;
  if (nivel === "warning") return "warning" as const;
  return "info" as const;
};

export default function PendingList({ items }: { items: PendienteItem[] }) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        No hay pendientes operativos en este momento.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li
          key={`${item.tipo}-${item.titulo}`}
          className="flex items-center justify-between gap-3"
        >
          <span className="text-sm text-gray-700 dark:text-gray-300">{item.titulo}</span>
          <Badge color={badgeColor(item.nivel)} size="sm">
            {item.total}
          </Badge>
        </li>
      ))}
    </ul>
  );
}
