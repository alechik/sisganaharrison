import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";
import { AnimalDisponibleVenta } from "@/modules/ventas/types";
import { useCreatePesaje } from "../hooks";
import { PESAJE_ROUTES } from "../constants";
import { PesajeCreateRequest } from "../types";
import { formatPeso } from "../utils";
import AnimalSearchField from "./AnimalSearchField";

interface LineState {
  animal_id: number | null;
  animal_codigo: string;
  lote_nombre: string;
  potrero_nombre: string;
  peso: number;
}

const emptyLine = (): LineState => ({
  animal_id: null,
  animal_codigo: "",
  lote_nombre: "",
  potrero_nombre: "",
  peso: 0,
});

const today = () => new Date().toISOString().slice(0, 10);

export default function PesajeForm() {
  const navigate = useNavigate();
  const { create, loading: saving, error, setError } = useCreatePesaje();

  const [fechaPesaje, setFechaPesaje] = useState(today());
  const [observacion, setObservacion] = useState("");
  const [lines, setLines] = useState<LineState[]>([emptyLine()]);
  const [validationError, setValidationError] = useState<string | null>(null);

  const selectedIds = useMemo(
    () => lines.map((line) => line.animal_id).filter((id): id is number => Boolean(id)),
    [lines]
  );

  const totalPeso = lines.reduce((acc, line) => acc + (Number(line.peso) || 0), 0);

  const applyAnimal = (index: number, animal: AnimalDisponibleVenta) => {
    setLines((current) =>
      current.map((line, i) =>
        i === index
          ? {
              ...line,
              animal_id: animal.id,
              animal_codigo: animal.codigo,
              lote_nombre: animal.lote_nombre ?? "",
              potrero_nombre: animal.potrero_nombre ?? "",
              peso: animal.peso ?? line.peso,
            }
          : line
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setValidationError(null);

    if (!fechaPesaje) {
      setValidationError("La fecha de pesaje es obligatoria.");
      return;
    }

    if (lines.some((line) => !line.animal_id || line.peso <= 0)) {
      setValidationError("Cada línea debe tener un animal y un peso mayor a cero.");
      return;
    }

    const payload: PesajeCreateRequest = {
      fecha_pesaje: fechaPesaje,
      observacion: observacion || null,
      detalles: lines.map((line) => ({
        animal_id: Number(line.animal_id),
        peso: Number(line.peso),
      })),
    };

    try {
      const response = await create(payload);
      navigate(PESAJE_ROUTES.detail(response.data.id));
    } catch {
      // handled
    }
  };

  const displayError = validationError || error;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {displayError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {displayError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label>Fecha de pesaje *</Label>
          <InputField type="date" value={fechaPesaje} onChange={(e) => setFechaPesaje(e.target.value)} />
        </div>
        <div>
          <Label>Total peso</Label>
          <InputField type="text" value={formatPeso(totalPeso)} disabled />
        </div>
        <div className="md:col-span-2">
          <Label>Observación</Label>
          <TextArea rows={3} value={observacion} onChange={(value) => setObservacion(value)} />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 dark:text-white">Detalle de animales</h3>
          <Button type="button" size="sm" variant="outline" onClick={() => setLines((current) => [...current, emptyLine()])}>
            + Animal
          </Button>
        </div>

        {lines.map((line, index) => (
          <div
            key={index}
            className="grid grid-cols-1 gap-3 rounded-xl border border-gray-200 p-4 dark:border-white/[0.05] md:grid-cols-4"
          >
            <div>
              <Label>Código del animal *</Label>
              <AnimalSearchField
                excludedIds={selectedIds.filter((id) => id !== line.animal_id)}
                onSelect={(animal) => applyAnimal(index, animal)}
              />
              {line.animal_codigo && (
                <p className="mt-1 text-xs text-gray-500">{line.animal_codigo}</p>
              )}
            </div>
            <div>
              <Label>Lote / Potrero</Label>
              <InputField
                type="text"
                value={`${line.lote_nombre || "—"} / ${line.potrero_nombre || "—"}`}
                disabled
              />
            </div>
            <div>
              <Label>Peso (kg) *</Label>
              <InputField
                type="number"
                min="0.01"
                step={0.01}
                value={String(line.peso || "")}
                onChange={(e) =>
                  setLines((current) =>
                    current.map((item, i) => (i === index ? { ...item, peso: Number(e.target.value) || 0 } : item))
                  )
                }
              />
            </div>
            {lines.length > 1 && (
              <div className="flex items-end">
                <button
                  type="button"
                  className="text-sm text-red-600"
                  onClick={() => setLines((current) => current.filter((_, i) => i !== index))}
                >
                  Quitar
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 flex gap-3">
        <Button size="sm" type="submit" disabled={saving}>
          {saving ? "Guardando..." : "Registrar pesaje"}
        </Button>
        <Button size="sm" variant="outline" type="button" onClick={() => navigate(PESAJE_ROUTES.list)}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
