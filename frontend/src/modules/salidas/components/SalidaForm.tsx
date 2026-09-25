import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import Button from "@/components/ui/button/Button";
import { getSocios } from "@/modules/socios-de-negocio/services";
import { getTiposSalidas } from "@/modules/tipos-salidas/services";
import { TipoSalida } from "@/modules/tipos-salidas/types";
import { getVenta } from "@/modules/ventas/services";
import { AnimalDisponibleVenta } from "@/modules/ventas/types";
import { SALIDA_ROUTES } from "../constants";
import { useCreateSalida } from "../hooks";
import { getVentasDisponiblesSalida } from "../services";
import { SalidaCreateRequest, VentaDisponibleSalida } from "../types";
import { formatMoney, formatPeso, isTipoVenta, lineSubtotal } from "../utils";
import AnimalSearchField from "./AnimalSearchField";

interface LineState {
  animal_id: number | null;
  animal_codigo: string;
  animal_arete: string;
  lote_nombre: string;
  potrero_nombre: string;
  peso: number;
  precio: number;
  descuento: number;
}

const emptyLine = (): LineState => ({
  animal_id: null,
  animal_codigo: "",
  animal_arete: "",
  lote_nombre: "",
  potrero_nombre: "",
  peso: 0,
  precio: 0,
  descuento: 0,
});

const today = () => new Date().toISOString().slice(0, 10);

