import { useEffect, useMemo, useState } from "react";
import CreatableSelect from "react-select/creatable";

import { useTheme } from "@/context/ThemeContext";
import { buscarProductosIngreso } from "../services";
import { ProductoDisponibleIngreso } from "../types";
import { creatableSelectStyles } from "./creatableSelectStyles";

export type ProductoOption = {
  value: number;
  label: string;
  producto: ProductoDisponibleIngreso;
};

interface Props {
  value: ProductoOption | null;
  excludedIds: number[];
  onChange: (option: ProductoOption | null) => void;
  disabled?: boolean;
}

const toOption = (producto: ProductoDisponibleIngreso): ProductoOption => ({
  value: producto.id,
  label: `${producto.codigo} · ${producto.nombre}`,
  producto,
});

export default function ProductoSelect({ value, excludedIds, onChange, disabled }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState<ProductoOption[]>([]);
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
        const data = await buscarProductosIngreso(termino);
        setOptions(
          data
            .filter((producto) => !excludedIds.includes(producto.id) || producto.id === value?.value)
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
  }, [inputValue, excludedIds, value]);

  const styles = useMemo(() => creatableSelectStyles<ProductoOption>(isDark), [isDark]);

  return (
    <CreatableSelect<ProductoOption, false>
      isClearable
      isDisabled={disabled}
      isLoading={loading}
      options={options}
      value={value}
      inputValue={inputValue}
      placeholder="Buscar por código o nombre"
      noOptionsMessage={() =>
        inputValue.trim() ? "No se encontraron productos." : "Escriba el código o el nombre"
      }
      loadingMessage={() => "Buscando..."}
      isValidNewOption={() => false}
      styles={styles}
      classNamePrefix="ingreso-producto"
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
          <span className="font-medium">{option.producto.codigo}</span>
          <span className="text-gray-500"> · {option.producto.nombre}</span>
          {option.producto.presentacion_descripcion ? (
            <span className="mt-0.5 block text-xs text-gray-500">
              {option.producto.presentacion_descripcion}
            </span>
          ) : null}
        </div>
      )}
    />
  );
}
