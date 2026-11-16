import { useEffect, useMemo, useState } from "react";
import CreatableSelect from "react-select/creatable";

import { useTheme } from "@/context/ThemeContext";
import { getAlmacenesIngreso } from "../services";
import { AlmacenDisponibleIngreso } from "../types";
import { creatableSelectStyles } from "./creatableSelectStyles";

export type AlmacenOption = {
  value: number;
  label: string;
  almacen: AlmacenDisponibleIngreso;
};

interface Props {
  value: AlmacenOption | null;
  onChange: (option: AlmacenOption | null) => void;
  disabled?: boolean;
}

const toOption = (almacen: AlmacenDisponibleIngreso): AlmacenOption => ({
  value: almacen.id,
  label: almacen.establecimiento_codigo
    ? `${almacen.establecimiento_codigo} · ${almacen.nombre}`
    : almacen.nombre,
  almacen,
});

export default function AlmacenSelect({ value, onChange, disabled }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState<AlmacenOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const data = await getAlmacenesIngreso();
        if (!cancelled) {
          setOptions(data.map(toOption));
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setOptions([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const termino = inputValue.trim().toLowerCase();
    if (!termino) {
      return options;
    }
    return options.filter((option) => option.label.toLowerCase().includes(termino));
  }, [inputValue, options]);

  const styles = useMemo(() => creatableSelectStyles<AlmacenOption>(isDark), [isDark]);

  return (
    <CreatableSelect<AlmacenOption, false>
      isClearable
      isDisabled={disabled}
      isLoading={loading}
      options={filtered}
      value={value}
      inputValue={inputValue}
      placeholder="Seleccione un almacén"
      noOptionsMessage={() => "No hay almacenes disponibles."}
      loadingMessage={() => "Cargando..."}
      isValidNewOption={() => false}
      styles={styles}
      classNamePrefix="ingreso-almacen"
      onInputChange={(next, meta) => {
        if (meta.action === "input-change" || meta.action === "set-value") {
          setInputValue(next);
        }
        if (meta.action === "input-blur" || meta.action === "menu-close") {
          setInputValue("");
        }
        return next;
      }}
      onChange={(option) => onChange(option)}
      formatOptionLabel={(option) => (
        <div>
          <span className="font-medium">{option.almacen.nombre}</span>
          {option.almacen.establecimiento_nombre ? (
            <span className="mt-0.5 block text-xs text-gray-500">
              {option.almacen.establecimiento_codigo
                ? `${option.almacen.establecimiento_codigo} · `
                : ""}
              {option.almacen.establecimiento_nombre}
            </span>
          ) : null}
        </div>
      )}
    />
  );
}
