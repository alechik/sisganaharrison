import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";
import { useAnimalReferenceOptions } from "@/modules/animales/hooks/useAnimalReferenceOptions";
import { INGRESO_ROUTES } from "../constants";
import { useCreateIngreso } from "../hooks";
import { getCuarentenas, getPendientesIngreso } from "../services";
import {
  AnimalIngresoPayload,
  Cuarentena,
  IngresoPendienteLinea,
  IngresoPendientes,
} from "../types";
import { formatEdad, formatMoney, formatPeso, formatSexo } from "../utils";

interface LineState {
  selected: boolean;
  peso_ingreso: string;
  observaciones: string;
  expanded: boolean;
  animal: AnimalIngresoPayload;
}

const emptyAnimal = (linea: IngresoPendienteLinea): AnimalIngresoPayload => ({
  arete: linea.animal?.arete ?? "",
  nombre: linea.animal?.nombre ?? "",
  fecha_nacimiento: linea.animal?.fecha_nacimiento ?? "",
  raza_id: linea.animal?.raza_id ?? null,
  estado_productivo_id: linea.animal?.estado_productivo_id ?? null,
  madre_id: linea.animal?.madre_id ?? null,
  padre_id: linea.animal?.padre_id ?? null,
  color: linea.animal?.color ?? "",
  observaciones: linea.animal?.observaciones ?? "",
  edad_inicial: linea.animal?.edad_inicial ?? linea.edad ?? null,
  edad_actual: linea.animal?.edad_actual ?? linea.edad ?? null,
});

