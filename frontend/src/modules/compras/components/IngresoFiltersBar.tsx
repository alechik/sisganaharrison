import { useEffect, useState } from "react";

import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import { getSocios } from "@/modules/socios-de-negocio/services";
import { INGRESO_SORT_OPTIONS } from "../constants";
import { IngresoFilters, IngresoSortDirection } from "../types";

interface Props {
  filters: IngresoFilters;
  onChange: (partial: Partial<IngresoFilters>) => void;
}

export default function IngresoFiltersBar({ filters, onChange }: Props) {
  const [proveedores, setProveedores] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const socios = await getSocios({
          tiene_tipo: "PROVEEDOR",
          per_page: 100,
          page: 1,
        });
        setProveedores(
          socios.data.map((socio) => ({
            value: String(socio.id),
            label: socio.razon_social,
          }))
        );
      } catch (err) {
        console.error(err);
      }
    };

    load();
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03] md:grid-cols-2 xl:grid-cols-3">
      <div>
        <Label>Código</Label>
        <InputField
          type="text"
          placeholder="ING-2026-0001"
          value={filters.codigo ?? ""}
          onChange={(e) => onChange({ codigo: e.target.value })}
        />
      </div>
      <div>
        <Label>Proveedor</Label>
        <Select
          value={filters.proveedor_id ? String(filters.proveedor_id) : "all"}
          placeholder="Todos"
          options={[{ value: "all", label: "Todos" }, ...proveedores]}
          onChange={(value) =>
            onChange({ proveedor_id: value === "all" ? undefined : Number(value) })
          }
        />
      </div>
      <div>
        <Label>Fecha de ingreso</Label>
        <InputField
          type="date"
          value={filters.fecha ?? ""}
          onChange={(e) => onChange({ fecha: e.target.value })}
        />
      </div>
      <div>
        <Label>Ordenar por</Label>
        <Select
          value={filters.sort_by}
          options={INGRESO_SORT_OPTIONS.map((option) => ({
            value: option.value,
            label: option.label,
          }))}
          onChange={(value) => onChange({ sort_by: value as IngresoFilters["sort_by"] })}
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
          onChange={(value) => onChange({ sort_dir: value as IngresoSortDirection })}
        />
      </div>
    </div>
  );
}
