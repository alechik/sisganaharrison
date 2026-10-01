interface ListRefreshIndicatorProps {
  active?: boolean;
}

export default function ListRefreshIndicator({
  active = false,
}: ListRefreshIndicatorProps) {
  if (!active) {
    return null;
  }

  return (
    <span
      role="status"
      aria-live="polite"
      className="pointer-events-none absolute inset-x-3 bottom-0 h-0.5 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700"
    >
      <span className="sr-only">Actualizando listado</span>
      <span className="block h-full w-1/3 animate-pulse bg-brand-500 dark:bg-brand-400" />
    </span>
  );
}
