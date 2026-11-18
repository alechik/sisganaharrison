import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";
import { getTiposSalidas } from "@/modules/tipos-salidas/services";
import { TipoSalida } from "@/modules/tipos-salidas/types";
import { SALIDA_ROUTES } from "../constants";
import { useCreateSalida } from "../hooks";
import { downloadSalidaPlantilla, previewSalidaExcel } from "../services";
import { AnimalDisponibleSalida, SalidaExcelFila } from "../types";
import { formatMoney, formatPeso, formatSexo, isTipoVenta, lineSubtotal } from "../utils";
import AnimalSearchField from "./AnimalSearchField";
import ClienteSearchSelect from "./ClienteSearchSelect";

interface LineState {
  animal_id: number | null;
  animal_codigo: string;
  animal_arete: string;
  sexo: string;
  edad_meses: number | null;
  categoria_nombre: string;
  potrero_nombre: string;
  grupo_nombre: string;
  parcela_nombre: string;
  peso: number;
  precio: number;
  observaciones: string;
}

const emptyLine = (): LineState => ({
  animal_id: null,
  animal_codigo: "",
  animal_arete: "",
  sexo: "",
  edad_meses: null,
  categoria_nombre: "",
  potrero_nombre: "",
  grupo_nombre: "",
  parcela_nombre: "",
  peso: 0,
  precio: 0,
  observaciones: "",
});

const today = () => new Date().toISOString().slice(0, 10);

const sectionClass =
  "rounded-xl border border-gray-200 bg-gray-50/60 p-4 dark:border-white/[0.06] dark:bg-white/[0.02] sm:p-5";

const fromAnimal = (animal: AnimalDisponibleSalida, precio = 0, observaciones = ""): LineState => ({
  animal_id: animal.id,
  animal_codigo: animal.codigo,
  animal_arete: animal.arete ?? "",
  sexo: animal.sexo,
  edad_meses: animal.edad_meses ?? null,
  categoria_nombre: animal.categoria_nombre ?? animal.categoria_codigo ?? "",
  potrero_nombre: animal.potrero_nombre ?? "",
  grupo_nombre: animal.grupo_nombre ?? "",
  parcela_nombre: animal.parcela_nombre ?? "",
  peso: animal.peso ?? 0,
  precio,
  observaciones,
});

const fromExcel = (fila: SalidaExcelFila): LineState => ({
  animal_id: fila.animal_id,
  animal_codigo: fila.animal_codigo ?? "",
  animal_arete: fila.codigo_arete,
  sexo: fila.sexo ?? "",
  edad_meses: fila.edad_meses ?? null,
  categoria_nombre: fila.categoria_nombre ?? fila.categoria_codigo ?? "",
  potrero_nombre: fila.potrero_nombre ?? "",
  grupo_nombre: fila.grupo_nombre ?? "",
  parcela_nombre: fila.parcela_nombre ?? "",
  peso: fila.peso ?? 0,
  precio: fila.precio ?? 0,
  observaciones: "",
});

