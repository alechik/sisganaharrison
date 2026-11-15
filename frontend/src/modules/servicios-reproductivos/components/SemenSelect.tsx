import { useEffect, useMemo, useState } from "react";
import CreatableSelect from "react-select/creatable";
import type { GroupBase, StylesConfig } from "react-select";

import { useTheme } from "@/context/ThemeContext";
import { buscarSemen } from "../services";
import { SemenOption } from "../types";

export type SemenSelectOption = {
  value: number;
  label: string;
  semen: SemenOption;
};

interface Props {
  value: SemenSelectOption | null;
  onChange: (option: SemenSelectOption | null) => void;
  disabled?: boolean;
}

const toOption = (semen: SemenOption): SemenSelectOption => ({
  value: semen.id,
  label: `${semen.codigo} — ${semen.nombre}`,
  semen,
});

const getStyles = (isDark: boolean): StylesConfig<SemenSelectOption, false, GroupBase<SemenSelectOption>> => ({
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

export default function SemenSelect({ value, onChange, disabled }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState<SemenSelectOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const data = await buscarSemen(inputValue.trim());
        setOptions(data.map(toOption));
      } catch (err) {
        console.error(err);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => window.clearTimeout(timer);
  }, [inputValue]);

  const styles = useMemo(() => getStyles(isDark), [isDark]);

  return (
    <CreatableSelect<SemenSelectOption, false>
      isClearable
      isDisabled={disabled}
      isLoading={loading}
      options={options}
      value={value}
      inputValue={inputValue}
      placeholder="Buscar semen en el catálogo"
      noOptionsMessage={() =>
        inputValue.trim() ? "No hay semen con ese nombre o código." : "Escriba para buscar semen"
      }
      loadingMessage={() => "Buscando..."}
      isValidNewOption={() => false}
      styles={styles}
      classNamePrefix="repro-semen"
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
    />
  );
}

export { toOption as semenToOption };
