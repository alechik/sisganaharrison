import Badge from "@/components/ui/badge/Badge";

interface Props {
  active: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

export default function VacunaStatusBadge({
  active,
  onClick,
  disabled = false,
}: Props) {
  const content = (
    <Badge size="sm" color={active ? "success" : "error"}>
      {active ? "Activo" : "Inactivo"}
    </Badge>
  );

  if (!onClick) {
    return content;
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="disabled:cursor-not-allowed disabled:opacity-60"
      title="Cambiar estado"
    >
      {content}
    </button>
  );
}
