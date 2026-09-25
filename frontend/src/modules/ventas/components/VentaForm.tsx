import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import Button from "@/components/ui/button/Button";
import { getCategoriasAnimales } from "@/modules/categorias-animales/services";
import { getLotes } from "@/modules/lotes/services";
import { getPotreros } from "@/modules/potreros/services";
import { getSocios } from "@/modules/socios-de-negocio/services";
import { VENTA_ROUTES } from "../constants";
import { useCreateVenta, useUpdateVenta } from "../hooks";
import { getAnimalesDisponiblesVenta, getVenta } from "../services";
import { AnimalDisponibleVenta, VentaCreateRequest } from "../types";
import { formatMoney, formatPeso, isPendiente, lineSubtotal } from "../utils";

interface LineState {
  potrero_id: number | null;
  lote_id: number | null;
  categoria_id: number | null;
  animal_id: number | null;
  peso: number;
  precio: number;
  descuento: number;
}

interface Props {
  ventaId?: number;
}

const emptyLine = (): LineState => ({
  potrero_id: null,
  lote_id: null,
  categoria_id: null,
  animal_id: null,
  peso: 0,
  precio: 0,
  descuento: 0,
});

const today = () => new Date().toISOString().slice(0, 10);

export default function VentaForm({ ventaId }: Props) {
  const navigate = useNavigate();
  const isEdit = Boolean(ventaId);
  const { create, loading: creating, error: createError, setError: setCreateError } =
    useCreateVenta();
  const { update, loading: updating, error: updateError } = useUpdateVenta();

  const [clienteId, setClienteId] = useState<number | "">("");
  const [fechaVenta, setFechaVenta] = useState(today());
  const [descuento, setDescuento] = useState(0);
  const [lines, setLines] = useState<LineState[]>([emptyLine()]);
  const [clientes, setClientes] = useState<{ value: string; label: string }[]>([]);
  const [potreros, setPotreros] = useState<{ value: string; label: string }[]>([]);
  const [categorias, setCategorias] = useState<{ value: string; label: string }[]>([]);
  const [lotesByPotrero, setLotesByPotrero] = useState<Record<number, { value: string; label: string }[]>>({});
  const [animales, setAnimales] = useState<AnimalDisponibleVenta[]>([]);
  const [loadingEdit, setLoadingEdit] = useState(isEdit);

  useEffect(() => {
    const load = async () => {
      try {
        const [socios, potreroRes, categoriaRes] = await Promise.all([
          getSocios({ tiene_tipo: "CLIENTE", per_page: 100, page: 1 }),
          getPotreros({ activo: true, per_page: 100, page: 1 }),
          getCategoriasAnimales({ activo: true, per_page: 100, page: 1 }),
        ]);
        setClientes(socios.data.map((item) => ({ value: String(item.id), label: item.razon_social })));
        setPotreros(potreroRes.data.map((item) => ({ value: String(item.id), label: item.nombre })));
        setCategorias(
          categoriaRes.data.map((item) => ({
            value: String(item.id),
            label: `${item.codigo} — ${item.nombre}`,
          }))
        );
      } catch (err) {
        console.error(err);
        setCreateError("No se pudieron cargar los catálogos de la venta.");
      }
    };

    load();
  }, [setCreateError]);

  useEffect(() => {
    if (!ventaId) {
      return;
    }

    const loadVenta = async () => {
      try {
        setLoadingEdit(true);
        const venta = await getVenta(ventaId);
        if (!isPendiente(venta.estado)) {
          setCreateError("Solo una venta pendiente puede editarse.");
          navigate(VENTA_ROUTES.detail(ventaId));
          return;
        }
        setClienteId(venta.cliente_id);
        setFechaVenta(venta.fecha_venta);
        setDescuento(venta.descuento ?? 0);
        setLines(
          (venta.detalles ?? []).map((detalle) => ({
            potrero_id: null,
            lote_id: detalle.lote_id ?? null,
            categoria_id: null,
            animal_id: detalle.animal_id,
            peso: detalle.peso,
            precio: detalle.precio,
            descuento: detalle.descuento,
          }))
        );
        const disponibles = await getAnimalesDisponiblesVenta({ venta_id: ventaId });
        setAnimales(disponibles);
        setLines((current) =>
          current.map((line) => {
            const animal = disponibles.find((item) => item.id === line.animal_id);
            return {
              ...line,
              potrero_id: animal?.potrero_id ?? line.potrero_id,
              lote_id: animal?.lote_id ?? line.lote_id,
              categoria_id: animal?.categoria_id ?? line.categoria_id,
            };
          })
        );
        for (const animal of disponibles) {
          if (animal.potrero_id) {
            await loadLotes(animal.potrero_id);
          }
        }
      } catch (err) {
        console.error(err);
        setCreateError("No se pudo cargar la venta.");
      } finally {
        setLoadingEdit(false);
      }
    };

    loadVenta();
  }, [ventaId, navigate, setCreateError]);

  const loadLotes = async (potreroId: number) => {
    if (lotesByPotrero[potreroId]) {
      return;
    }
    const response = await getLotes({ potrero_id: potreroId, activo: true, per_page: 100, page: 1 });
    setLotesByPotrero((current) => ({
      ...current,
      [potreroId]: response.data.map((item) => ({
        value: String(item.id),
        label: item.nombre,
      })),
    }));
  };

  const loadAnimales = async (potreroId?: number | null) => {
    if (!potreroId) {
      return;
    }
    const data = await getAnimalesDisponiblesVenta({
      potrero_id: potreroId,
      venta_id: ventaId,
    });
    setAnimales((current) => {
      const others = current.filter((animal) => animal.potrero_id !== potreroId);
      return [...others, ...data];
    });
  };

  const selectedAnimalIds = useMemo(
    () => lines.map((line) => line.animal_id).filter((id): id is number => Boolean(id)),
    [lines]
  );

  const updateLine = (index: number, patch: Partial<LineState>) => {
    setLines((current) => current.map((line, i) => (i === index ? { ...line, ...patch } : line)));
  };

  const handlePotreroChange = async (index: number, value: string) => {
    const potreroId = value ? Number(value) : null;
    updateLine(index, {
      potrero_id: potreroId,
      lote_id: null,
      animal_id: null,
    });
    if (potreroId) {
      await loadLotes(potreroId);
      await loadAnimales(potreroId);
    }
  };

  const handleLoteChange = (index: number, value: string) => {
    const loteId = value ? Number(value) : null;
    updateLine(index, { lote_id: loteId, animal_id: null });
  };

  const handleCategoriaChange = (index: number, value: string) => {
    const categoriaId = value ? Number(value) : null;
    updateLine(index, { categoria_id: categoriaId, animal_id: null });
  };

  const handleAnimalChange = (index: number, value: string) => {
    const animalId = value ? Number(value) : null;
    const animal = animales.find((item) => item.id === animalId);
    updateLine(index, {
      animal_id: animalId,
      lote_id: animal?.lote_id ?? lines[index].lote_id,
      peso: animal?.peso ?? 0,
      precio:
        animal?.precio_kilo && animal.peso
          ? Math.round(animal.precio_kilo * animal.peso * 100) / 100
          : 0,
    });
  };

  const sumaLineas = lines.reduce((acc, line) => acc + lineSubtotal(line.precio, line.descuento), 0);
  const totalPeso = lines.reduce((acc, line) => acc + (Number(line.peso) || 0), 0);
  const montoTotal = Math.max(sumaLineas - (Number(descuento) || 0), 0);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!clienteId) {
      setCreateError("Debe seleccionar un cliente.");
      return;
    }
    if (lines.some((line) => !line.animal_id || line.peso <= 0)) {
      setCreateError("Cada línea debe tener un animal y un peso mayor a cero.");
      return;
    }

    const payload: VentaCreateRequest = {
      cliente_id: Number(clienteId),
      fecha_venta: fechaVenta,
      descuento: Number(descuento) || 0,
      detalles: lines.map((line) => ({
        animal_id: Number(line.animal_id),
        peso: Number(line.peso),
        precio: Number(line.precio) || 0,
        descuento: Number(line.descuento) || 0,
      })),
    };

    try {
      const response = isEdit && ventaId ? await update(ventaId, payload) : await create(payload);
      navigate(VENTA_ROUTES.detail(response.data.id));
    } catch {
      // handled
    }
  };

  if (loadingEdit) {
    return <div>Cargando venta...</div>;
  }

  const error = createError || updateError;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <Label>Cliente *</Label>
          <Select
            value={clienteId ? String(clienteId) : ""}
            placeholder="Seleccione un cliente"
            options={clientes}
            onChange={(value) => setClienteId(value ? Number(value) : "")}
          />
        </div>
        <div>
          <Label>Fecha de venta *</Label>
          <InputField type="date" value={fechaVenta} onChange={(e) => setFechaVenta(e.target.value)} />
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

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 dark:text-white">Detalle de animales</h3>
          <Button type="button" size="sm" variant="outline" onClick={() => setLines((current) => [...current, emptyLine()])}>
            + Animal
          </Button>
        </div>
        <p className="text-sm text-gray-500">
          Seleccione potrero, lote y categoría para listar únicamente animales ACTIVO disponibles para venta.
        </p>

        {lines.map((line, index) => {
          const loteOptions = line.potrero_id ? lotesByPotrero[line.potrero_id] ?? [] : [];
          const animalOptions = animales
            .filter((animal) => {
              if (line.potrero_id && animal.potrero_id !== line.potrero_id) {
                return false;
              }
              if (line.lote_id && animal.lote_id !== line.lote_id) {
                return false;
              }
              if (line.categoria_id && animal.categoria_id !== line.categoria_id) {
                return false;
              }
              if (animal.id !== line.animal_id && selectedAnimalIds.includes(animal.id)) {
                return false;
              }
              return true;
            })
            .map((animal) => ({
              value: String(animal.id),
              label: `${animal.codigo}${animal.arete ? ` · ${animal.arete}` : ""} · ${animal.lote_nombre ?? "Sin lote"}`,
            }));

          return (
            <div
              key={index}
              className="grid grid-cols-1 gap-3 rounded-xl border border-gray-200 p-4 dark:border-white/[0.05] md:grid-cols-4"
            >
              <div>
                <Label>Potrero *</Label>
                <Select
                  value={line.potrero_id ? String(line.potrero_id) : ""}
                  placeholder="Potrero"
                  options={potreros}
                  onChange={(value) => handlePotreroChange(index, value)}
                />
              </div>
              <div>
                <Label>Lote</Label>
                <Select
                  value={line.lote_id ? String(line.lote_id) : ""}
                  placeholder="Todos los lotes"
                  options={[{ value: "", label: "Todos los lotes" }, ...loteOptions]}
                  onChange={(value) => handleLoteChange(index, value)}
                />
              </div>
              <div>
                <Label>Categoría</Label>
                <Select
                  value={line.categoria_id ? String(line.categoria_id) : ""}
                  placeholder="Todas"
                  options={[{ value: "", label: "Todas" }, ...categorias]}
                  onChange={(value) => handleCategoriaChange(index, value)}
                />
              </div>
              <div>
                <Label>Animal *</Label>
                <Select
                  value={line.animal_id ? String(line.animal_id) : ""}
                  placeholder={line.potrero_id ? "Seleccione animal" : "Elija un potrero"}
                  options={animalOptions}
                  onChange={(value) => handleAnimalChange(index, value)}
                />
              </div>
              <div>
                <Label>Peso (kg) *</Label>
                <InputField
                  type="number"
                  min="0.01"
                  step={0.01}
                  value={String(line.peso)}
                  onChange={(e) => updateLine(index, { peso: Number(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Precio</Label>
                <InputField
                  type="number"
                  min="0"
                  value={String(line.precio)}
                  onChange={(e) => updateLine(index, { precio: Number(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Descuento</Label>
                <InputField
                  type="number"
                  min="0"
                  value={String(line.descuento)}
                  onChange={(e) => updateLine(index, { descuento: Number(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Subtotal</Label>
                <InputField type="text" value={formatMoney(lineSubtotal(line.precio, line.descuento))} disabled />
              </div>
              {lines.length > 1 && (
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
          );
        })}
      </div>

      <div className="space-y-1 text-sm">
        <p>Total peso: {formatPeso(totalPeso)}</p>
        <p>Suma de subtotales: {formatMoney(sumaLineas)}</p>
        <p>Descuento general: {formatMoney(descuento)}</p>
        <p className="font-semibold">Monto total: {formatMoney(montoTotal)}</p>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={creating || updating}>
          {isEdit ? "Guardar cambios" : "Registrar venta"}
        </Button>
        <Button type="button" variant="outline" onClick={() => navigate(VENTA_ROUTES.list)}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
