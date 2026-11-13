import { useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";
import { PESAJE_ROUTES } from "../constants";
import { useCreatePesaje } from "../hooks";
import { downloadPesajePlantilla, previewPesajeExcel } from "../services";
import { AnimalDisponiblePesaje, PesajeExcelFila } from "../types";
import { formatPeso } from "../utils";
import AnimalAreteSelect, { AreteOption } from "./AnimalAreteSelect";

interface LineState {
  animal_id: number | null;
  animal_codigo: string;
  animal_arete: string;
  lote_nombre: string;
  potrero_nombre: string;
  peso: number;
  option: AreteOption | null;
}

const emptyLine = (): LineState => ({
  animal_id: null,
  animal_codigo: "",
  animal_arete: "",
  lote_nombre: "",
  potrero_nombre: "",
  peso: 0,
  option: null,
});

const today = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
};
const year = new Date().getFullYear();

const sectionClass =
  "rounded-xl border border-gray-200 bg-gray-50/60 p-4 dark:border-white/[0.06] dark:bg-white/[0.02] sm:p-5";

const fromAnimal = (animal: AnimalDisponiblePesaje, peso = 0): LineState => ({
  animal_id: animal.id,
  animal_codigo: animal.codigo,
  animal_arete: animal.arete ?? "",
  lote_nombre: animal.lote_nombre ?? "",
  potrero_nombre: animal.potrero_nombre ?? "",
  peso,
  option: {
    value: animal.id,
    label: animal.arete ? `${animal.arete} · ${animal.codigo}` : animal.codigo,
    animal,
  },
});

const fromExcel = (fila: PesajeExcelFila): LineState => {
  if (!fila.animal_id) {
    return {
      ...emptyLine(),
      animal_arete: fila.codigo_arete,
      peso: fila.peso_kg ?? 0,
    };
  }

  const animal: AnimalDisponiblePesaje = {
    id: fila.animal_id,
    codigo: fila.animal_codigo ?? "",
    arete: fila.codigo_arete,
    lote_id: fila.lote_id,
    lote_nombre: fila.lote_nombre,
    potrero_nombre: fila.potrero_nombre,
  };

  return fromAnimal(animal, fila.peso_kg ?? 0);
};

