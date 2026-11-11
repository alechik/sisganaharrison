import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";

import { ChevronDownIcon, CloseLineIcon } from "@/icons";
import { getSocios } from "@/modules/socios-de-negocio/services";
import { Socio } from "@/modules/socios-de-negocio/types";

interface Props {
  value: string;
  onChange: (id: string) => void;
  required?: boolean;
  placeholder?: string;
}

const formatPersona = (persona: Socio): string => {
  const nit = persona.nit ? ` · NIT ${persona.nit}` : "";
  return `${persona.razon_social}${nit}`;
};

export default function ProveedorSearchSelect({
  value,
  onChange,
  required = false,
  placeholder = "Buscar por nombre",
}: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [personas, setPersonas] = useState<Socio[]>([]);
  const [selected, setSelected] = useState<Socio | null>(null);
  const [highlight, setHighlight] = useState(0);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const termino = query.trim();
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await getSocios(
          {
            search: termino || undefined,
            estado: true,
            per_page: 20,
            page: 1,
            sort_by: "razon_social",
            sort_dir: "asc",
          },
          controller.signal
        );
        setPersonas(response.data);
        setHighlight(0);
      } catch (err) {
        if ((err as { code?: string }).code === "ERR_CANCELED") {
          return;
        }
        console.error(err);
        setPersonas([]);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 250);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [open, query]);

  useEffect(() => {
    if (!value) {
      setSelected(null);
      return;
    }

    if (selected && String(selected.id) === value) {
      return;
    }

    const found = personas.find((persona) => String(persona.id) === value);
    if (found) {
      setSelected(found);
    }
  }, [value, personas, selected]);

  useEffect(() => {
    const active = listRef.current?.querySelector<HTMLElement>("[data-active='true']");
    active?.scrollIntoView({ block: "nearest" });
  }, [highlight, open]);

  const items = useMemo(() => {
    const termino = query.trim().toLowerCase();
    const visible = [...personas];

    if (
      selected &&
      !visible.some((persona) => persona.id === selected.id) &&
      (!termino || selected.razon_social.toLowerCase().includes(termino))
    ) {
      visible.unshift(selected);
    }

    const options = visible.map((persona) => ({
      id: String(persona.id),
      label: formatPersona(persona),
      persona,
    }));

    if (!required) {
      return [{ id: "", label: "Sin persona relacionada", persona: null }, ...options];
    }

    return options;
  }, [personas, required, selected, query]);

  const displayValue = open ? query : selected ? formatPersona(selected) : "";
  const inputPlaceholder = open && selected ? formatPersona(selected) : placeholder;

  const selectItem = (id: string, persona: Socio | null) => {
    setSelected(persona);
    onChange(id);
    setQuery("");
    setOpen(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!open && (event.key === "ArrowDown" || event.key === "Enter")) {
      event.preventDefault();
      setOpen(true);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      setQuery("");
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlight((current) => Math.min(current + 1, Math.max(items.length - 1, 0)));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlight((current) => Math.max(current - 1, 0));
      return;
    }

    if (event.key === "Enter" && open) {
      event.preventDefault();
      if (items[highlight]) {
        const item = items[highlight];
        selectItem(item.id, item.persona);
      }
    }
  };

  const showEmpty = !loading && personas.length === 0 && query.trim() !== "";

  return (
    <div className="relative overflow-visible" ref={wrapperRef}>
      <div
        className={`flex h-11 w-full items-center rounded-lg border bg-transparent shadow-theme-xs transition dark:bg-gray-900 ${
          open
            ? "border-brand-300 ring-3 ring-brand-500/10 dark:border-brand-800"
            : "border-gray-300 dark:border-gray-700"
        }`}
      >
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          aria-controls="proveedor-search-list"
          value={displayValue}
          placeholder={inputPlaceholder}
          autoComplete="off"
          className="h-11 w-full bg-transparent px-4 py-2.5 text-sm text-gray-800 outline-none placeholder:text-gray-400 dark:text-white/90 dark:placeholder:text-white/30"
          onFocus={() => {
            setOpen(true);
            setQuery("");
          }}
          onChange={(event) => {
            setQuery(event.target.value);
            if (!open) {
              setOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
        />
        {value && !required && !open && (
          <button
            type="button"
            className="mr-1 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/[0.06] dark:hover:text-gray-200"
            title="Quitar selección"
            onClick={() => selectItem("", null)}
          >
            <CloseLineIcon className="size-4" />
          </button>
        )}
        <button
          type="button"
          className="mr-2 text-gray-400"
          aria-label={open ? "Cerrar listado" : "Abrir listado"}
          onClick={() => {
            setOpen((current) => !current);
            window.setTimeout(() => inputRef.current?.focus(), 0);
          }}
        >
          <ChevronDownIcon className={`size-5 transition ${open ? "rotate-180" : ""}`} />
        </button>
      </div>

      {open && (
        <ul
          ref={listRef}
          id="proveedor-search-list"
          role="listbox"
          className="absolute z-50 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-white/[0.08] dark:bg-gray-900"
        >
          {loading && items.length === 0 && (
            <li className="px-3 py-2.5 text-sm text-gray-500 dark:text-gray-400">Buscando...</li>
          )}
          {showEmpty && (
            <li className="px-3 py-2.5 text-sm text-gray-500 dark:text-gray-400">
              No se encontraron coincidencias.
            </li>
          )}
          {items.map((item, index) => (
            <li key={item.id || "empty"} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={index === highlight}
                data-active={index === highlight ? "true" : "false"}
                className={`w-full px-3 py-2.5 text-left text-sm ${
                  index === highlight
                    ? "bg-brand-50 text-gray-900 dark:bg-white/[0.06] dark:text-white"
                    : "text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-white/[0.04]"
                } ${value === item.id ? "font-semibold" : ""}`}
                onMouseEnter={() => setHighlight(index)}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectItem(item.id, item.persona)}
              >
                <span className="block font-medium">{item.persona?.razon_social ?? item.label}</span>
                {item.persona?.nit && (
                  <span className="block text-xs font-normal text-gray-500 dark:text-gray-400">
                    NIT {item.persona.nit}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
