import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";
import { AnimalDisponibleVenta } from "@/modules/ventas/types";
import { useCreateEventoSanitario, useSanitarioReferenceOptions } from "../hooks";
import { EVENTO_SANITARIO_ROUTES } from "../constants";
import { EventoSanitarioCreateRequest } from "../types";
import { formatMoney } from "../utils";
import AnimalSearchField from "./AnimalSearchField";

interface LineState {
  animal_id: number | null;
  animal_codigo: string;
  animal_arete: string;
  lote_id: number | null;
  lote_nombre: string;
  peso_animal: number | null;
  presentacion_id: number | null;
  medicamento_id: number | null;
  precio_medicamento: number;
}

const emptyLine = (): LineState => ({
  animal_id: null,
  animal_codigo: "",
  animal_arete: "",
  lote_id: null,
  lote_nombre: "",
  peso_animal: null,
  presentacion_id: null,
  medicamento_id: null,
  precio_medicamento: 0,
});

const today = () => new Date().toISOString().slice(0, 10);

export default function EventoSanitarioForm() {
  const navigate = useNavigate();
  const { create, loading: saving, error, setError } = useCreateEventoSanitario();
  const {
    tipoEventoOptions,
    presentacionOptions,
    medicamentos,
    loading: loadingOptions,
    error: optionsError,
  } = useSanitarioReferenceOptions();

  const [tipoEventoId, setTipoEventoId] = useState(0);
  const [fecha, setFecha] = useState(today());
  const [diagnostico, setDiagnostico] = useState("");
  const [tratamiento, setTratamiento] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [lines, setLines] = useState<LineState[]>([emptyLine()]);
  const [validationError, setValidationError] = useState<string | null>(null);

  const selectedIds = useMemo(
    () => lines.map((line) => line.animal_id).filter((id): id is number => Boolean(id)),
    [lines]
  );

  const totalEstimado = lines.reduce((acc, line) => acc + (Number(line.precio_medicamento) || 0), 0);

  const medicamentosFiltrados = (presentacionId: number | null) =>
    medicamentos.filter((item) => !presentacionId || item.presentacion_id === presentacionId);

  const applyAnimal = (index: number, animal: AnimalDisponibleVenta) => {
    setLines((current) =>
      current.map((line, i) =>
        i === index
          ? {
              ...line,
              animal_id: animal.id,
              animal_codigo: animal.codigo,
              animal_arete: animal.arete ?? "",
              lote_id: animal.lote_id,
              lote_nombre: animal.lote_nombre ?? "",
              peso_animal: animal.peso ?? null,
            }
          : line
      )
    );
  };

  const applyMedicamento = (index: number, medicamentoId: number) => {
    const medicamento = medicamentos.find((item) => item.id === medicamentoId);
    setLines((current) =>
      current.map((line, i) =>
        i === index
          ? {
              ...line,
              medicamento_id: medicamentoId || null,
              presentacion_id: medicamento?.presentacion_id ?? line.presentacion_id,
              precio_medicamento: medicamento?.precio ?? 0,
            }
          : line
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setValidationError(null);

    if (!tipoEventoId) {
      setValidationError("Debe seleccionar un tipo de evento.");
      return;
    }

    if (!fecha) {
      setValidationError("La fecha es obligatoria.");
      return;
    }

    if (lines.some((line) => !line.animal_id || !line.medicamento_id)) {
      setValidationError("Cada línea debe tener un animal y un medicamento.");
      return;
    }

    const payload: EventoSanitarioCreateRequest = {
      tipo_evento_id: tipoEventoId,
      fecha,
      diagnostico: diagnostico || null,
      tratamiento: tratamiento || null,
      observaciones: observaciones || null,
      detalles: lines.map((line) => ({
        animal_id: Number(line.animal_id),
        medicamento_id: Number(line.medicamento_id),
      })),
    };

    try {
      const response = await create(payload);
      navigate(EVENTO_SANITARIO_ROUTES.detail(response.data.id));
    } catch {
      // handled
    }
  };

  if (loadingOptions) {
    return <div>Cargando formulario...</div>;
  }

  const displayError = validationError || error || optionsError;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {displayError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {displayError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label>Tipo de evento *</Label>
          <Select
            value={tipoEventoId ? String(tipoEventoId) : ""}
            placeholder="Seleccione un tipo activo"
            options={tipoEventoOptions}
            onChange={(value) => setTipoEventoId(Number(value))}
          />
        </div>
        <div>
          <Label>Fecha *</Label>
          <InputField type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
        </div>
        <div>
          <Label>Total estimado</Label>
          <InputField type="text" value={formatMoney(totalEstimado)} disabled />
        </div>
        <div className="md:col-span-2">
          <Label>Diagnóstico</Label>
          <TextArea rows={3} value={diagnostico} onChange={setDiagnostico} />
        </div>
        <div className="md:col-span-2">
          <Label>Tratamiento</Label>
          <TextArea rows={3} value={tratamiento} onChange={setTratamiento} />
        </div>
        <div className="md:col-span-2">
          <Label>Observaciones</Label>
          <TextArea rows={3} value={observaciones} onChange={setObservaciones} />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 dark:text-white">Detalle de animales</h3>
          <Button type="button" size="sm" variant="outline" onClick={() => setLines((current) => [...current, emptyLine()])}>
            + Animal
          </Button>
        </div>

        {lines.map((line, index) => {
          const medOptions = medicamentosFiltrados(line.presentacion_id).map((item) => ({
            value: String(item.id),
            label: `${item.codigo} — ${item.nombre}`,
          }));

          return (
            <div
              key={index}
              className="grid grid-cols-1 gap-3 rounded-xl border border-gray-200 p-4 dark:border-white/[0.05] md:grid-cols-3"
            >
              <div>
                <Label>Código del animal *</Label>
                <AnimalSearchField
                  excludedIds={selectedIds.filter((id) => id !== line.animal_id)}
                  onSelect={(animal) => applyAnimal(index, animal)}
                />
                {line.animal_codigo && (
                  <p className="mt-1 text-xs text-gray-500">
                    {line.animal_codigo}
                    {line.animal_arete ? ` · ${line.animal_arete}` : ""}
                  </p>
                )}
              </div>
              <div>
                <Label>Lote al momento del evento</Label>
                <InputField type="text" value={line.lote_nombre || "—"} disabled />
              </div>
              <div>
                <Label>Peso actual (kg)</Label>
                <InputField
                  type="text"
                  value={line.peso_animal !== null ? String(line.peso_animal) : "Sin pesaje"}
                  disabled
                />
              </div>
              <div>
                <Label>Presentación</Label>
                <Select
                  value={line.presentacion_id ? String(line.presentacion_id) : ""}
                  placeholder="Todas / filtrar"
                  options={[{ value: "", label: "Todas" }, ...presentacionOptions]}
                  onChange={(value) =>
                    setLines((current) =>
                      current.map((item, i) =>
                        i === index
                          ? { ...item, presentacion_id: value ? Number(value) : null, medicamento_id: null, precio_medicamento: 0 }
                          : item
                      )
                    )
                  }
                />
              </div>
              <div>
                <Label>Medicamento *</Label>
                <Select
                  value={line.medicamento_id ? String(line.medicamento_id) : ""}
                  placeholder="Seleccione un medicamento activo"
                  options={medOptions}
                  onChange={(value) => applyMedicamento(index, Number(value))}
                />
              </div>
              <div>
                <Label>Precio del medicamento</Label>
                <InputField type="text" value={formatMoney(line.precio_medicamento)} disabled />
              </div>
              {lines.length > 1 && (
                <div className="md:col-span-3">
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

      <div className="flex gap-3">
        <Button size="sm" type="submit" disabled={saving}>
          {saving ? "Guardando..." : "Registrar Evento Sanitario"}
        </Button>
        <Button size="sm" variant="outline" type="button" onClick={() => navigate(EVENTO_SANITARIO_ROUTES.list)}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
