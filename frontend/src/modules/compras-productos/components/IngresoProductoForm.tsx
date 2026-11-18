import { useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { INGRESO_PRODUCTO_ROUTES } from "../constants";
import { useCreateIngresoProducto } from "../hooks";
import { downloadIngresoProductoPlantilla, previewIngresoProductoExcel } from "../services";
import { IngresoProductoExcelFila, ProductoDisponibleIngreso } from "../types";
import { formatMoney } from "../utils";
import AlmacenSelect, { AlmacenOption } from "./AlmacenSelect";
import ProductoSelect, { ProductoOption } from "./ProductoSelect";
import ProveedorSelect, { ProveedorOption } from "./ProveedorSelect";

interface LineState {
  producto_id: number | null;
  producto_codigo: string;
  producto_nombre: string;
  unidad: string;
  precio: number;
  cantidad: number;
  option: ProductoOption | null;
}

const emptyLine = (): LineState => ({
  producto_id: null,
  producto_codigo: "",
  producto_nombre: "",
  unidad: "",
  precio: 0,
  cantidad: 0,
  option: null,
});

const today = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
};

const sectionClass =
  "rounded-xl border border-gray-200 bg-gray-50/60 p-4 dark:border-white/[0.06] dark:bg-white/[0.02] sm:p-5";

const fromProducto = (producto: ProductoDisponibleIngreso, cantidad = 0, precio?: number): LineState => ({
  producto_id: producto.id,
  producto_codigo: producto.codigo,
  producto_nombre: producto.nombre,
  unidad: producto.presentacion_nombre ?? producto.presentacion_descripcion ?? "",
  precio: precio ?? Number(producto.precio ?? 0),
  cantidad,
  option: {
    value: producto.id,
    label: `${producto.codigo} · ${producto.nombre}`,
    producto,
  },
});

const fromExcel = (fila: IngresoProductoExcelFila): LineState => {
  if (!fila.producto_id) {
    return {
      ...emptyLine(),
      producto_codigo: fila.codigo_producto,
      precio: fila.precio ?? 0,
      cantidad: fila.cantidad ?? 0,
    };
  }

  const producto: ProductoDisponibleIngreso = {
    id: fila.producto_id,
    codigo: fila.producto_codigo ?? fila.codigo_producto,
    nombre: fila.producto_nombre ?? "",
    precio: fila.precio ?? 0,
    presentacion_nombre: fila.unidad,
    presentacion_descripcion: fila.unidad,
  };

  return fromProducto(producto, fila.cantidad ?? 0, fila.precio ?? 0);
};