export default function SalidaForm() {
  const navigate = useNavigate();
  const { create, loading, error, setError } = useCreateSalida();

  const [tipos, setTipos] = useState<TipoSalida[]>([]);
  const [tipoId, setTipoId] = useState<number | "">("");
  const [fechaSalida, setFechaSalida] = useState(today());
  const [clienteId, setClienteId] = useState<number | "">("");
  const [clientes, setClientes] = useState<{ value: string; label: string }[]>([]);
  const [ventaId, setVentaId] = useState<number | "">("");
  const [ventas, setVentas] = useState<VentaDisponibleSalida[]>([]);
  const [descuento, setDescuento] = useState(0);
  const [lines, setLines] = useState<LineState[]>([emptyLine()]);
  const [loadingVenta, setLoadingVenta] = useState(false);

  const tipoSeleccionado = tipos.find((item) => item.id === tipoId);
  const esVenta = isTipoVenta(tipoSeleccionado?.nombre);

  useEffect(() => {
    const load = async () => {
      try {
        const [tiposRes, socios] = await Promise.all([
          getTiposSalidas({ per_page: 100, page: 1, sort_by: "nombre", sort_dir: "asc" }),
          getSocios({ tiene_tipo: "CLIENTE", per_page: 100, page: 1 }),
        ]);
        setTipos(tiposRes.data);
        setClientes(socios.data.map((item) => ({ value: String(item.id), label: item.razon_social })));
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los catálogos de la salida.");
      }
    };

    load();
  }, [setError]);

  useEffect(() => {
    if (!esVenta) {
      return;
    }
    const loadVentas = async () => {
      try {
        setVentas(await getVentasDisponiblesSalida());
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar las ventas autorizadas.");
      }
    };
    loadVentas();
  }, [esVenta, setError]);

  const handleTipoChange = (value: string) => {
    const nextId = value ? Number(value) : "";
    setTipoId(nextId);
    setVentaId("");
    setClienteId("");
    setDescuento(0);
    setLines([emptyLine()]);
  };

  const handleTraerInformacion = async () => {
    if (!ventaId) {
      setError("Debe seleccionar una venta.");
      return;
    }
    try {
      setLoadingVenta(true);
      setError(null);
      const venta = await getVenta(Number(ventaId));
      setClienteId(venta.cliente_id);
      setDescuento(venta.descuento ?? 0);
      setLines(
        (venta.detalles ?? []).map((detalle) => ({
          animal_id: detalle.animal_id,
          animal_codigo: detalle.animal_codigo ?? "",
          animal_arete: detalle.animal_arete ?? "",
          lote_nombre: detalle.lote_nombre ?? "",
          potrero_nombre: detalle.potrero_nombre ?? "",
          peso: detalle.peso,
          precio: detalle.precio,
          descuento: detalle.descuento,
        }))
      );
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar la información de la venta.");
    } finally {
      setLoadingVenta(false);
    }
  };

  const selectedIds = useMemo(
    () => lines.map((line) => line.animal_id).filter((id): id is number => Boolean(id)),
    [lines]
  );

  const applyAnimal = (index: number, animal: AnimalDisponibleVenta) => {
    setLines((current) =>
      current.map((line, i) =>
        i === index
          ? {
              ...line,
              animal_id: animal.id,
              animal_codigo: animal.codigo,
              animal_arete: animal.arete ?? "",
              lote_nombre: animal.lote_nombre ?? "",
              potrero_nombre: animal.potrero_nombre ?? "",
              peso: animal.peso ?? line.peso,
              precio:
                animal.precio_kilo && animal.peso
                  ? Math.round(animal.precio_kilo * animal.peso * 100) / 100
                  : line.precio,
            }
          : line
      )
    );
  };

  const sumaLineas = lines.reduce((acc, line) => acc + lineSubtotal(line.precio, line.descuento), 0);
  const totalPeso = lines.reduce((acc, line) => acc + (Number(line.peso) || 0), 0);
  const montoTotal = Math.max(sumaLineas - (Number(descuento) || 0), 0);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!tipoId) {
      setError("Debe seleccionar un tipo de salida.");
      return;
    }
    if (esVenta && !ventaId) {
      setError("Debe seleccionar una venta.");
      return;
    }
    if (lines.some((line) => !line.animal_id || line.peso <= 0)) {
      setError("Cada línea debe tener un animal y un peso mayor a cero.");
      return;
    }

    const payload: SalidaCreateRequest = {
      tipo_salida_id: Number(tipoId),
      fecha_salida: fechaSalida,
      cliente_id: clienteId ? Number(clienteId) : null,
      venta_id: esVenta ? Number(ventaId) : null,
      descuento: Number(descuento) || 0,
      detalles: lines.map((line) => ({
        animal_id: Number(line.animal_id),
        peso: Number(line.peso),
        precio: Number(line.precio) || 0,
        descuento: Number(line.descuento) || 0,
      })),
    };

    try {
      const response = await create(payload);
      navigate(SALIDA_ROUTES.detail(response.data.id));
    } catch {
      // handled
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <Label>Tipo de salida *</Label>
          <Select
            value={tipoId ? String(tipoId) : ""}
            placeholder="Seleccione tipo"
            options={tipos.map((tipo) => ({ value: String(tipo.id), label: tipo.nombre }))}
            onChange={handleTipoChange}
          />
        </div>
        <div>
          <Label>Fecha de salida *</Label>
          <InputField type="date" value={fechaSalida} onChange={(e) => setFechaSalida(e.target.value)} />
        </div>
        <div>
          <Label>Descuento general</Label>
          <InputField
            type="number"
            min="0"
            value={String(descuento)}
            onChange={(e) => setDescuento(Number(e.target.value) || 0)}
          />
        </div>
      </div>

      {esVenta && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label>Venta *</Label>
            <Select
              value={ventaId ? String(ventaId) : ""}
              placeholder="Seleccione una venta autorizada"
              options={ventas.map((venta) => ({
                value: String(venta.id),
                label: `${venta.cod_venta} · ${venta.cliente_razon_social ?? "Sin cliente"} · ${venta.fecha_venta}`,
              }))}
              onChange={(value) => setVentaId(value ? Number(value) : "")}
            />
          </div>
          <div className="flex items-end">
            <Button type="button" variant="outline" disabled={!ventaId || loadingVenta} onClick={handleTraerInformacion}>
              {loadingVenta ? "Cargando..." : "Traer información"}
            </Button>
          </div>
        </div>
      )}

      {!esVenta && (
        <div className="max-w-md">
          <Label>Cliente</Label>
          <Select
            value={clienteId ? String(clienteId) : ""}
            placeholder="Opcional"
            options={[{ value: "", label: "Sin cliente" }, ...clientes]}
            onChange={(value) => setClienteId(value ? Number(value) : "")}
          />
        </div>
      )}

      {esVenta && clienteId && (
        <p className="text-sm text-gray-500">
          Cliente de la venta: {clientes.find((item) => item.value === String(clienteId))?.label ?? "—"}
        </p>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 dark:text-white">Detalle de animales</h3>
          {!esVenta && (
            <Button type="button" size="sm" variant="outline" onClick={() => setLines((current) => [...current, emptyLine()])}>
              + Animal
            </Button>
          )}
        </div>

        {lines.map((line, index) => (
          <div
            key={index}
            className="grid grid-cols-1 gap-3 rounded-xl border border-gray-200 p-4 dark:border-white/[0.05] md:grid-cols-4"
          >
            <div>
              <Label>{esVenta ? "Animal" : "Código / Arete *"}</Label>
              {esVenta ? (
                <InputField
                  type="text"
                  value={`${line.animal_codigo}${line.animal_arete ? ` · ${line.animal_arete}` : ""}`}
                  disabled
                />
              ) : (
                <AnimalSearchField
                  excludedIds={selectedIds.filter((id) => id !== line.animal_id)}
                  onSelect={(animal) => applyAnimal(index, animal)}
                />
              )}
              {!esVenta && line.animal_codigo && (
                <p className="mt-1 text-xs text-gray-500">
                  {line.animal_codigo}
                  {line.animal_arete ? ` · ${line.animal_arete}` : ""}
                </p>
              )}
            </div>
            <div>
              <Label>Potrero / Lote</Label>
              <InputField
                type="text"
                value={`${line.potrero_nombre || "—"} / ${line.lote_nombre || "—"}`}
                disabled
              />
            </div>
            <div>
              <Label>Peso (kg) *</Label>
              <InputField
                type="number"
                min="0.01"
                step={0.01}
                value={String(line.peso)}
                onChange={(e) =>
                  setLines((current) =>
                    current.map((item, i) => (i === index ? { ...item, peso: Number(e.target.value) || 0 } : item))
                  )
                }
              />
            </div>
            <div>
              <Label>Precio</Label>
              <InputField
                type="number"
                min="0"
                value={String(line.precio)}
                onChange={(e) =>
                  setLines((current) =>
                    current.map((item, i) => (i === index ? { ...item, precio: Number(e.target.value) || 0 } : item))
                  )
                }
              />
            </div>
            <div>
              <Label>Descuento</Label>
              <InputField
                type="number"
                min="0"
                value={String(line.descuento)}
                onChange={(e) =>
                  setLines((current) =>
                    current.map((item, i) =>
                      i === index ? { ...item, descuento: Number(e.target.value) || 0 } : item
                    )
                  )
                }
              />
            </div>
            <div>
              <Label>Subtotal</Label>
              <InputField type="text" value={formatMoney(lineSubtotal(line.precio, line.descuento))} disabled />
            </div>
            {!esVenta && lines.length > 1 && (
              <div className="md:col-span-4">
                <button
                  type="button"
                  className="text-sm text-red-600"
                  onClick={() => setLines((current) => current.filter((_, i) => i !== index))}
                >
                  Quitar animal
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="space-y-1 text-sm">
        <p>Total peso: {formatPeso(totalPeso)}</p>
        <p>Suma de subtotales: {formatMoney(sumaLineas)}</p>
        <p className="font-semibold">Monto total: {formatMoney(montoTotal)}</p>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Guardando..." : "Registrar salida"}
        </Button>
        <Button type="button" variant="outline" onClick={() => navigate(SALIDA_ROUTES.list)}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
