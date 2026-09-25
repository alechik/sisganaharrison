import { useEffect, useState } from "react";

import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import { getTiposSalidas } from "@/modules/tipos-salidas/services";
import { SALIDA_SORT_OPTIONS } from "../constants";
import { SalidaFilters, SalidaSortDirection } from "../types";

interface Props {
  filters: SalidaFilters;
  onChange: (partial: Partial<SalidaFilters>) => void;
}

export default function SalidaFiltersBar({ filters, onChange }: Props) {
  const [tipos, setTipos] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    getTiposSalidas({ per_page: 100, page: 1, sort_by: "nombre" })
      .then((response) =>
        setTipos(response.data.map((item) => ({ value: String(item.id), label: item.nombre })))
      )
      .catch(console.error);
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03] md:grid-cols-2 xl:grid-cols-3">
      <div>
        <Label>Código</Label>
        <InputField
          type="text"
          placeholder="SAL-2026-0001"
          value={filters.codigo ?? ""}
          onChange={(e) => onChange({ codigo: e.target.value })}
        />
      </div>
      <div>
        <Label>Cliente</Label>
        <InputField
          type="text"
          value={filters.cliente ?? ""}
          onChange={(e) => onChange({ cliente: e.target.value })}
        />
      </div>
      <div>
        <Label>Tipo</Label>
        <Select
          value={filters.tipo_salida_id ? String(filters.tipo_salida_id) : "all"}
          options={[{ value: "all", label: "Todos" }, ...tipos]}
          onChange={(value) =>
            onChange({ tipo_salida_id: value === "all" ? undefined : Number(value) })
          }
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
        <Label>Ordenar por</Label>
        <Select
          value={filters.sort_by}
          options={SALIDA_SORT_OPTIONS.map((option) => ({
            value: option.value,
            label: option.label,
          }))}
          onChange={(value) => onChange({ sort_by: value as SalidaFilters["sort_by"] })}
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
          onChange={(value) => onChange({ sort_dir: value as SalidaSortDirection })}
        />
      </div>
    </div>
  );
}
