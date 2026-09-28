import { useEffect, useState } from "react";

import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import { getLotes } from "@/modules/lotes/services";
import { TRASPASO_SORT_OPTIONS } from "../constants";
import { TraspasoFilters, TraspasoSortDirection } from "../types";

interface Props {
  filters: TraspasoFilters;
  onChange: (partial: Partial<TraspasoFilters>) => void;
}

export default function TraspasoFiltersBar({ filters, onChange }: Props) {
  const [loteOptions, setLoteOptions] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    getLotes({ per_page: 100, activo: true, sort_by: "nombre", sort_dir: "asc" })
      .then((res) =>
        setLoteOptions(
          res.data.map((lote) => ({
            value: String(lote.id),
            label: `${lote.codigo} — ${lote.nombre}`,
          }))
        )
      )
      .catch(console.error);
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03] md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      <div>
        <Label>Búsqueda</Label>
        <InputField
          type="text"
          placeholder="Lote, animal u observación"
          value={filters.search ?? ""}
          onChange={(e) => onChange({ search: e.target.value })}
        />
      </div>
      <div>
        <Label>Lote de salida</Label>
        <Select
          value={filters.lote_salida_id ? String(filters.lote_salida_id) : "all"}
          options={[{ value: "all", label: "Todos" }, ...loteOptions]}
          onChange={(value) =>
            onChange({ lote_salida_id: value === "all" ? undefined : Number(value) })
          }
        />
      </div>
      <div>
        <Label>Lote de ingreso</Label>
        <Select
          value={filters.lote_ingreso_id ? String(filters.lote_ingreso_id) : "all"}
          options={[{ value: "all", label: "Todos" }, ...loteOptions]}
          onChange={(value) =>
            onChange({ lote_ingreso_id: value === "all" ? undefined : Number(value) })
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
          options={TRASPASO_SORT_OPTIONS.map((option) => ({
            value: option.value,
            label: option.label,
          }))}
          onChange={(value) => onChange({ sort_by: value as TraspasoFilters["sort_by"] })}
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
          onChange={(value) => onChange({ sort_dir: value as TraspasoSortDirection })}
        />
      </div>
    </div>
  );
}
