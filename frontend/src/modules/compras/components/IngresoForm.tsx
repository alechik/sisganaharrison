import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import InputField from "@/components/form/input/InputField";
import Checkbox from "@/components/form/input/Checkbox";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";
import { getCategoriasAnimales } from "@/modules/categorias-animales/services";
import { CategoriaAnimal } from "@/modules/categorias-animales/types";
import { useGruposByLote } from "@/modules/grupos/hooks/useGruposByLote";
import { getLotes } from "@/modules/lotes/services";
import { Lote } from "@/modules/lotes/types";
import { getRazas } from "@/modules/razas/services";
import { Raza } from "@/modules/razas/types";
import { getTiposIngresos } from "@/modules/tipos-ingresos/services";
import { TipoIngreso } from "@/modules/tipos-ingresos/types";
import { INGRESO_ROUTES } from "../constants";
import { useCreateIngreso } from "../hooks/useCreateIngreso";
import { downloadIngresoPlantilla, previewIngresoExcel } from "../services";
import { IngresoDetalleRequest, IngresoExcelFila } from "../types";
import { formatMoney, formatPeso } from "../utils";
import ProveedorSearchSelect from "./ProveedorSearchSelect";

const emptyDetalle = (): IngresoDetalleRequest => ({
  arete: "",
  sexo: "H",
  edad: 0,
  peso_ingreso: 0,
  precio_compra: 0,
  categoria_id: 0,
  raza_id: 0,
  color: "",
  observaciones: "",
  castrado: false,
});

const sectionClass =
  "rounded-xl border border-gray-200 bg-gray-50/60 p-4 dark:border-white/[0.06] dark:bg-white/[0.02] sm:p-5";

