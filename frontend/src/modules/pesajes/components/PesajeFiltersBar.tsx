import DebouncedSearchField from "@/components/form/DebouncedSearchField";
import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { PesajeFilters } from "../types";

interface Props {
  filters: PesajeFilters;
  onChange: (partial: Partial<PesajeFilters>) => void;
}

export default function PesajeFiltersBar({ filters, onChange }: Props) {
  return (
    <div className="flex flex-wrap items-end gap-x-3 gap-y-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="min-w-0 w-full sm:min-w-[16rem] sm:flex-[1.4_1_16rem]">
        <Label>Búsqueda</Label>
        <DebouncedSearchField
          placeholder="Código, arete u observaciones"
          value={filters.search ?? ""}
          onValueChange={(search) => onChange({ search })}
        />
      </div>
      <div className="w-full shrink-0 sm:w-[10.5rem]">
        <Label>Fecha desde</Label>
        <InputField
          type="date"
          value={filters.fecha_desde ?? ""}
          onChange={(e) => onChange({ fecha_desde: e.target.value })}
        />
      </div>
      <div className="w-full shrink-0 sm:w-[10.5rem]">
        <Label>Fecha hasta</Label>
        <InputField
          type="date"
          value={filters.fecha_hasta ?? ""}
          onChange={(e) => onChange({ fecha_hasta: e.target.value })}
        />
      </div>
    </div>
  );
}
