import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import { useAnimalReferenceOptions } from "@/modules/animales/hooks";
import { useSanitarioReferenceOptions } from "@/modules/eventos-sanitarios/hooks";
import { useActiveAnimalOptions } from "@/modules/pesajes/hooks";
import { ESTADO_ANIMAL_OPTIONS, REPORTE_TIPOS, SEXO_OPTIONS } from "../constants";
import { ReporteFiltros } from "../types";

interface Props {
  filtros: ReporteFiltros;
  onChange: (partial: Partial<ReporteFiltros>) => void;
}

const conTodos = (options: { value: string; label: string }[]) => [
  { value: "all", label: "Todos" },
  ...options,
];

export default function ReporteFiltersBar({ filtros, onChange }: Props) {
  const { razaOptions, categoriaOptions, estadoProductivoOptions, loteOptions } =
    useAnimalReferenceOptions();
  const { tipoEventoOptions } = useSanitarioReferenceOptions();
  const { animalOptions } = useActiveAnimalOptions();
  const esInventario = filtros.tipo === "inventario";
  const esSanidad = filtros.tipo === "sanidad";

  return (
    <div className="grid grid-cols-1 gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03] md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      <div>
        <Label>Reporte</Label>
        <Select
          options={[...REPORTE_TIPOS]}
          value={filtros.tipo}
          onChange={(value) => onChange({ tipo: value as ReporteFiltros["tipo"], page: 1 })}
        />
      </div>

      {!esInventario && (
        <>
          <div>
            <Label>Desde</Label>
            <Input
              type="date"
              value={filtros.desde}
              onChange={(event) => onChange({ desde: event.target.value, page: 1 })}
            />
          </div>
          <div>
            <Label>Hasta</Label>
            <Input
              type="date"
              value={filtros.hasta}
              onChange={(event) => onChange({ hasta: event.target.value, page: 1 })}
            />
          </div>
        </>
      )}

      {esInventario && (
        <>
          <div>
            <Label>Sexo</Label>
            <Select
              options={SEXO_OPTIONS}
              value={filtros.sexo}
              onChange={(value) => onChange({ sexo: value, page: 1 })}
            />
          </div>
          <div>
            <Label>Raza</Label>
            <Select
              options={conTodos(razaOptions)}
              value={filtros.raza_id}
              onChange={(value) => onChange({ raza_id: value, page: 1 })}
            />
          </div>
          <div>
            <Label>Categoría</Label>
            <Select
              options={conTodos(categoriaOptions)}
              value={filtros.categoria_id}
              onChange={(value) => onChange({ categoria_id: value, page: 1 })}
            />
          </div>
          <div>
            <Label>Estado productivo</Label>
            <Select
              options={conTodos(estadoProductivoOptions)}
              value={filtros.estado_productivo_id}
              onChange={(value) => onChange({ estado_productivo_id: value, page: 1 })}
            />
          </div>
          <div>
            <Label>Lote</Label>
            <Select
              options={conTodos(loteOptions)}
              value={filtros.lote_id}
              onChange={(value) => onChange({ lote_id: value, page: 1 })}
            />
          </div>
          <div>
            <Label>Estado</Label>
            <Select
              options={ESTADO_ANIMAL_OPTIONS}
              value={filtros.estado}
              onChange={(value) => onChange({ estado: value, page: 1 })}
            />
          </div>
        </>
      )}

      {esSanidad && (
        <>
          <div>
            <Label>Tipo de evento</Label>
            <Select
              options={conTodos(tipoEventoOptions)}
              value={filtros.tipo_evento_id}
              onChange={(value) => onChange({ tipo_evento_id: value, page: 1 })}
            />
          </div>
          <div>
            <Label>Animal</Label>
            <Select
              options={conTodos(animalOptions)}
              value={filtros.animal_id}
              onChange={(value) => onChange({ animal_id: value, page: 1 })}
            />
          </div>
        </>
      )}
    </div>
  );
}
