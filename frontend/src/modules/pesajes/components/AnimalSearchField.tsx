import { useEffect, useRef, useState } from "react";

import InputField from "@/components/form/input/InputField";
import { AnimalDisponibleVenta } from "@/modules/ventas/types";
import { buscarAnimalesPesaje } from "../services";

interface Props {
  excludedIds: number[];
  onSelect: (animal: AnimalDisponibleVenta) => void;
  disabled?: boolean;
}

export default function AnimalSearchField({ excludedIds, onSelect, disabled }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AnimalDisponibleVenta[]>([]);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (query.trim().length < 1) {
      setResults([]);
      setOpen(false);
      return;
    }

    const timer = window.setTimeout(async () => {
      try {
        const data = await buscarAnimalesPesaje(query.trim());
        setResults(data.filter((animal) => !excludedIds.includes(animal.id)));
        setOpen(true);
      } catch (err) {
        console.error(err);
        setResults([]);
      }
    }, 300);

    return () => window.clearTimeout(timer);
  }, [query, excludedIds]);

  return (
    <div className="relative" ref={wrapperRef}>
      <InputField
        type="text"
        placeholder="Código del animal"
        value={query}
        disabled={disabled}
        onChange={(e) => setQuery(e.target.value)}
      />
      {open && results.length > 0 && (
        <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-white/[0.08] dark:bg-gray-900">
          {results.map((animal) => (
            <li key={animal.id}>
              <button
                type="button"
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-white/[0.05]"
                onClick={() => {
                  onSelect(animal);
                  setQuery("");
                  setResults([]);
                  setOpen(false);
                }}
              >
                <span className="font-medium">{animal.codigo}</span>
                {animal.arete ? ` · ${animal.arete}` : ""}
                <span className="block text-xs text-gray-500">
                  {animal.lote_nombre || "Sin lote"}
                  {animal.potrero_nombre ? ` · ${animal.potrero_nombre}` : ""}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {open && query.trim().length >= 1 && results.length === 0 && (
        <p className="mt-1 text-xs text-gray-500">Sin coincidencias.</p>
      )}
    </div>
  );
}
