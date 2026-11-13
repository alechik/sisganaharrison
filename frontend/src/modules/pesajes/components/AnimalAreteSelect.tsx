import { useEffect, useMemo, useState } from "react";
import CreatableSelect from "react-select/creatable";
import type { GroupBase, StylesConfig } from "react-select";

import { useTheme } from "@/context/ThemeContext";
import { buscarAnimalesPesaje } from "../services";
import { AnimalDisponiblePesaje } from "../types";

export type AreteOption = {
  value: number;
  label: string;
  animal: AnimalDisponiblePesaje;
};

interface Props {
  value: AreteOption | null;
  excludedIds: number[];
  onChange: (option: AreteOption | null) => void;
  disabled?: boolean;
}

const toOption = (animal: AnimalDisponiblePesaje): AreteOption => ({
  value: animal.id,
  label: animal.arete ? `${animal.arete} · ${animal.codigo}` : animal.codigo,
  animal,
});

const getStyles = (isDark: boolean): StylesConfig<AreteOption, false, GroupBase<AreteOption>> => ({
  control: (base, state) => ({
    ...base,
    minHeight: 44,
    borderRadius: 8,
    backgroundColor: isDark ? "#101828" : "transparent",
    borderColor: state.isFocused ? "#465fff" : isDark ? "#344054" : "#d0d5dd",
    boxShadow: state.isFocused ? "0 0 0 3px rgba(70, 95, 255, 0.12)" : "none",
    "&:hover": {
      borderColor: state.isFocused ? "#465fff" : isDark ? "#475467" : "#98a2b3",
    },
  }),
  valueContainer: (base) => ({ ...base, padding: "0 12px" }),
  input: (base) => ({ ...base, color: isDark ? "#f2f4f7" : "#1d2939", margin: 0 }),
  singleValue: (base) => ({ ...base, color: isDark ? "#f2f4f7" : "#1d2939" }),
  placeholder: (base) => ({ ...base, color: isDark ? "#667085" : "#98a2b3" }),
  menu: (base) => ({
    ...base,
    zIndex: 50,
    backgroundColor: isDark ? "#101828" : "#ffffff",
    border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e4e7ec",
    borderRadius: 8,
    overflow: "hidden",
  }),
  menuList: (base) => ({ ...base, padding: 4 }),
  option: (base, state) => ({
    ...base,
    borderRadius: 6,
    backgroundColor: state.isFocused
      ? isDark
        ? "rgba(255,255,255,0.06)"
        : "#f2f4f7"
      : "transparent",
    color: isDark ? "#f2f4f7" : "#344054",
    cursor: "pointer",
  }),
  indicatorSeparator: () => ({ display: "none" }),
  dropdownIndicator: (base) => ({ ...base, color: isDark ? "#667085" : "#98a2b3" }),
  clearIndicator: (base) => ({ ...base, color: isDark ? "#667085" : "#98a2b3" }),
  noOptionsMessage: (base) => ({ ...base, color: isDark ? "#98a2b3" : "#667085" }),
  loadingMessage: (base) => ({ ...base, color: isDark ? "#98a2b3" : "#667085" }),
});

export default function AnimalAreteSelect({ value, excludedIds, onChange, disabled }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState<AreteOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const termino = inputValue.trim();
    if (termino.length < 1) {
      setOptions(value ? [value] : []);
      return;
    }

    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const data = await buscarAnimalesPesaje(termino);
        const mapped = data
          .filter((animal) => !excludedIds.includes(animal.id) || animal.id === value?.value)
          .map(toOption);
        setOptions(mapped);
      } catch (err) {
        console.error(err);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => window.clearTimeout(timer);
  }, [inputValue, excludedIds, value]);

  const styles = useMemo(() => getStyles(isDark), [isDark]);

  return (
    <CreatableSelect<AreteOption, false>
      isClearable
      isDisabled={disabled}
      isLoading={loading}
      options={options}
      value={value}
      inputValue={inputValue}
      placeholder="Buscar por arete"
      noOptionsMessage={() =>
        inputValue.trim() ? "No hay animales activos con ese arete." : "Escriba el código de arete"
      }
      loadingMessage={() => "Buscando..."}
      isValidNewOption={() => false}
      styles={styles}
      classNamePrefix="pesaje-arete"
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
          <span className="font-medium">{option.animal.arete || option.animal.codigo}</span>
          {option.animal.arete && option.animal.codigo ? (
            <span className="text-gray-500"> · {option.animal.codigo}</span>
          ) : null}
          <span className="mt-0.5 block text-xs text-gray-500">
            {option.animal.lote_nombre || "Sin potrero"}
            {option.animal.potrero_nombre ? ` · ${option.animal.potrero_nombre}` : ""}
          </span>
        </div>
      )}
    />
  );
}
