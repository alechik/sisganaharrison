import { useEffect, useMemo, useState } from "react";
import CreatableSelect from "react-select/creatable";

import { useTheme } from "@/context/ThemeContext";
import { buscarProveedoresIngreso } from "../services";
import { ProveedorDisponibleIngreso } from "../types";
import { creatableSelectStyles } from "./creatableSelectStyles";

export type ProveedorOption = {
  value: number;
  label: string;
  proveedor: ProveedorDisponibleIngreso;
};

interface Props {
  value: ProveedorOption | null;
  onChange: (option: ProveedorOption | null) => void;
  disabled?: boolean;
}

const toOption = (proveedor: ProveedorDisponibleIngreso): ProveedorOption => ({
  value: proveedor.id,
  label: `${proveedor.codigo} · ${proveedor.razon_social}`,
  proveedor,
});

export default function ProveedorSelect({ value, onChange, disabled }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState<ProveedorOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const data = await buscarProveedoresIngreso(inputValue.trim());
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

  const styles = useMemo(() => creatableSelectStyles<ProveedorOption>(isDark), [isDark]);

  return (
    <CreatableSelect<ProveedorOption, false>
      isClearable
      isDisabled={disabled}
      isLoading={loading}
      options={options}
      value={value}
      inputValue={inputValue}
      placeholder="Buscar por código o nombre"
      noOptionsMessage={() =>
        inputValue.trim() ? "No se encontraron proveedores." : "Escriba el código o el nombre"
      }
      loadingMessage={() => "Buscando..."}
      isValidNewOption={() => false}
      styles={styles}
      classNamePrefix="ingreso-proveedor"
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
          <span className="font-medium">{option.proveedor.razon_social}</span>
          <span className="mt-0.5 block text-xs text-gray-500">
            {option.proveedor.nit ? `NIT ${option.proveedor.nit}` : `Código ${option.proveedor.codigo}`}
          </span>
        </div>
      )}
    />
  );
}
