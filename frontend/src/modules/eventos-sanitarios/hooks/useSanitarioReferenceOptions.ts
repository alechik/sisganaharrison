import { useCallback, useEffect, useState } from "react";
import { getProductos } from "@/modules/productos/services";
import { getPresentaciones } from "@/modules/presentaciones/services";
import { getTiposEventosSanitarios } from "@/modules/tipos-eventos-sanitarios/services";
import { Producto } from "@/modules/productos/types";

export interface SelectOption {
  value: string;
  label: string;
}

export const useSanitarioReferenceOptions = () => {
  const [tipoEventoOptions, setTipoEventoOptions] = useState<SelectOption[]>([]);
  const [presentacionOptions, setPresentacionOptions] = useState<SelectOption[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOptions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [tipos, presentaciones, productosRes] = await Promise.all([
        getTiposEventosSanitarios({
          activo: true,
          per_page: 100,
          sort_by: "nombre",
          sort_dir: "asc",
        }),
        getPresentaciones({ per_page: 100, sort_by: "nombre", sort_dir: "asc" }),
        getProductos({
          activo: true,
          per_page: 100,
          sort_by: "nombre",
          sort_dir: "asc",
        }),
      ]);

      setTipoEventoOptions(
        tipos.data.map((tipo) => ({
          value: String(tipo.id),
          label: tipo.nombre,
        }))
      );
      setPresentacionOptions(
        presentaciones.data.map((item) => ({
          value: String(item.id),
          label: item.nombre,
        }))
      );
      setProductos(productosRes.data.filter((item) => item.activo));
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar las opciones de referencia.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  return {
    tipoEventoOptions,
    presentacionOptions,
    productos,
    loading,
    error,
    reload: loadOptions,
  };
};
