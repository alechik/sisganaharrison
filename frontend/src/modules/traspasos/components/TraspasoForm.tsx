import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getLotes } from "@/modules/lotes/services";
import { AnimalDisponibleVenta } from "@/modules/ventas/types";
import { TRASPASO_ROUTES } from "../constants";
import { useCreateTraspaso, useUpdateTraspaso } from "../hooks";
import { getAnimalesTraspaso, getTraspaso } from "../services";
import { TraspasoCreateRequest } from "../types";
import { formatMoney, formatPeso, formatSexo, lineSubtotal } from "../utils";

const today = () => new Date().toISOString().slice(0, 10);

const puedeTraspasar = (animal: AnimalDisponibleVenta): boolean =>
  (animal.peso ?? 0) > 0 && animal.precio_kilo !== null && animal.precio_kilo !== undefined && animal.precio_kilo >= 0;

interface Props {
  traspasoId?: number;
}

export default function TraspasoForm({ traspasoId }: Props) {
  const navigate = useNavigate();
  const isEdit = Boolean(traspasoId);
  const { create, loading: creating, error: createError, setError: setCreateError } = useCreateTraspaso();
  const { update, loading: updating, error: updateError, setError: setUpdateError } = useUpdateTraspaso();
  const skipResetSelection = useRef(isEdit);

  const [loteOptions, setLoteOptions] = useState<{ value: string; label: string }[]>([]);
  const [loteSalidaId, setLoteSalidaId] = useState(0);
  const [loteIngresoId, setLoteIngresoId] = useState(0);
  const [fecha, setFecha] = useState(today());
  const [observacion, setObservacion] = useState("");
  const [animales, setAnimales] = useState<AnimalDisponibleVenta[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loadingAnimales, setLoadingAnimales] = useState(false);
  const [loadingTraspaso, setLoadingTraspaso] = useState(isEdit);
  const [validationError, setValidationError] = useState<string | null>(null);

  const saving = creating || updating;
  const error = createError || updateError;
  const setError = (value: string | null) => {
    setCreateError(value);
    setUpdateError(value);
  };

  useEffect(() => {
    getLotes({ per_page: 100, activo: true, sort_by: "nombre", sort_dir: "asc" })
      .then((res) =>
        setLoteOptions(
          res.data.map((lote) => ({
            value: String(lote.id),
            label: `${lote.codigo} — ${lote.nombre}`,
          }))
        )
      )
      .catch((err) => {
        console.error(err);
        setError("No se pudieron cargar los lotes.");
      });
  }, [setError]);

  useEffect(() => {
    if (!traspasoId) {
      return;
    }

    const load = async () => {
      try {
        const traspaso = await getTraspaso(traspasoId);
        skipResetSelection.current = true;
        setLoteSalidaId(traspaso.lote_salida_id);
        setLoteIngresoId(traspaso.lote_ingreso_id);
        setFecha(traspaso.fecha_traspaso);
        setObservacion(traspaso.observacion ?? "");
        setSelectedIds((traspaso.detalles ?? []).map((detalle) => detalle.animal_id));
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar el traspaso.");
      } finally {
        setLoadingTraspaso(false);
      }
    };

    load();
  }, [traspasoId]);

  useEffect(() => {
    if (!loteSalidaId) {
      setAnimales([]);
      return;
    }

    const load = async () => {
      try {
        setLoadingAnimales(true);
        setAnimales(await getAnimalesTraspaso(loteSalidaId, traspasoId));
        if (skipResetSelection.current) {
          skipResetSelection.current = false;
        } else {
          setSelectedIds([]);
        }
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los animales del lote de salida.");
      } finally {
        setLoadingAnimales(false);
      }
    };

    load();
  }, [loteSalidaId, traspasoId]);

  const ingresoOptions = loteOptions.filter((option) => Number(option.value) !== loteSalidaId);
  const seleccionables = animales.filter(puedeTraspasar);

  const selectedAnimales = useMemo(
    () => animales.filter((animal) => selectedIds.includes(animal.id)),
    [animales, selectedIds]
  );

  const totalPeso = selectedAnimales.reduce((acc, animal) => acc + (animal.peso ?? 0), 0);
  const montoTotal = selectedAnimales.reduce(
    (acc, animal) => acc + lineSubtotal(animal.peso ?? 0, animal.precio_kilo ?? 0),
    0
  );

  const toggleAnimal = (animal: AnimalDisponibleVenta) => {
    if (!puedeTraspasar(animal)) {
      return;
    }
    setSelectedIds((current) =>
      current.includes(animal.id)
        ? current.filter((id) => id !== animal.id)
        : [...current, animal.id]
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === seleccionables.length) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(seleccionables.map((animal) => animal.id));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setValidationError(null);

    if (!loteSalidaId) {
      setValidationError("Debe seleccionar el lote de salida.");
      return;
    }
    if (!loteIngresoId) {
      setValidationError("Debe seleccionar el lote de ingreso.");
      return;
    }
    if (loteSalidaId === loteIngresoId) {
      setValidationError("El lote de salida y el de ingreso deben ser distintos.");
      return;
    }
    if (!fecha) {
      setValidationError("La fecha de traspaso es obligatoria.");
      return;
    }
    if (selectedIds.length === 0) {
      setValidationError("Debe seleccionar al menos un animal.");
      return;
    }

    const payload: TraspasoCreateRequest = {
      lote_salida_id: loteSalidaId,
      lote_ingreso_id: loteIngresoId,
      fecha_traspaso: fecha,
      observacion: observacion || null,
      detalles: selectedIds.map((animal_id) => ({ animal_id })),
    };

    try {
      if (isEdit && traspasoId) {
        const response = await update(traspasoId, payload);
        navigate(TRASPASO_ROUTES.detail(response.data.id));
      } else {
        const response = await create(payload);
        navigate(TRASPASO_ROUTES.detail(response.data.id));
      }
    } catch {
      // handled
    }
  };

  if (loadingTraspaso) {
    return <div>Cargando formulario...</div>;
  }

  const displayError = validationError || error;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {displayError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {displayError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label>Lote de salida *</Label>
          <Select
            value={loteSalidaId ? String(loteSalidaId) : ""}
            placeholder="Seleccione lote de salida"
            options={loteOptions}
            onChange={(value) => {
              const next = Number(value);
              setLoteSalidaId(next);
              if (loteIngresoId === next) {
                setLoteIngresoId(0);
              }
            }}
          />
        </div>
        <div>
          <Label>Lote de ingreso *</Label>
          <Select
            value={loteIngresoId ? String(loteIngresoId) : ""}
            placeholder="Seleccione lote de ingreso"
            options={ingresoOptions}
            onChange={(value) => setLoteIngresoId(Number(value))}
          />
        </div>
        <div>
          <Label>Fecha de traspaso *</Label>
          <InputField type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <Label>Observación</Label>
          <TextArea rows={3} value={observacion} onChange={setObservacion} />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-semibold text-gray-800 dark:text-white">Animales del lote de salida</h3>
          <p className="text-sm text-gray-500">
            {selectedIds.length} seleccionado(s) · Total peso {formatPeso(totalPeso)} · Monto {formatMoney(montoTotal)}
          </p>
        </div>

        {!loteSalidaId ? (
          <p className="text-sm text-gray-500">Seleccione un lote de salida para listar sus animales.</p>
        ) : loadingAnimales ? (
          <p className="text-sm text-gray-500">Cargando animales...</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-white/[0.05]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell isHeader className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={seleccionables.length > 0 && selectedIds.length === seleccionables.length}
                      onChange={toggleAll}
                      disabled={seleccionables.length === 0}
                    />
                  </TableCell>
                  <TableCell isHeader className="px-4 py-3 font-semibold">Código</TableCell>
                  <TableCell isHeader className="px-4 py-3 font-semibold">Arete</TableCell>
                  <TableCell isHeader className="px-4 py-3 font-semibold">Sexo</TableCell>
                  <TableCell isHeader className="px-4 py-3 font-semibold">Categoría</TableCell>
                  <TableCell isHeader className="px-4 py-3 font-semibold">Peso actual</TableCell>
                  <TableCell isHeader className="px-4 py-3 font-semibold">Precio/kg</TableCell>
                  <TableCell isHeader className="px-4 py-3 font-semibold">Subtotal</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {animales.length === 0 ? (
                  <TableRow>
                    <TableCell className="px-4 py-6 text-center text-gray-500" colSpan={8}>
                      No hay animales activos en este lote.
                    </TableCell>
                  </TableRow>
                ) : (
                  animales.map((animal) => {
                    const apto = puedeTraspasar(animal);
                    return (
                      <TableRow key={animal.id} className={apto ? "" : "opacity-60"}>
                        <TableCell className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(animal.id)}
                            disabled={!apto}
                            onChange={() => toggleAnimal(animal)}
                          />
                        </TableCell>
                        <TableCell className="px-4 py-3">{animal.codigo}</TableCell>
                        <TableCell className="px-4 py-3">{animal.arete || "—"}</TableCell>
                        <TableCell className="px-4 py-3">{formatSexo(animal.sexo)}</TableCell>
                        <TableCell className="px-4 py-3">
                          {animal.categoria_codigo
                            ? `${animal.categoria_codigo} — ${animal.categoria_nombre ?? ""}`
                            : animal.categoria_nombre || "—"}
                        </TableCell>
                        <TableCell className="px-4 py-3">{formatPeso(animal.peso ?? null)}</TableCell>
                        <TableCell className="px-4 py-3">
                          {animal.precio_kilo === null || animal.precio_kilo === undefined
                            ? "—"
                            : formatMoney(animal.precio_kilo)}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          {apto ? formatMoney(lineSubtotal(animal.peso ?? 0, animal.precio_kilo ?? 0)) : "—"}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Button size="sm" type="submit" disabled={saving}>
          {saving ? "Guardando..." : isEdit ? "Actualizar traspaso" : "Registrar traspaso"}
        </Button>
        <Button size="sm" variant="outline" type="button" onClick={() => navigate(TRASPASO_ROUTES.list)}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