export default function IngresoForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const presetCuarentenaId = searchParams.get("cuarentena_id");

  const { create, loading, error, setError } = useCreateIngreso();
  const {
    razaOptions,
    estadoProductivoOptions,
    loteOptions,
    parentOptions,
    loading: loadingOptions,
    error: optionsError,
  } = useAnimalReferenceOptions();

  const [cuarentenas, setCuarentenas] = useState<Cuarentena[]>([]);
  const [cuarentenaId, setCuarentenaId] = useState(presetCuarentenaId ?? "");
  const [pendientes, setPendientes] = useState<IngresoPendientes | null>(null);
  const [loadingPendientes, setLoadingPendientes] = useState(false);
  const [loteId, setLoteId] = useState("");
  const [fechaIngreso, setFechaIngreso] = useState(new Date().toISOString().slice(0, 10));
  const [observaciones, setObservaciones] = useState("");
  const [lines, setLines] = useState<Record<number, LineState>>({});

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getCuarentenas({
          estado: "COMPLETADO",
          per_page: 100,
          sort_by: "created_at",
          sort_dir: "desc",
        });
        setCuarentenas(response.data);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar las cuarentenas completadas.");
      }
    };

    load();
  }, [setError]);

  useEffect(() => {
    if (!cuarentenaId) {
      setPendientes(null);
      setLines({});
      return;
    }

    const loadPendientes = async () => {
      try {
        setLoadingPendientes(true);
        setError(null);
        const data = await getPendientesIngreso(Number(cuarentenaId));
        setPendientes(data);
        const next: Record<number, LineState> = {};
        data.detalles.forEach((linea) => {
          next[linea.animal_id] = {
            selected: false,
            peso_ingreso: "",
            observaciones: "",
            expanded: false,
            animal: emptyAnimal(linea),
          };
        });
        setLines(next);
      } catch (err) {
        console.error(err);
        setPendientes(null);
        setError("No se pudieron cargar los animales pendientes de esa cuarentena.");
      } finally {
        setLoadingPendientes(false);
      }
    };

    loadPendientes();
  }, [cuarentenaId, setError]);

  const selectedCount = useMemo(
    () => Object.values(lines).filter((line) => line.selected).length,
    [lines]
  );

  const toggleLine = (animalId: number) => {
    setLines((current) => ({
      ...current,
      [animalId]: {
        ...current[animalId],
        selected: !current[animalId].selected,
      },
    }));
  };

  const updateLine = (animalId: number, partial: Partial<LineState>) => {
    setLines((current) => ({
      ...current,
      [animalId]: {
        ...current[animalId],
        ...partial,
      },
    }));
  };

  const updateAnimal = (animalId: number, partial: AnimalIngresoPayload) => {
    setLines((current) => ({
      ...current,
      [animalId]: {
        ...current[animalId],
        animal: {
          ...current[animalId].animal,
          ...partial,
        },
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!cuarentenaId) {
      setError("Seleccione una cuarentena completada.");
      return;
    }
    if (!loteId) {
      setError("Seleccione el lote destino.");
      return;
    }

    const selected = (pendientes?.detalles ?? []).filter((linea) => lines[linea.animal_id]?.selected);
    if (selected.length === 0) {
      setError("Seleccione al menos un animal para este ingreso.");
      return;
    }

    const invalidPeso = selected.find((linea) => Number(lines[linea.animal_id].peso_ingreso) <= 0);
    if (invalidPeso) {
      setError("Cada animal seleccionado debe tener un peso de ingreso mayor a cero.");
      return;
    }

    try {
      const response = await create({
        cuarentena_id: Number(cuarentenaId),
        lote_id: Number(loteId),
        fecha_ingreso: fechaIngreso,
        observaciones: observaciones || null,
        detalles: selected.map((linea) => {
          const state = lines[linea.animal_id];
          return {
            animal_id: linea.animal_id,
            peso_ingreso: Number(state.peso_ingreso),
            observaciones: state.observaciones || null,
            animal: {
              arete: state.animal.arete || null,
              nombre: state.animal.nombre || null,
              fecha_nacimiento: state.animal.fecha_nacimiento || null,
              raza_id: state.animal.raza_id ?? null,
              estado_productivo_id: state.animal.estado_productivo_id ?? null,
              madre_id: state.animal.madre_id ?? null,
              padre_id: state.animal.padre_id ?? null,
              color: state.animal.color || null,
              observaciones: state.animal.observaciones || null,
              edad_inicial: state.animal.edad_inicial ?? null,
              edad_actual: state.animal.edad_actual ?? null,
            },
          };
        }),
      });
      navigate(INGRESO_ROUTES.detail(response.data.id));
    } catch {
      // handled
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {(error || optionsError) && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error || optionsError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label>Cuarentena completada *</Label>
          <Select
            value={cuarentenaId || ""}
            placeholder="Seleccione una cuarentena"
            options={cuarentenas.map((item) => ({
              value: String(item.id),
              label: `${item.cod_compra} — ${item.proveedor_razon_social ?? "Proveedor"}`,
            }))}
            onChange={setCuarentenaId}
          />
        </div>
        <div>
          <Label>Lote destino *</Label>
          <Select
            value={loteId}
            placeholder="Seleccione un lote"
            options={loteOptions}
            onChange={setLoteId}
          />
        </div>
        <div>
          <Label>Fecha de ingreso *</Label>
          <InputField
            type="date"
            value={fechaIngreso}
            onChange={(e) => setFechaIngreso(e.target.value)}
          />
        </div>
        <div>
          <Label>Observaciones generales</Label>
          <TextArea
            rows={3}
            value={observaciones}
            onChange={(value) => setObservaciones(value)}
          />
        </div>
      </div>

      {pendientes && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm dark:border-white/[0.05] dark:bg-white/[0.02]">
          <p>
            <strong>Proveedor:</strong> {pendientes.proveedor_razon_social || "—"}
            {pendientes.proveedor_nit ? ` · NIT ${pendientes.proveedor_nit}` : ""}
          </p>
          <p>
            <strong>Origen:</strong> {pendientes.orden_compra_codigo
              ? `Orden ${pendientes.orden_compra_codigo}`
              : "Cuarentena directa"}
          </p>
          <p>
            <strong>Animales:</strong> {pendientes.animales_pendientes} pendientes de{" "}
            {pendientes.animales_total} ({pendientes.animales_ingresados} ya ingresados)
          </p>
        </div>
      )}

      {loadingPendientes && <p className="text-sm text-gray-500">Cargando animales pendientes...</p>}

      {pendientes && pendientes.detalles.length === 0 && (
        <p className="text-sm text-gray-500">
          Todos los animales de esta cuarentena ya fueron ingresados.
        </p>
      )}

      {pendientes && pendientes.detalles.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-gray-800 dark:text-white">
            Animales disponibles ({selectedCount} seleccionados)
          </h3>
          {pendientes.detalles.map((linea) => {
            const state = lines[linea.animal_id];
            if (!state) {
              return null;
            }

            return (
              <div
                key={linea.animal_id}
                className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-white/[0.05] dark:bg-white/[0.03]"
              >
                <div className="flex flex-wrap items-start gap-4">
                  <label className="mt-1 flex items-center gap-2 text-sm font-medium text-gray-800 dark:text-white">
                    <input
                      type="checkbox"
                      checked={state.selected}
                      onChange={() => toggleLine(linea.animal_id)}
                    />
                    {linea.animal_codigo}
                  </label>
                  <div className="grid flex-1 grid-cols-2 gap-2 text-sm text-gray-600 md:grid-cols-5 dark:text-gray-300">
                    <span>{formatSexo(linea.sexo)}</span>
                    <span>{linea.categoria_codigo} — {linea.categoria_nombre}</span>
                    <span>Edad (meses): {linea.edad ?? "—"}</span>
                    <span>Peso CQ: {formatPeso(linea.peso_oc)}</span>
                    <span>Precio: {formatMoney(linea.precio_compra)}</span>
                  </div>
                </div>

                {state.selected && (
                  <div className="mt-4 space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <Label>Peso de ingreso (kg) *</Label>
                        <InputField
                          type="number"
                          step={0.01}
                          min="0.01"
                          value={state.peso_ingreso}
                          onChange={(e) => updateLine(linea.animal_id, { peso_ingreso: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Observaciones del animal en este ingreso</Label>
                        <InputField
                          type="text"
                          value={state.observaciones}
                          onChange={(e) => updateLine(linea.animal_id, { observaciones: e.target.value })}
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      className="text-sm text-brand-500 hover:underline"
                      onClick={() => updateLine(linea.animal_id, { expanded: !state.expanded })}
                    >
                      {state.expanded ? "Ocultar ficha del animal" : "Completar ficha del animal"}
                    </button>
                    {state.expanded && (
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                        <div>
                          <Label>Arete</Label>
                          <InputField
                            type="text"
                            value={state.animal.arete ?? ""}
                            onChange={(e) =>
                              updateAnimal(linea.animal_id, { arete: e.target.value.toUpperCase() })
                            }
                          />
                        </div>
                        <div>
                          <Label>Nombre</Label>
                          <InputField
                            type="text"
                            value={state.animal.nombre ?? ""}
                            onChange={(e) => updateAnimal(linea.animal_id, { nombre: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Fecha de nacimiento</Label>
                          <InputField
                            type="date"
                            value={state.animal.fecha_nacimiento ?? ""}
                            onChange={(e) =>
                              updateAnimal(linea.animal_id, { fecha_nacimiento: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <Label>Raza</Label>
                          <Select
                            value={state.animal.raza_id ? String(state.animal.raza_id) : ""}
                            placeholder="Sin raza"
                            options={razaOptions}
                            onChange={(value) =>
                              updateAnimal(linea.animal_id, { raza_id: value ? Number(value) : null })
                            }
                          />
                        </div>
                        <div>
                          <Label>Estado productivo</Label>
                          <Select
                            value={state.animal.estado_productivo_id ? String(state.animal.estado_productivo_id) : ""}
                            placeholder="Sin estado"
                            options={estadoProductivoOptions}
                            onChange={(value) =>
                              updateAnimal(linea.animal_id, {
                                estado_productivo_id: value ? Number(value) : null,
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label>Color</Label>
                          <InputField
                            type="text"
                            value={state.animal.color ?? ""}
                            onChange={(e) => updateAnimal(linea.animal_id, { color: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Madre</Label>
                          <Select
                            value={state.animal.madre_id ? String(state.animal.madre_id) : ""}
                            placeholder="Sin madre"
                            options={parentOptions}
                            onChange={(value) =>
                              updateAnimal(linea.animal_id, { madre_id: value ? Number(value) : null })
                            }
                          />
                        </div>
                        <div>
                          <Label>Padre</Label>
                          <Select
                            value={state.animal.padre_id ? String(state.animal.padre_id) : ""}
                            placeholder="Sin padre"
                            options={parentOptions}
                            onChange={(value) =>
                              updateAnimal(linea.animal_id, { padre_id: value ? Number(value) : null })
                            }
                          />
                        </div>
                        <div>
                          <Label>Edad actual (meses)</Label>
                          <InputField
                            type="number"
                            min="0"
                            value={state.animal.edad_actual ?? ""}
                            onChange={(e) =>
                              updateAnimal(linea.animal_id, {
                                edad_actual: e.target.value === "" ? null : Number(e.target.value),
                              })
                            }
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label>Observaciones de ficha</Label>
                          <TextArea
                            rows={2}
                            value={state.animal.observaciones ?? ""}
                            onChange={(value) => updateAnimal(linea.animal_id, { observaciones: value })}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate(INGRESO_ROUTES.list)}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={loading || loadingOptions || loadingPendientes}>
          {loading ? "Guardando..." : "Registrar ingreso"}
        </Button>
      </div>
    </form>
  );
}
