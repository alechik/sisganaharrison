import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import { VENTA_ESTADOS, VENTA_SORT_OPTIONS } from "../constants";
import { VentaFilters, VentaSortDirection } from "../types";

interface Props {
  filters: VentaFilters;
  onChange: (partial: Partial<VentaFilters>) => void;
}

export default function VentaFiltersBar({ filters, onChange }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03] md:grid-cols-2 xl:grid-cols-3">
      <div>
        <Label>Código de venta</Label>
        <InputField
          type="text"
          placeholder="VEN-2026-0001"
          value={filters.cod_venta ?? ""}
          onChange={(e) => onChange({ cod_venta: e.target.value })}
        />
      </div>
      <div>
        <Label>Nombre del cliente</Label>
        <InputField
          type="text"
          placeholder="Razón social"
          value={filters.cliente ?? ""}
          onChange={(e) => onChange({ cliente: e.target.value })}
        />
      </div>
      <div>
        <Label>Fecha desde</Label>
        <InputField
          type="date"
          value={filters.fecha_desde ?? ""}
          onChange={(e) => onChange({ fecha_desde: e.target.value })}
        />
      </div>
      <div>
        <Label>Fecha hasta</Label>
        <InputField
          type="date"
          value={filters.fecha_hasta ?? ""}
          onChange={(e) => onChange({ fecha_hasta: e.target.value })}
        />
      </div>
      <div>
        <Label>Estado</Label>
        <Select
          value={filters.estado || "all"}
          placeholder="Todos"
          options={[
            { value: "all", label: "Todos" },
            ...VENTA_ESTADOS.map((estado) => ({
              value: estado.value,
              label: estado.label,
            })),
          ]}
          onChange={(value) => onChange({ estado: value === "all" ? undefined : value })}
        />
      </div>
      <div>
        <Label>Ordenar por</Label>
        <Select
          value={filters.sort_by}
          options={VENTA_SORT_OPTIONS.map((option) => ({
            value: option.value,
            label: option.label,
          }))}
          onChange={(value) => onChange({ sort_by: value as VentaFilters["sort_by"] })}
        />
      </div>
      <div>
        <Label>Dirección</Label>
        <Select
          value={filters.sort_dir}
          options={[
            { value: "asc", label: "Ascendente" },
            { value: "desc", label: "Descendente" },
          ]}
          onChange={(value) => onChange({ sort_dir: value as VentaSortDirection })}
        />
      </div>
    </div>
  );
}
