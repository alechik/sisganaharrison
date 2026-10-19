import { useEffect, useState } from "react";

import DebouncedSearchField from "@/components/form/DebouncedSearchField";
import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import { getAlmacenes } from "@/modules/almacenes/services";
import { getSocios } from "@/modules/socios-de-negocio/services";
import { INGRESO_PRODUCTO_SORT_OPTIONS } from "../constants";
import { IngresoProductoFilters, IngresoProductoSortDirection } from "../types";

interface Props {
  filters: IngresoProductoFilters;
  onChange: (partial: Partial<IngresoProductoFilters>) => void;
}

export default function IngresoProductoFiltersBar({ filters, onChange }: Props) {
  const [proveedores, setProveedores] = useState<{ value: string; label: string }[]>([]);
  const [almacenes, setAlmacenes] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [socios, warehouses] = await Promise.all([
          getSocios({ tiene_tipo: "PROVEEDOR", per_page: 100, page: 1 }),
          getAlmacenes({ per_page: 100, activo: true }),
        ]);
        setProveedores(socios.data.map((socio) => ({ value: String(socio.id), label: socio.razon_social })));
        setAlmacenes(warehouses.data.map((item) => ({ value: String(item.id), label: item.nombre })));
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
        <DebouncedSearchField
          placeholder="IP-000001"
          value={filters.cod_ingreso ?? ""}
          onValueChange={(cod_ingreso) => onChange({ cod_ingreso })}
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
        <Label>Almacén</Label>
        <Select
          value={filters.almacen_id ? String(filters.almacen_id) : "all"}
          placeholder="Todos"
          options={[{ value: "all", label: "Todos" }, ...almacenes]}
          onChange={(value) =>
            onChange({ almacen_id: value === "all" ? undefined : Number(value) })
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
          options={INGRESO_PRODUCTO_SORT_OPTIONS.map((option) => ({
            value: option.value,
            label: option.label,
          }))}
          onChange={(value) => onChange({ sort_by: value as IngresoProductoFilters["sort_by"] })}
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
          onChange={(value) => onChange({ sort_dir: value as IngresoProductoSortDirection })}
        />
      </div>
    </div>
  );
}
