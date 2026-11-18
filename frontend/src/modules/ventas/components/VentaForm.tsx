import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import RegistradoPorField from "@/components/form/RegistradoPorField";
import Select from "@/components/form/Select";
import Button from "@/components/ui/button/Button";
import { getCategoriasAnimales } from "@/modules/categorias-animales/services";
import { getPotreros } from "@/modules/potreros/services";
import { getParcelas } from "@/modules/parcelas/services";
import { getSocios } from "@/modules/socios-de-negocio/services";
import { VENTA_ROUTES } from "../constants";
import { useCreateVenta, useUpdateVenta } from "../hooks";
import { getAnimalesDisponiblesVenta, getVenta } from "../services";
import { AnimalDisponibleVenta, VentaCreateRequest } from "../types";
import { formatMoney, formatPeso, isPendiente, lineSubtotal } from "../utils";

interface LineState {
  parcela_id: number | null;
  potrero_id: number | null;
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
  parcela_id: null,
  potrero_id: null,
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
  const [parcelas, setParcelas] = useState<{ value: string; label: string }[]>([]);
  const [categorias, setCategorias] = useState<{ value: string; label: string }[]>([]);
  const [parcelasByParcela, setPotrerosByParcela] = useState<Record<number, { value: string; label: string }[]>>({});
  const [animales, setAnimales] = useState<AnimalDisponibleVenta[]>([]);
  const [loadingEdit, setLoadingEdit] = useState(isEdit);
  const [registradoPorNombre, setRegistradoPorNombre] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [socios, parcelaRes, categoriaRes] = await Promise.all([
          getSocios({ tiene_tipo: "CLIENTE", per_page: 100, page: 1 }),
          getParcelas({ activo: true, per_page: 100, page: 1 }),
          getCategoriasAnimales({ activo: true, per_page: 100, page: 1 }),
        ]);
        setClientes(socios.data.map((item) => ({ value: String(item.id), label: item.razon_social })));
        setParcelas(parcelaRes.data.map((item) => ({ value: String(item.id), label: item.nombre })));
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
        setRegistradoPorNombre(venta.creador_nombre ?? null);
        setClienteId(venta.cliente_id);
        setFechaVenta(venta.fecha_venta);
        setDescuento(venta.descuento ?? 0);
        setLines(
          (venta.detalles ?? []).map((detalle) => ({
            parcela_id: null,
            potrero_id: detalle.potrero_id ?? null,
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
              parcela_id: animal?.parcela_id ?? line.parcela_id,
              potrero_id: animal?.potrero_id ?? line.potrero_id,
              categoria_id: animal?.categoria_id ?? line.categoria_id,
            };
          })
        );
        for (const animal of disponibles) {
          if (animal.parcela_id) {
            await loadPotreros(animal.parcela_id);
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

  const loadPotreros = async (parcelaId: number) => {
    if (parcelasByParcela[parcelaId]) {
      return;
    }
    const response = await getPotreros({ parcela_id: parcelaId, activo: true, per_page: 100, page: 1 });
    setPotrerosByParcela((current) => ({
      ...current,
      [parcelaId]: response.data.map((item) => ({
        value: String(item.id),
        label: item.nombre,
      })),
    }));
  };

  const loadAnimales = async (parcelaId?: number | null) => {
    if (!parcelaId) {
      return;
    }
    const data = await getAnimalesDisponiblesVenta({
      parcela_id: parcelaId,
      venta_id: ventaId,
    });
    setAnimales((current) => {
      const others = current.filter((animal) => animal.parcela_id !== parcelaId);
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

  const handleParcelaChange = async (index: number, value: string) => {
    const parcelaId = value ? Number(value) : null;
    updateLine(index, {
      parcela_id: parcelaId,
      potrero_id: null,
      animal_id: null,
    });
    if (parcelaId) {
      await loadPotreros(parcelaId);
      await loadAnimales(parcelaId);
    }
  };

  const handlePotreroChange = (index: number, value: string) => {
    const potreroId = value ? Number(value) : null;
    updateLine(index, { potrero_id: potreroId, animal_id: null });
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
      potrero_id: animal?.potrero_id ?? lines[index].potrero_id,
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
        {isEdit ? <RegistradoPorField nombre={registradoPorNombre} /> : null}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 dark:text-white">Detalle de animales</h3>
          <Button type="button" size="sm" variant="outline" onClick={() => setLines((current) => [...current, emptyLine()])}>
            + Animal
          </Button>
        </div>
        <p className="text-sm text-gray-500">
          Seleccione parcela, parcela y categoría para listar únicamente animales ACTIVO disponibles para venta.
        </p>

        {lines.map((line, index) => {
          const potreroOptions = line.parcela_id ? parcelasByParcela[line.parcela_id] ?? [] : [];
          const animalOptions = animales
            .filter((animal) => {
              if (line.parcela_id && animal.parcela_id !== line.parcela_id) {
                return false;
              }
              if (line.potrero_id && animal.potrero_id !== line.potrero_id) {
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
              label: `${animal.codigo}${animal.arete ? ` · ${animal.arete}` : ""} · ${animal.potrero_nombre ?? "Sin potrero"}`,
            }));

          return (
            <div
              key={index}
              className="grid grid-cols-1 gap-3 rounded-xl border border-gray-200 p-4 dark:border-white/[0.05] md:grid-cols-4"
            >
              <div>
                <Label>Parcela *</Label>
                <Select
                  value={line.parcela_id ? String(line.parcela_id) : ""}
                  placeholder="Parcela"
                  options={parcelas}
                  onChange={(value) => handleParcelaChange(index, value)}
                />
              </div>
              <div>
                <Label>Potrero</Label>
                <Select
                  value={line.potrero_id ? String(line.potrero_id) : ""}
                  placeholder="Todos los potreros"
                  options={[{ value: "", label: "Todos los potreros" }, ...potreroOptions]}
                  onChange={(value) => handlePotreroChange(index, value)}
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
                  placeholder={line.parcela_id ? "Seleccione animal" : "Elija una parcela"}
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