export default function SalidaForm() {
  const navigate = useNavigate();
  const { create, loading, error, setError } = useCreateSalida();

  const [tipos, setTipos] = useState<TipoSalida[]>([]);
  const [tipoId, setTipoId] = useState("");
  const [fechaSalida, setFechaSalida] = useState(today());
  const [clienteId, setClienteId] = useState("");
  const [descuento, setDescuento] = useState("0");
  const [observaciones, setObservaciones] = useState("");
  const [lines, setLines] = useState<LineState[]>([emptyLine()]);
  const [modo, setModo] = useState<"manual" | "excel">("manual");
  const [excelError, setExcelError] = useState<string | null>(null);
  const [excelLoading, setExcelLoading] = useState(false);
  const [excelFilas, setExcelFilas] = useState<SalidaExcelFila[]>([]);

  const tipoSeleccionado = useMemo(
    () => tipos.find((tipo) => String(tipo.id) === tipoId) ?? null,
    [tipos, tipoId]
  );
  const esVenta = isTipoVenta(tipoSeleccionado);

  const resumen = useMemo(() => {
    const lineas = lines.filter((linea) => linea.animal_id);
    const peso = lineas.reduce((acc, linea) => acc + (Number(linea.peso) || 0), 0);
    const monto = Math.max(
      lineas.reduce((acc, linea) => acc + lineSubtotal(Number(linea.precio) || 0, 0), 0) -
        (Number(descuento) || 0),
      0
    );
    return { cantidad: lineas.length, peso, monto };
  }, [lines, descuento]);

  useEffect(() => {
    const load = async () => {
      try {
        const tiposRes = await getTiposSalidas({
          estado: true,
          per_page: 100,
          page: 1,
          sort_by: "nombre",
          sort_dir: "asc",
        });
        setTipos(tiposRes.data);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los tipos de salida.");
      }
    };

    load();
  }, [setError]);

  const updateLine = (index: number, partial: Partial<LineState>) => {
    setLines((current) =>
      current.map((linea, currentIndex) =>
        currentIndex === index ? { ...linea, ...partial } : linea
      )
    );
  };

  const addLine = () => setLines((current) => [...current, emptyLine()]);

  const removeLine = (index: number) => {
    setLines((current) => (current.length === 1 ? [emptyLine()] : current.filter((_, i) => i !== index)));
  };

  const handleSelectAnimal = (index: number, animal: AnimalDisponibleSalida) => {
    updateLine(index, fromAnimal(animal, lines[index]?.precio ?? 0, lines[index]?.observaciones ?? ""));
  };

  const handlePlantilla = async () => {
    try {
      setExcelError(null);
      await downloadSalidaPlantilla();
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
      const preview = await previewSalidaExcel(file, tipoId ? Number(tipoId) : undefined);
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

    if (!tipoId) {
      setError("Debe seleccionar el tipo de salida.");
      return;
    }

    if (esVenta && !clienteId) {
      setError("Este tipo de salida requiere cliente o persona relacionada.");
      return;
    }

    const payload = lines.filter((linea) => linea.animal_id);
    if (payload.length === 0) {
      setError(
        modo === "excel" && excelFilas.length > 0
          ? "Ninguna fila del Excel es válida. Corrija el archivo o páselas al registro manual."
          : "Debe registrar al menos un animal."
      );
      return;
    }

    if (payload.some((linea) => (Number(linea.peso) || 0) < 0.01)) {
      setError("Cada animal debe tener un peso mayor a cero.");
      return;
    }

    if (esVenta && payload.some((linea) => (Number(linea.precio) || 0) < 0.01)) {
      setError("El precio de salida es obligatorio para una venta.");
      return;
    }

    try {
      const response = await create({
        tipo_salida_id: Number(tipoId),
        fecha_salida: fechaSalida,
        cliente_id: clienteId ? Number(clienteId) : null,
        descuento: esVenta ? Number(descuento || 0) : 0,
        observaciones: observaciones || null,
        detalles: payload.map((linea) => ({
          animal_id: linea.animal_id as number,
          peso: Number(linea.peso),
          precio: esVenta ? Number(linea.precio || 0) : 0,
          observaciones: linea.observaciones || null,
        })),
      });
      navigate(SALIDA_ROUTES.detail(response.data.id));
    } catch {
      // handled in hook
    }
  };

  const excludedIds = lines.map((linea) => linea.animal_id).filter((id): id is number => Boolean(id));

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
            El código se genera al confirmar. El cliente es obligatorio solo en ventas.
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-x-3 gap-y-3">
          <div className="w-full shrink-0 sm:w-[16.5rem]">
            <Label>Tipo de salida</Label>
            <Select
              value={tipoId}
              placeholder="Seleccione el tipo"
              options={tipos.map((tipo) => ({
                value: String(tipo.id),
                label: `${tipo.nombre} (${tipo.codigo})`,
              }))}
              onChange={(value) => {
                setTipoId(value);
                setClienteId("");
                setDescuento("0");
              }}
            />
          </div>
          <div className="w-full shrink-0 sm:w-[10.5rem]">
            <Label>Fecha de salida</Label>
            <InputField
              type="date"
              value={fechaSalida}
              onChange={(e) => setFechaSalida(e.target.value)}
            />
          </div>
          {esVenta && (
            <div className="w-full shrink-0 sm:w-[8.5rem]">
              <Label>Descuento (Bs)</Label>
              <InputField
                type="number"
                min="0"
                step={0.01}
                value={descuento}
                onChange={(e) => setDescuento(e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="relative z-10 min-w-0 w-full overflow-visible sm:min-w-[20rem]">
          <Label>
            {esVenta ? "Cliente o persona relacionada" : "Persona relacionada (opcional)"}
          </Label>
          <ClienteSearchSelect
            value={clienteId}
            required={esVenta}
            placeholder="Escriba para buscar por nombre"
            onChange={setClienteId}
          />
        </div>

        <div className="min-w-0 w-full">
          <Label>Observación general</Label>
          <TextArea
            rows={2}
            value={observaciones}
            onChange={setObservaciones}
            placeholder="Notas de la salida, si corresponde"
          />
        </div>
      </section>

      <section className={`${sectionClass} space-y-4`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90">Detalle de animales</h3>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              Solo animales activos. Potrero, sexo, edad, peso y categoría se completan al seleccionar el arete.
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
              La plantilla solo tiene dos columnas: <code>codigo_arete</code> y <code>precio</code>. El resto de datos se obtiene de la base.
            </p>
            {excelError && <p className="text-sm text-red-600 dark:text-red-300">{excelError}</p>}
            {excelFilas.length > 0 && (
              <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-white/[0.06]">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-left text-gray-500 dark:bg-white/[0.03] dark:text-gray-400">
                    <tr>
                      <th className="w-12 px-2 py-2 font-medium">Línea</th>
                      <th className="w-24 px-2 py-2 font-medium">Arete</th>
                      <th className="w-14 px-2 py-2 font-medium">Sexo</th>
                      <th className="w-14 px-2 py-2 font-medium">Edad</th>
                      <th className="w-16 px-2 py-2 font-medium">Peso</th>
                      <th className="w-20 px-2 py-2 font-medium">Precio</th>
                      <th className="px-2 py-2 font-medium">Potrero</th>
                      <th className="px-2 py-2 font-medium">Categoría</th>
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
                        <td className="whitespace-nowrap px-2 py-2">{formatSexo(fila.sexo)}</td>
                        <td className="whitespace-nowrap px-2 py-2">{fila.edad_meses ?? "—"}</td>
                        <td className="whitespace-nowrap px-2 py-2">{fila.peso ?? "—"}</td>
                        <td className="whitespace-nowrap px-2 py-2">{fila.precio}</td>
                        <td className="px-2 py-2">{fila.potrero_nombre || "—"}</td>
                        <td className="px-2 py-2">{fila.categoria_nombre || "—"}</td>
                        <td className="px-2 py-2">
                          {fila.valida ? "Lista" : fila.errores.join(" ")}
                        </td>
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
                      onClick={() => removeLine(index)}
                    >
                      Quitar
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap items-end gap-x-3 gap-y-3">
                  <div className="w-full shrink-0 sm:w-[12rem]">
                    <Label>Código de arete</Label>
                    <AnimalSearchField
                      excludedIds={excludedIds.filter((id) => id !== linea.animal_id)}
                      onSelect={(animal) => handleSelectAnimal(index, animal)}
                    />
                    {linea.animal_arete && (
                      <p className="mt-1 text-xs text-gray-500">
                        {linea.animal_arete}
                        {linea.animal_codigo ? ` · ${linea.animal_codigo}` : ""}
                      </p>
                    )}
                  </div>
                  <div className="w-full shrink-0 sm:w-[9rem]">
                    <Label>Sexo</Label>
                    <InputField type="text" value={formatSexo(linea.sexo || null)} disabled />
                  </div>
                  <div className="w-full shrink-0 sm:w-[6.25rem]">
                    <Label>Edad (meses)</Label>
                    <InputField type="text" value={linea.edad_meses != null ? String(linea.edad_meses) : ""} disabled />
                  </div>
                  <div className="min-w-0 w-full sm:min-w-[11rem] sm:flex-[1_1_11rem]">
                    <Label>Potrero</Label>
                    <InputField
                      type="text"
                      value={
                        [linea.potrero_nombre, linea.grupo_nombre].filter(Boolean).join(" / ") || ""
                      }
                      disabled
                    />
                  </div>
                  <div className="min-w-0 w-full sm:min-w-[11rem] sm:flex-[1_1_11rem]">
                    <Label>Categoría</Label>
                    <InputField type="text" value={linea.categoria_nombre} disabled />
                  </div>
                  <div className="w-full shrink-0 sm:w-[7rem]">
                    <Label>Peso (kg)</Label>
                    <InputField
                      type="number"
                      min="0"
                      step={0.01}
                      value={String(linea.peso)}
                      onChange={(e) => updateLine(index, { peso: Number(e.target.value) })}
                    />
                  </div>
                  {esVenta && (
                    <div className="w-full shrink-0 sm:w-[8rem]">
                      <Label>Precio (Bs)</Label>
                      <InputField
                        type="number"
                        min="0"
                        step={0.01}
                        value={String(linea.precio)}
                        onChange={(e) => updateLine(index, { precio: Number(e.target.value) })}
                      />
                    </div>
                  )}
                  <div className="min-w-0 w-full lg:min-w-[16rem] lg:flex-[1.6_1_16rem]">
                    <Label>Observaciones</Label>
                    <InputField
                      type="text"
                      placeholder="Opcional"
                      value={linea.observaciones}
                      onChange={(e) => updateLine(index, { observaciones: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            ))}
            <Button type="button" size="sm" variant="outline" onClick={addLine}>
              + Agregar animal
            </Button>
          </div>
        )}
      </section>

      <div className="flex flex-col gap-4 border-t border-gray-100 pt-4 dark:border-white/[0.06] sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <span className="font-medium text-gray-800 dark:text-white/90">{resumen.cantidad}</span> animales
          <span className="mx-2">·</span>
          {formatPeso(resumen.peso)}
          {esVenta && (
            <>
              <span className="mx-2">·</span>
              {formatMoney(resumen.monto)}
            </>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          <Button size="sm" variant="outline" type="button" onClick={() => navigate(SALIDA_ROUTES.list)}>
            Cancelar
          </Button>
          <Button size="sm" type="submit" disabled={loading}>
            {loading ? "Guardando..." : "Registrar salida"}
          </Button>
        </div>
      </div>
    </form>
  );
}