export default function IngresoForm() {
  const navigate = useNavigate();
  const { create, loading, error, setError } = useCreateIngreso();

  const [tipos, setTipos] = useState<TipoIngreso[]>([]);
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [razas, setRazas] = useState<Raza[]>([]);
  const [categorias, setCategorias] = useState<CategoriaAnimal[]>([]);
  const [modo, setModo] = useState<"manual" | "excel">("manual");
  const [excelError, setExcelError] = useState<string | null>(null);
  const [excelLoading, setExcelLoading] = useState(false);

  const [tipoIngresoId, setTipoIngresoId] = useState("");
  const [proveedorId, setProveedorId] = useState("");
  const [loteId, setLoteId] = useState("");
  const [grupoId, setGrupoId] = useState("");
  const [fechaIngreso, setFechaIngreso] = useState(new Date().toISOString().slice(0, 10));
  const [descuento, setDescuento] = useState("0");
  const [observaciones, setObservaciones] = useState("");
  const [detalles, setDetalles] = useState<IngresoDetalleRequest[]>([emptyDetalle()]);
  const [excelFilas, setExcelFilas] = useState<IngresoExcelFila[]>([]);

  const loteNumero = loteId ? Number(loteId) : null;
  const { grupos, loading: loadingGrupos } = useGruposByLote(loteNumero);

  const tipoSeleccionado = useMemo(
    () => tipos.find((tipo) => String(tipo.id) === tipoIngresoId) ?? null,
    [tipos, tipoIngresoId]
  );

  const resumen = useMemo(() => {
    const lineas = detalles.filter((detalle) => detalle.arete.trim() !== "");
    const peso = lineas.reduce((acc, detalle) => acc + (Number(detalle.peso_ingreso) || 0), 0);
    const monto = Math.max(
      lineas.reduce((acc, detalle) => acc + (Number(detalle.precio_compra) || 0), 0) - (Number(descuento) || 0),
      0
    );
    return { cantidad: lineas.length, peso, monto };
  }, [detalles, descuento]);

  useEffect(() => {
    const load = async () => {
      try {
        const [tiposRes, lotesRes, razasRes, categoriasRes] = await Promise.all([
          getTiposIngresos({ estado: true, per_page: 100, sort_by: "nombre", sort_dir: "asc" }),
          getLotes({ activo: true, per_page: 100, sort_by: "nombre", sort_dir: "asc" }),
          getRazas({ estado: true, per_page: 100, sort_by: "nombre", sort_dir: "asc" }),
          getCategoriasAnimales({ activo: true, per_page: 100, sort_by: "nombre", sort_dir: "asc" }),
        ]);
        setTipos(tiposRes.data);
        setLotes(lotesRes.data);
        setRazas(razasRes.data);
        setCategorias(categoriasRes.data);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los catálogos del ingreso.");
      }
    };

    load();
  }, [setError]);

  useEffect(() => {
    setGrupoId("");
  }, [loteId]);

  const updateDetalle = (index: number, partial: Partial<IngresoDetalleRequest>) => {
    setDetalles((current) =>
      current.map((detalle, currentIndex) =>
        currentIndex === index ? { ...detalle, ...partial } : detalle
      )
    );
  };

  const addDetalle = () => setDetalles((current) => [...current, emptyDetalle()]);

  const removeDetalle = (index: number) => {
    setDetalles((current) => (current.length === 1 ? current : current.filter((_, i) => i !== index)));
  };

  const handlePlantilla = async () => {
    try {
      setExcelError(null);
      await downloadIngresoPlantilla();
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
      const preview = await previewIngresoExcel(file);
      setExcelFilas(preview.filas);
      const validas = preview.filas.filter((fila) => fila.valida && fila.categoria_id && fila.raza_id && fila.sexo);
      setDetalles(
        validas.length
          ? validas.map((fila) => ({
              arete: fila.arete,
              sexo: fila.sexo as "M" | "H",
              edad: fila.edad ?? 0,
              peso_ingreso: fila.peso_ingreso ?? 0,
              precio_compra: fila.precio_compra ?? 0,
              categoria_id: fila.categoria_id as number,
              raza_id: fila.raza_id as number,
              color: fila.color ?? "",
              observaciones: fila.observaciones ?? "",
              castrado: fila.castrado,
            }))
          : [emptyDetalle()]
      );
      setModo("excel");
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } })
        ?.response?.data;
      const message =
        data?.errors?.archivo?.[0] ?? data?.message ?? "No se pudo leer el archivo.";
      setExcelError(message);
    } finally {
      setExcelLoading(false);
    }
  };

  const removeExcelFila = (linea: number) => {
    const restantes = excelFilas.filter((fila) => fila.linea !== linea);
    setExcelFilas(restantes);
    setDetalles(
      restantes
        .filter((fila) => fila.valida && fila.categoria_id && fila.raza_id && fila.sexo)
        .map((fila) => ({
          arete: fila.arete,
          sexo: fila.sexo as "M" | "H",
          edad: fila.edad ?? 0,
          peso_ingreso: fila.peso_ingreso ?? 0,
          precio_compra: fila.precio_compra ?? 0,
          categoria_id: fila.categoria_id as number,
          raza_id: fila.raza_id as number,
          color: fila.color ?? "",
          observaciones: fila.observaciones ?? "",
          castrado: fila.castrado,
        }))
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!tipoIngresoId || !loteId || !grupoId) {
      setError("Complete tipo de ingreso, lote y grupo.");
      return;
    }

    if (tipoSeleccionado?.requiere_proveedor && !proveedorId) {
      setError("Este tipo de ingreso requiere proveedor o persona relacionada.");
      return;
    }

    const payloadDetalles = detalles.filter((detalle) => detalle.arete.trim() !== "");
    if (payloadDetalles.length === 0) {
      setError(
        modo === "excel" && excelFilas.length > 0
          ? "Ninguna fila del Excel es válida. Corrija el archivo o páselas al registro manual."
          : "Debe registrar al menos un animal."
      );
      return;
    }

    try {
      const response = await create({
        tipo_ingreso_id: Number(tipoIngresoId),
        proveedor_id: proveedorId ? Number(proveedorId) : null,
        lote_id: Number(loteId),
        grupo_id: Number(grupoId),
        fecha_ingreso: fechaIngreso,
        descuento: Number(descuento || 0),
        observaciones: observaciones || null,
        detalles: payloadDetalles.map((detalle) => ({
          ...detalle,
          arete: detalle.arete.trim().toUpperCase(),
          color: detalle.color || null,
          observaciones: detalle.observaciones || null,
        })),
      });
      navigate(INGRESO_ROUTES.detail(response.data.id));
    } catch {
      // handled in hook
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
            Datos generales del ingreso. El grupo se filtra según el lote.
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-x-3 gap-y-3">
          <div className="w-full shrink-0 sm:w-[16.5rem]">
            <Label>Tipo de ingreso</Label>
            <Select
              value={tipoIngresoId}
              placeholder="Seleccione el tipo"
              options={tipos.map((tipo) => ({
                value: String(tipo.id),
                label: `${tipo.nombre} (${tipo.codigo})`,
              }))}
              onChange={setTipoIngresoId}
            />
          </div>
          <div className="w-full shrink-0 sm:w-[10.5rem]">
            <Label>Fecha de ingreso</Label>
            <InputField
              type="date"
              value={fechaIngreso}
              onChange={(e) => setFechaIngreso(e.target.value)}
            />
          </div>
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
          <div className="min-w-0 w-full sm:min-w-[14rem] sm:flex-[1_1_14rem]">
            <Label>Lote</Label>
            <Select
              value={loteId}
              placeholder="Seleccione lote"
              options={lotes.map((lote) => ({
                value: String(lote.id),
                label: lote.codigo ? `${lote.codigo} — ${lote.nombre}` : lote.nombre,
              }))}
              onChange={setLoteId}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-x-3 gap-y-3">
          <div className="relative z-10 min-w-0 w-full overflow-visible sm:min-w-[20rem] sm:flex-[2_1_20rem]">
            <Label>
              {tipoSeleccionado?.requiere_proveedor
                ? "Proveedor o persona relacionada"
                : "Persona relacionada (opcional)"}
            </Label>
            <ProveedorSearchSelect
              value={proveedorId}
              required={Boolean(tipoSeleccionado?.requiere_proveedor)}
              placeholder="Escriba para buscar por nombre"
              onChange={setProveedorId}
            />
          </div>
          <div className="min-w-0 w-full sm:min-w-[12rem] sm:flex-[1_1_12rem]">
            <Label>Grupo</Label>
            <Select
              value={grupoId}
              placeholder={
                !loteId
                  ? "Seleccione primero un lote"
                  : loadingGrupos
                    ? "Cargando grupos..."
                    : "Seleccione grupo"
              }
              options={grupos.map((grupo) => ({
                value: String(grupo.id),
                label: grupo.nombre,
              }))}
              onChange={setGrupoId}
            />
          </div>
        </div>

        <div className="min-w-0 w-full">
          <Label>Observación general</Label>
          <TextArea
            rows={2}
            value={observaciones}
            onChange={setObservaciones}
            placeholder="Notas del ingreso, si corresponde"
          />
        </div>
      </section>

      <section className={`${sectionClass} space-y-4`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90">Detalle</h3>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              Cada fila genera un animal individual al confirmar.
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
                      <th className="px-2 py-2 font-medium">Categoría</th>
                      <th className="px-2 py-2 font-medium">Raza</th>
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
                        <td className="whitespace-nowrap px-2 py-2">{fila.arete || "—"}</td>
                        <td className="whitespace-nowrap px-2 py-2">{fila.sexo || "—"}</td>
                        <td className="whitespace-nowrap px-2 py-2">{fila.edad ?? "—"}</td>
                        <td className="whitespace-nowrap px-2 py-2">{fila.peso_ingreso ?? "—"}</td>
                        <td className="whitespace-nowrap px-2 py-2">{fila.precio_compra}</td>
                        <td className="px-2 py-2">{fila.categoria_nombre || fila.categoria || "—"}</td>
                        <td className="px-2 py-2">{fila.raza_nombre || fila.raza || "—"}</td>
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
                      setDetalles(
                        excelFilas.map((fila) => ({
                          arete: fila.arete,
                          sexo: (fila.sexo ?? "H") as "M" | "H",
                          edad: fila.edad ?? 0,
                          peso_ingreso: fila.peso_ingreso ?? 0,
                          precio_compra: fila.precio_compra ?? 0,
                          categoria_id: fila.categoria_id ?? 0,
                          raza_id: fila.raza_id ?? 0,
                          color: fila.color ?? "",
                          observaciones: fila.observaciones ?? "",
                          castrado: fila.castrado,
                        }))
                      );
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
            {detalles.map((detalle, index) => (
              <div
                key={index}
                className="rounded-lg border border-gray-200 bg-white p-3 dark:border-white/[0.06] dark:bg-white/[0.02] sm:p-4"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h4 className="text-sm font-medium text-gray-800 dark:text-white/90">
                    Animal {index + 1}
                  </h4>
                  {detalles.length > 1 && (
                    <button
                      type="button"
                      className="shrink-0 text-sm text-red-600 hover:underline dark:text-red-300"
                      onClick={() => removeDetalle(index)}
                    >
                      Quitar
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap items-end gap-x-3 gap-y-3">
                  <div className="w-full shrink-0 sm:w-[8.75rem]">
                    <Label>Arete</Label>
                    <InputField
                      type="text"
                      placeholder="Ej. AR-001"
                      value={detalle.arete}
                      onChange={(e) => updateDetalle(index, { arete: e.target.value.toUpperCase() })}
                    />
                  </div>
                  <div className="w-full shrink-0 sm:w-[9rem]">
                    <Label>Sexo</Label>
                    <Select
                      value={detalle.sexo}
                      options={[
                        { value: "H", label: "Hembra" },
                        { value: "M", label: "Macho" },
                      ]}
                      onChange={(value) => updateDetalle(index, { sexo: value as "M" | "H" })}
                    />
                  </div>
                  <div className="w-full shrink-0 sm:w-[6.25rem]">
                    <Label>Edad (meses)</Label>
                    <InputField
                      type="number"
                      min="0"
                      value={String(detalle.edad)}
                      onChange={(e) => updateDetalle(index, { edad: Number(e.target.value) })}
                    />
                  </div>
                  <div className="w-full shrink-0 sm:w-[7rem]">
                    <Label>Peso (kg)</Label>
                    <InputField
                      type="number"
                      min="0"
                      step={0.01}
                      value={String(detalle.peso_ingreso)}
                      onChange={(e) => updateDetalle(index, { peso_ingreso: Number(e.target.value) })}
                    />
                  </div>
                  <div className="w-full shrink-0 sm:w-[8rem]">
                    <Label>Precio (Bs)</Label>
                    <InputField
                      type="number"
                      min="0"
                      step={0.01}
                      value={String(detalle.precio_compra ?? 0)}
                      onChange={(e) => updateDetalle(index, { precio_compra: Number(e.target.value) })}
                    />
                  </div>
                  <div className="min-w-0 w-full sm:min-w-[13rem] sm:flex-[1.2_1_13rem]">
                    <Label>Categoría</Label>
                    <Select
                      value={detalle.categoria_id ? String(detalle.categoria_id) : ""}
                      placeholder="Seleccione categoría"
                      options={categorias.map((categoria) => ({
                        value: String(categoria.id),
                        label: `${categoria.codigo} — ${categoria.nombre}`,
                      }))}
                      onChange={(value) => updateDetalle(index, { categoria_id: Number(value) })}
                    />
                  </div>
                  <div className="min-w-0 w-full sm:min-w-[11rem] sm:flex-[1_1_11rem]">
                    <Label>Raza</Label>
                    <Select
                      value={detalle.raza_id ? String(detalle.raza_id) : ""}
                      placeholder="Seleccione raza"
                      options={razas.map((raza) => ({
                        value: String(raza.id),
                        label: raza.nombre,
                      }))}
                      onChange={(value) => updateDetalle(index, { raza_id: Number(value) })}
                    />
                  </div>
                  <div className="w-full shrink-0 sm:w-[8.5rem]">
                    <Label>Color</Label>
                    <InputField
                      type="text"
                      placeholder="Opcional"
                      value={detalle.color ?? ""}
                      onChange={(e) => updateDetalle(index, { color: e.target.value })}
                    />
                  </div>
                  <div className="flex h-11 shrink-0 items-center pb-0.5">
                    <Checkbox
                      label="Castrado"
                      checked={Boolean(detalle.castrado)}
                      onChange={(checked) => updateDetalle(index, { castrado: checked })}
                    />
                  </div>
                  <div className="min-w-0 w-full lg:min-w-[16rem] lg:flex-[1.6_1_16rem]">
                    <Label>Observaciones</Label>
                    <InputField
                      type="text"
                      placeholder="Opcional"
                      value={detalle.observaciones ?? ""}
                      onChange={(e) => updateDetalle(index, { observaciones: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            ))}
            <Button type="button" size="sm" variant="outline" onClick={addDetalle}>
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
          <span className="mx-2">·</span>
          {formatMoney(resumen.monto)}
        </div>
        <div className="flex flex-wrap gap-3">
          <Button size="sm" variant="outline" type="button" onClick={() => navigate(INGRESO_ROUTES.list)}>
            Cancelar
          </Button>
          <Button size="sm" type="submit" disabled={loading}>
            {loading ? "Guardando..." : "Registrar ingreso"}
          </Button>
        </div>
      </div>
    </form>
  );
}