export default function IngresoProductoForm() {
  const navigate = useNavigate();
  const { create, loading, error, setError } = useCreateIngresoProducto();

  const [modo, setModo] = useState<"manual" | "excel">("manual");
  const [excelError, setExcelError] = useState<string | null>(null);
  const [excelLoading, setExcelLoading] = useState(false);
  const [excelFilas, setExcelFilas] = useState<IngresoProductoExcelFila[]>([]);

  const [proveedor, setProveedor] = useState<ProveedorOption | null>(null);
  const [almacen, setAlmacen] = useState<AlmacenOption | null>(null);
  const [fecha, setFecha] = useState(today());
  const [descuento, setDescuento] = useState("0");
  const [lines, setLines] = useState<LineState[]>([emptyLine()]);

  const selectedIds = useMemo(
    () => lines.map((line) => line.producto_id).filter((id): id is number => id !== null),
    [lines]
  );

  const preview = useMemo(() => {
    const validas = lines.filter((line) => line.producto_id && line.cantidad > 0);
    const suma = validas.reduce((acc, line) => acc + line.cantidad * (Number(line.precio) || 0), 0);
    const desc = Number(descuento) || 0;
    return {
      unidades: validas.reduce((acc, line) => acc + line.cantidad, 0),
      suma,
      total: Math.max(suma - desc, 0),
    };
  }, [lines, descuento]);

  const updateLine = (index: number, partial: Partial<LineState>) => {
    setLines((current) => current.map((line, i) => (i === index ? { ...line, ...partial } : line)));
  };

  const handleSelectProducto = (index: number, option: ProductoOption | null) => {
    if (!option) {
      updateLine(index, emptyLine());
      return;
    }
    updateLine(index, fromProducto(option.producto, lines[index]?.cantidad || 0));
  };

  const handlePlantilla = async () => {
    try {
      setExcelError(null);
      await downloadIngresoProductoPlantilla();
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
      const data = await previewIngresoProductoExcel(file);
      setExcelFilas(data.filas);
    } catch (err: unknown) {
      const payload = (err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } })
        ?.response?.data;
      setExcelError(payload?.errors?.archivo?.[0] ?? payload?.message ?? "No se pudo leer el archivo.");
    } finally {
      setExcelLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!proveedor) {
      setError("Debe seleccionar un proveedor.");
      return;
    }
    if (!almacen) {
      setError("Debe seleccionar un almacén.");
      return;
    }

    const origen = modo === "excel" ? excelFilas.filter((fila) => fila.valida).map(fromExcel) : lines;
    const payload = origen.filter((line) => line.producto_id && line.cantidad > 0);
    if (payload.length === 0) {
      setError(
        modo === "excel" && excelFilas.length > 0
          ? "Ninguna fila del Excel es válida. Corrija el archivo o páselas al registro manual."
          : "Debe ingresar al menos un producto."
      );
      return;
    }
    if (payload.some((line) => line.precio < 0)) {
      setError("El precio no puede ser negativo.");
      return;
    }

    try {
      const response = await create({
        proveedor_id: proveedor.value,
        almacen_id: almacen.value,
        fecha,
        descuento: Number(descuento) || 0,
        detalles: payload.map((line) => ({
          producto_id: line.producto_id as number,
          cantidad: line.cantidad,
          precio: line.precio,
        })),
      });
      navigate(INGRESO_PRODUCTO_ROUTES.detail(response.data.id));
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
            El código se genera al confirmar. El total se calcula con el detalle y el descuento.
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-x-3 gap-y-3">
          <div className="w-full shrink-0 sm:w-[10.5rem]">
            <Label>Código</Label>
            <InputField type="text" value="INCO******" disabled />
          </div>
          <div className="w-full shrink-0 sm:w-[10.5rem]">
            <Label>Fecha</Label>
            <InputField type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
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
          <div className="relative z-20 min-w-0 w-full overflow-visible sm:min-w-[16rem] sm:flex-[1.4_1_16rem]">
            <Label>Proveedor</Label>
            <ProveedorSelect value={proveedor} onChange={setProveedor} />
          </div>
          <div className="relative z-10 min-w-0 w-full overflow-visible sm:min-w-[12rem] sm:flex-[1_1_12rem]">
            <Label>Almacén</Label>
            <AlmacenSelect value={almacen} onChange={setAlmacen} />
          </div>
        </div>
      </section>

      <section className={`${sectionClass} space-y-4`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90">Detalle de productos</h3>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              La unidad se obtiene del producto. El subtotal es precio × cantidad.
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
              Columnas: <code>codigo_producto</code>, <code>cantidad</code> y <code>precio</code>. Nada se guarda hasta
              confirmar el ingreso.
            </p>
            {excelError && <p className="text-sm text-red-600 dark:text-red-300">{excelError}</p>}
            {excelFilas.length > 0 && (
              <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-white/[0.06]">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-left text-gray-500 dark:bg-white/[0.03] dark:text-gray-400">
                    <tr>
                      <th className="w-12 px-2 py-2 font-medium">Línea</th>
                      <th className="px-2 py-2 font-medium">Producto</th>
                      <th className="w-24 px-2 py-2 font-medium">Unidad</th>
                      <th className="w-20 px-2 py-2 font-medium">Cantidad</th>
                      <th className="w-24 px-2 py-2 font-medium">Precio</th>
                      <th className="w-24 px-2 py-2 font-medium">Subtotal</th>
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
                        <td className="px-2 py-2">
                          {fila.producto_codigo
                            ? `${fila.producto_codigo} · ${fila.producto_nombre || ""}`
                            : fila.codigo_producto || "—"}
                        </td>
                        <td className="whitespace-nowrap px-2 py-2">{fila.unidad || "—"}</td>
                        <td className="whitespace-nowrap px-2 py-2">{fila.cantidad ?? "—"}</td>
                        <td className="whitespace-nowrap px-2 py-2">
                          {fila.precio !== null ? formatMoney(fila.precio) : "—"}
                        </td>
                        <td className="whitespace-nowrap px-2 py-2">{formatMoney(fila.subtotal)}</td>
                        <td className="px-2 py-2">{fila.valida ? "Lista" : fila.errores.join(" ")}</td>
                        <td className="px-2 py-2">
                          <button
                            type="button"
                            className="text-sm text-red-600 hover:underline dark:text-red-300"
                            onClick={() => setExcelFilas((current) => current.filter((item) => item.linea !== fila.linea))}
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
          <div className="space-y-2">
            {lines.map((linea, index) => {
              const subtotal = Math.max((linea.cantidad || 0) * (linea.precio || 0), 0);
              return (
                <div key={index} className="flex flex-wrap items-end gap-x-3 gap-y-2">
                  <div className="relative z-10 min-w-0 w-full overflow-visible sm:min-w-[16rem] sm:flex-[1.8_1_16rem]">
                    {index === 0 ? <Label>Código / Nombre</Label> : null}
                    <ProductoSelect
                      value={linea.option}
                      excludedIds={selectedIds.filter((id) => id !== linea.producto_id)}
                      onChange={(option) => handleSelectProducto(index, option)}
                    />
                  </div>
                  <div className="w-full shrink-0 sm:w-[7.5rem]">
                    {index === 0 ? <Label>Unidad</Label> : null}
                    <InputField type="text" value={linea.unidad} disabled />
                  </div>
                  <div className="w-full shrink-0 sm:w-[7rem]">
                    {index === 0 ? <Label>Precio</Label> : null}
                    <InputField
                      type="number"
                      min="0"
                      step={0.01}
                      value={linea.precio ? String(linea.precio) : ""}
                      onChange={(e) => updateLine(index, { precio: Number(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="w-full shrink-0 sm:w-[6.5rem]">
                    {index === 0 ? <Label>Cantidad</Label> : null}
                    <InputField
                      type="number"
                      min="1"
                      step={1}
                      value={linea.cantidad ? String(linea.cantidad) : ""}
                      onChange={(e) => updateLine(index, { cantidad: Number(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="w-full shrink-0 sm:w-[7.5rem]">
                    {index === 0 ? <Label>Subtotal</Label> : null}
                    <InputField type="text" value={formatMoney(subtotal)} disabled />
                  </div>
                  <div className={`shrink-0 pb-2 ${index === 0 ? "sm:pb-0 sm:pt-6" : ""}`}>
                    {lines.length > 1 ? (
                      <button
                        type="button"
                        className="text-sm text-red-600 hover:underline dark:text-red-300"
                        onClick={() =>
                          setLines((current) =>
                            current.length === 1 ? [emptyLine()] : current.filter((_, i) => i !== index)
                          )
                        }
                      >
                        Quitar
                      </button>
                    ) : (
                      <span className="inline-block w-12" />
                    )}
                  </div>
                </div>
              );
            })}
            <Button type="button" size="sm" variant="outline" onClick={() => setLines((current) => [...current, emptyLine()])}>
              + Agregar producto
            </Button>
          </div>
        )}

        <div className="mt-2 flex justify-end">
          <div className="min-w-[14rem] space-y-1 text-right text-sm text-gray-600 dark:text-gray-300">
            <p>Unidades: {preview.unidades}</p>
            <p>Suma de líneas: {formatMoney(preview.suma)}</p>
            <p>Descuento: {formatMoney(Number(descuento) || 0)}</p>
            <p className="text-base font-semibold text-gray-800 dark:text-white">
              Monto total: {formatMoney(preview.total)}
            </p>
          </div>
        </div>
      </section>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => navigate(INGRESO_PRODUCTO_ROUTES.list)}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Guardando..." : "Registrar ingreso"}
        </Button>
      </div>
    </form>
  );
}
