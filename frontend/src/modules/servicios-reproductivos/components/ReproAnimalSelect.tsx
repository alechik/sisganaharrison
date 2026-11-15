import { useEffect, useMemo, useState } from "react";
import CreatableSelect from "react-select/creatable";
import type { GroupBase, StylesConfig } from "react-select";

import { useTheme } from "@/context/ThemeContext";
import { buscarAnimalesRepro } from "../services";
import { AnimalDisponibleRepro } from "../types";
import { formatAnimalLabel } from "../utils";

export type ReproAnimalOption = {
  value: number;
  label: string;
  animal: AnimalDisponibleRepro;
};

interface Props {
  value: ReproAnimalOption | null;
  sexo: "H" | "M";
  excludedIds?: number[];
  onChange: (option: ReproAnimalOption | null) => void;
  disabled?: boolean;
  placeholder?: string;
}

const toOption = (animal: AnimalDisponibleRepro): ReproAnimalOption => ({
  value: animal.id,
  label: formatAnimalLabel(animal.codigo, animal.arete),
  animal,
});

const getStyles = (isDark: boolean): StylesConfig<ReproAnimalOption, false, GroupBase<ReproAnimalOption>> => ({
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
    backgroundColor: state.isFocused ? (isDark ? "rgba(255,255,255,0.06)" : "#f2f4f7") : "transparent",
    color: isDark ? "#f2f4f7" : "#344054",
    cursor: "pointer",
  }),
  indicatorSeparator: () => ({ display: "none" }),
  dropdownIndicator: (base) => ({ ...base, color: isDark ? "#667085" : "#98a2b3" }),
  clearIndicator: (base) => ({ ...base, color: isDark ? "#667085" : "#98a2b3" }),
  noOptionsMessage: (base) => ({ ...base, color: isDark ? "#98a2b3" : "#667085" }),
  loadingMessage: (base) => ({ ...base, color: isDark ? "#98a2b3" : "#667085" }),
});

export default function ReproAnimalSelect({
  value,
  sexo,
  excludedIds = [],
  onChange,
  disabled,
  placeholder,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState<ReproAnimalOption[]>([]);
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
        const data = await buscarAnimalesRepro(termino, sexo);
        setOptions(
          data
            .filter((animal) => !excludedIds.includes(animal.id) || animal.id === value?.value)
            .map(toOption)
        );
      } catch (err) {
        console.error(err);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => window.clearTimeout(timer);
  }, [inputValue, excludedIds, value, sexo]);

  const styles = useMemo(() => getStyles(isDark), [isDark]);

  return (
    <CreatableSelect<ReproAnimalOption, false>
      isClearable
      isDisabled={disabled}
      isLoading={loading}
      options={options}
      value={value}
      inputValue={inputValue}
      placeholder={placeholder ?? (sexo === "H" ? "Buscar hembra por arete" : "Buscar macho por arete")}
      noOptionsMessage={() =>
        inputValue.trim() ? "No hay animales activos con ese arete." : "Escriba el código de arete"
      }
      loadingMessage={() => "Buscando..."}
      isValidNewOption={() => false}
      styles={styles}
      classNamePrefix="repro-animal"
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
          {option.animal.lote_nombre ? (
            <span className="mt-0.5 block text-xs text-gray-500">{option.animal.lote_nombre}</span>
          ) : null}
        </div>
      )}
    />
  );
}

export { toOption as animalToOption };