export default function PesajeForm() {
  const navigate = useNavigate();
  const { create, loading: saving, error, setError } = useCreatePesaje();

  const [fechaPesaje, setFechaPesaje] = useState(today());
  const [observacion, setObservacion] = useState("");
  const [lines, setLines] = useState<LineState[]>([emptyLine()]);
  const [modo, setModo] = useState<"manual" | "excel">("manual");
  const [excelError, setExcelError] = useState<string | null>(null);
  const [excelLoading, setExcelLoading] = useState(false);
  const [excelFilas, setExcelFilas] = useState<PesajeExcelFila[]>([]);

  const validLines = useMemo(
    () => lines.filter((linea) => linea.animal_id && Number(linea.peso) > 0),
    [lines]
  );

  const totalAnimales = validLines.length;
  const totalPeso = validLines.reduce((acc, linea) => acc + (Number(linea.peso) || 0), 0);
  const selectedIds = lines.map((linea) => linea.animal_id).filter((id): id is number => Boolean(id));

  const updateLine = (index: number, partial: Partial<LineState>) => {
    setLines((current) =>
      current.map((linea, currentIndex) =>
        currentIndex === index ? { ...linea, ...partial } : linea
      )
    );
  };

  const handleSelect = (index: number, option: AreteOption | null) => {
    if (!option) {
      updateLine(index, emptyLine());
      return;
    }
    updateLine(index, fromAnimal(option.animal, lines[index]?.peso ?? 0));
  };

  const handlePlantilla = async () => {
    try {
      setExcelError(null);
      await downloadPesajePlantilla();
    } catch (err) {
      console.error(err);
      setExcelError("No se pudo descargar la plantilla.");
    }
  };

  const handleExcel = async (file: File | null) => {
    if (!file) {
      return;
    }

    setExcelLoading(true);
    setExcelError(null);
    try {
      const preview = await previewPesajeExcel(file);
      setExcelFilas(preview.filas);
      const validas = preview.filas.filter((fila) => fila.valida && fila.animal_id);
      setLines(validas.length ? validas.map(fromExcel) : [emptyLine()]);
      setModo("excel");
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } })
        ?.response?.data;
      const message = data?.errors?.archivo?.[0] ?? data?.message ?? "No se pudo leer el archivo.";
      setExcelError(message);
    } finally {
      setExcelLoading(false);
    }
  };

  const removeExcelFila = (linea: number) => {
    const restantes = excelFilas.filter((fila) => fila.linea !== linea);
    setExcelFilas(restantes);
    const validas = restantes.filter((fila) => fila.valida && fila.animal_id);
    setLines(validas.length ? validas.map(fromExcel) : [emptyLine()]);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fechaPesaje) {
      setError("La fecha de pesaje es obligatoria.");
      return;
    }

    if (validLines.length === 0) {
      setError(
        modo === "excel" && excelFilas.length > 0
          ? "Ninguna fila del Excel es válida. Corrija el archivo o páselas al registro manual."
          : "Debe registrar al menos un animal con peso mayor a cero."
      );
      return;
    }

    try {
      const response = await create({
        fecha_pesaje: fechaPesaje,
        observacion: observacion || null,
        detalles: validLines.map((linea) => ({
          animal_id: linea.animal_id as number,
          peso: Number(linea.peso),
        })),
      });
      navigate(PESAJE_ROUTES.detail(response.data.id));
    } catch {
      // handled
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </div>
      )}

      <section className={`${sectionClass} space-y-4`}>
        <div>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90">Cabecera</h3>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            El código se asigna al confirmar, con formato PES-{year}-0001.
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-x-3 gap-y-3">
          <div className="w-full shrink-0 sm:w-[11.5rem]">
            <Label>Código del pesaje</Label>
            <InputField type="text" value={`PES-${year}-####`} disabled />
          </div>
          <div className="w-full shrink-0 sm:w-[10.5rem]">
            <Label>Fecha de pesaje</Label>
            <InputField
              type="date"
              value={fechaPesaje}
              onChange={(e) => setFechaPesaje(e.target.value)}
            />
          </div>
          <div className="min-w-0 w-full sm:min-w-[16rem] sm:flex-[1_1_16rem]">
            <Label>Observaciones</Label>
            <TextArea
              rows={2}
              value={observacion}
              onChange={setObservacion}
              placeholder="Notas de la sesión de pesaje, si corresponde"
            />
          </div>
        </div>
      </section>

      <section className={`${sectionClass} space-y-4`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90">Detalle de animales</h3>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              Seleccione el arete. El potrero y la parcela se completan automáticamente.
            </p>
          </div>
          <div className="inline-flex shrink-0 rounded-lg border border-gray-200 p-1 dark:border-white/[0.08]">
            <button
              type="button"
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                modo === "manual"
                  ? "bg-brand-500 text-white"
                  : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/[0.04]"
              }`}
              onClick={() => setModo("manual")}
            >
              Registro manual
            </button>
            <button
              type="button"
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                modo === "excel"
                  ? "bg-brand-500 text-white"
                  : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/[0.04]"
              }`}
              onClick={() => setModo("excel")}
            >
              Carga masiva Excel
            </button>
          </div>
        </div>

        {modo === "excel" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-end gap-x-3 gap-y-3">
              <div className="min-w-0 w-full sm:min-w-[18rem] sm:flex-1">
                <Label>Archivo Excel o CSV</Label>
                <input
                  type="file"
                  accept=".xlsx,.csv"
                  className="focus:border-ring-brand-300 h-11 w-full overflow-hidden rounded-lg border border-gray-300 bg-transparent text-sm text-gray-500 shadow-theme-xs transition-colors file:mr-5 file:border-collapse file:cursor-pointer file:rounded-l-lg file:border-0 file:border-r file:border-solid file:border-gray-200 file:bg-gray-50 file:py-3 file:pl-3.5 file:pr-3 file:text-sm file:text-gray-700 placeholder:text-gray-400 hover:file:bg-gray-100 focus:outline-hidden focus:file:ring-brand-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:text-white/90 dark:file:border-gray-800 dark:file:bg-white/[0.03] dark:file:text-gray-400 dark:placeholder:text-gray-400"
                  onChange={(e) => handleExcel(e.target.files?.[0] ?? null)}
                />
                {excelLoading && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Validando archivo...</p>
                )}
              </div>
              <div className="shrink-0">
                <Button type="button" size="sm" variant="outline" onClick={handlePlantilla}>
                  Descargar plantilla
                </Button>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              La plantilla solo tiene dos columnas: <code>codigo_arete</code> y <code>peso_kg</code>.
            </p>
            {excelError && <p className="text-sm text-red-600 dark:text-red-300">{excelError}</p>}
            {excelFilas.length > 0 && (
              <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-white/[0.06]">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-left text-gray-500 dark:bg-white/[0.03] dark:text-gray-400">
                    <tr>
                      <th className="w-12 px-2 py-2 font-medium">Línea</th>
                      <th className="w-24 px-2 py-2 font-medium">Arete</th>
                      <th className="w-16 px-2 py-2 font-medium">Peso</th>
                      <th className="px-2 py-2 font-medium">Potrero</th>
                      <th className="px-2 py-2 font-medium">Parcela</th>
                      <th className="px-2 py-2 font-medium">Estado</th>
                      <th className="w-16 px-2 py-2 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {excelFilas.map((fila) => (
                      <tr
                        key={fila.linea}
                        className={
                          fila.valida
                            ? "border-t border-gray-100 dark:border-white/[0.04]"
                            : "border-t border-red-100 bg-red-50 dark:border-red-500/20 dark:bg-red-500/10"
                        }
                      >
                        <td className="whitespace-nowrap px-2 py-2">{fila.linea}</td>
                        <td className="whitespace-nowrap px-2 py-2">{fila.codigo_arete || "—"}</td>
                        <td className="whitespace-nowrap px-2 py-2">{fila.peso_kg ?? "—"}</td>
                        <td className="px-2 py-2">{fila.lote_nombre || "—"}</td>
                        <td className="px-2 py-2">{fila.potrero_nombre || "—"}</td>
                        <td className="px-2 py-2">{fila.valida ? "Lista" : fila.errores.join(" ")}</td>
                        <td className="px-2 py-2">
                          <button
                            type="button"
                            className="text-sm text-red-600 hover:underline dark:text-red-300"
                            onClick={() => removeExcelFila(fila.linea)}
                          >
                            Quitar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex flex-wrap items-center gap-3 border-t border-gray-100 px-3 py-3 dark:border-white/[0.04]">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setLines(excelFilas.map(fromExcel));
                      setModo("manual");
                    }}
                  >
                    Corregir filas en el formulario
                  </Button>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Las filas con error no se guardan hasta que estén completas.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {modo === "manual" && (
          <div className="space-y-3">
            {lines.map((linea, index) => (
              <div
                key={index}
                className="rounded-lg border border-gray-200 bg-white p-3 dark:border-white/[0.06] dark:bg-white/[0.02] sm:p-4"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h4 className="text-sm font-medium text-gray-800 dark:text-white/90">
                    Animal {index + 1}
                  </h4>
                  {lines.length > 1 && (
                    <button
                      type="button"
                      className="shrink-0 text-sm text-red-600 hover:underline dark:text-red-300"
                      onClick={() =>
                        setLines((current) =>
                          current.length === 1 ? [emptyLine()] : current.filter((_, i) => i !== index)
                        )
                      }
                    >
                      Quitar
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap items-end gap-x-3 gap-y-3">
                  <div className="relative z-10 min-w-0 w-full overflow-visible sm:min-w-[16rem] sm:flex-[1.4_1_16rem]">
                    <Label>Código de arete</Label>
                    <AnimalAreteSelect
                      value={linea.option}
                      excludedIds={selectedIds.filter((id) => id !== linea.animal_id)}
                      onChange={(option) => handleSelect(index, option)}
                    />
                  </div>
                  <div className="w-full shrink-0 sm:w-[10rem]">
                    <Label>Potrero</Label>
                    <InputField type="text" value={linea.lote_nombre} disabled />
                  </div>
                  <div className="w-full shrink-0 sm:w-[10rem]">
                    <Label>Parcela</Label>
                    <InputField type="text" value={linea.potrero_nombre} disabled />
                  </div>
                  <div className="w-full shrink-0 sm:w-[7.5rem]">
                    <Label>Peso (kg)</Label>
                    <InputField
                      type="number"
                      min="0.01"
                      step={0.01}
                      value={linea.peso ? String(linea.peso) : ""}
                      onChange={(e) => updateLine(index, { peso: Number(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              </div>
            ))}
            <Button type="button" size="sm" variant="outline" onClick={() => setLines((current) => [...current, emptyLine()])}>
              + Agregar animal
            </Button>
          </div>
        )}
      </section>

      <div className="flex flex-col gap-4 border-t border-gray-100 pt-4 dark:border-white/[0.06] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-end gap-x-4 gap-y-3 text-sm text-gray-500 dark:text-gray-400">
          <div>
            <Label>Total de animales pesados</Label>
            <InputField type="text" value={String(totalAnimales)} disabled />
          </div>
          <p className="pb-2">
            {formatPeso(totalPeso)}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button size="sm" variant="outline" type="button" onClick={() => navigate(PESAJE_ROUTES.list)}>
            Cancelar
          </Button>
          <Button size="sm" type="submit" disabled={saving}>
            {saving ? "Guardando..." : "Registrar pesaje"}
          </Button>
        </div>
      </div>
    </form>
  );
}
