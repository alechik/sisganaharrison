import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import RegistradoPorField from "@/components/form/RegistradoPorField";
import Select from "@/components/form/Select";
import Button from "@/components/ui/button/Button";
import { ANIMAL_SEXO_OPTIONS } from "@/modules/animales/constants";
import { getSiguienteCodigoAnimal } from "@/modules/animales/services";
import { getCategoriasAnimales } from "@/modules/categorias-animales/services";
import { CategoriaAnimal } from "@/modules/categorias-animales/types";
import { mensajeCategoriaIncompatible } from "@/modules/categorias-animales/utils";
import { getSocios } from "@/modules/socios-de-negocio/services";
import { ORDEN_COMPRA_ROUTES } from "../constants";
import { useCreateOrdenCompra, useUpdateOrdenCompra } from "../hooks";
import { getOrdenCompra } from "../services";
import { OrdenCompraCreateRequest, OrdenCompraDetalleRequest } from "../types";
import { formatMoney, formatPeso } from "../utils";

interface Props {
  ordenId?: number;
}

const emptyLine = (): OrdenCompraDetalleRequest => ({
  categoria_animal_id: 0,
  sexo: "",
  animal_id: null,
  animal_codigo: "",
  cantidad: 1,
  peso: 0,
  edad: 0,
  castrado: false,
  precio: 0,
  descuento: 0,
});

const today = () => new Date().toISOString().slice(0, 10);

export default function OrdenCompraForm({ ordenId }: Props) {
  const navigate = useNavigate();
  const isEdit = Boolean(ordenId);
  const { create, loading: creating, error: createError, setError: setCreateError } =
    useCreateOrdenCompra();
  const { update, loading: updating, error: updateError, setError: setUpdateError } =
    useUpdateOrdenCompra();

  const [proveedores, setProveedores] = useState<{ value: string; label: string }[]>([]);
  const [categorias, setCategorias] = useState<{ value: string; label: string }[]>([]);
  const [categoriasData, setCategoriasData] = useState<CategoriaAnimal[]>([]);
  const [form, setForm] = useState<OrdenCompraCreateRequest>({
    proveedor_id: 0,
    fecha: today(),
    descuento: 0,
    detalles: [emptyLine()],
  });
  const [loading, setLoading] = useState(isEdit);
  const [registradoPorNombre, setRegistradoPorNombre] = useState<string | null>(null);

  const saving = creating || updating;
  const error = createError || updateError;

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [socios, cats] = await Promise.all([
          getSocios({ tiene_tipo: "PROVEEDOR", per_page: 100, page: 1 }),
          getCategoriasAnimales({ activo: true, per_page: 100, page: 1 }),
        ]);
        setProveedores(
          socios.data.map((socio) => ({
            value: String(socio.id),
            label: socio.razon_social,
          }))
        );
        setCategoriasData(cats.data);
        setCategorias(
          cats.data.map((categoria) => ({
            value: String(categoria.id),
            label: `${categoria.codigo} — ${categoria.nombre}`,
          }))
        );
      } catch (err) {
        console.error(err);
        setCreateError("No se pudieron cargar proveedores o categorías.");
      }
    };

    loadOptions();
  }, [setCreateError]);

  useEffect(() => {
    if (!ordenId) {
      return;
    }

    const load = async () => {
      try {
        const orden = await getOrdenCompra(ordenId);
        setForm({
          proveedor_id: orden.proveedor_id,
          fecha: orden.fecha,
          descuento: orden.descuento,
          detalles: (orden.detalles ?? []).map((detalle) => ({
            categoria_animal_id: detalle.categoria_animal_id,
            sexo: detalle.sexo ?? "",
            animal_id: detalle.animal_id ?? null,
            animal_codigo: detalle.animal_codigo ?? "",
            cantidad: detalle.cantidad,
            peso: detalle.peso,
            edad: detalle.edad ?? 0,
            castrado: Boolean(detalle.castrado),
            precio: detalle.precio,
            descuento: detalle.descuento,
          })),
        });
        setRegistradoPorNombre(orden.creador_nombre ?? null);
      } catch (err) {
        console.error(err);
        setUpdateError("No se pudo cargar la orden de compra.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [ordenId, setUpdateError]);

  const lineSubtotal = (line: OrdenCompraDetalleRequest) =>
    Math.max((line.cantidad || 0) * (line.precio || 0) - (line.descuento || 0), 0);

  const preview = useMemo(() => {
    const suma = form.detalles.reduce((acc, line) => acc + lineSubtotal(line), 0);
    const totalPeso = form.detalles.reduce(
      (acc, line) => acc + (line.cantidad || 0) * (line.peso || 0),
      0
    );
    const descuentoCabecera = form.descuento ?? 0;
    const identificados = form.detalles.reduce((acc, line) => acc + (line.cantidad || 0), 0);
    return {
      suma,
      totalPeso,
      total: Math.max(suma - descuentoCabecera, 0),
      identificados,
    };
  }, [form.detalles, form.descuento]);

  const updateLine = (index: number, partial: Partial<OrdenCompraDetalleRequest>) => {
    setForm((current) => ({
      ...current,
      detalles: current.detalles.map((line, i) => (i === index ? { ...line, ...partial } : line)),
    }));
  };

  const previewCodigo = async (index: number, categoriaId: number, animalId?: number | null) => {
    if (!categoriaId || animalId) {
      return;
    }
    try {
      const codigo = await getSiguienteCodigoAnimal(categoriaId);
      updateLine(index, { categoria_animal_id: categoriaId, animal_codigo: codigo });
    } catch (err) {
      console.error(err);
    }
  };

  const addLine = () => {
    setForm((current) => ({ ...current, detalles: [...current.detalles, emptyLine()] }));
  };

  const removeLine = (index: number) => {
    setForm((current) => ({
      ...current,
      detalles: current.detalles.length === 1 ? current.detalles : current.detalles.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.proveedor_id) {
      setCreateError("Debe seleccionar un proveedor.");
      return;
    }

    if (
      form.detalles.some(
        (line) =>
          !line.categoria_animal_id ||
          (line.sexo !== "M" && line.sexo !== "H") ||
          line.cantidad < 1 ||
          !line.peso ||
          line.peso <= 0 ||
          line.edad === undefined ||
          line.edad === null ||
          line.edad < 0
      )
    ) {
      setCreateError("Cada animal debe tener categoría, sexo, cantidad, edad inicial (meses) y peso del ejemplar mayor a cero.");
      return;
    }

    for (const line of form.detalles) {
      const incompatibilidad = mensajeCategoriaIncompatible({
        categoria: categoriasData.find((item) => item.id === line.categoria_animal_id),
        sexo: line.sexo,
        edad: line.edad,
        castrado: line.castrado,
      });
      if (incompatibilidad) {
        setCreateError(incompatibilidad);
        return;
      }
    }

    const payload: OrdenCompraCreateRequest = {
      ...form,
      descuento: form.descuento ?? 0,
      detalles: form.detalles.map((line) => ({
        categoria_animal_id: line.categoria_animal_id,
        sexo: line.sexo,
        animal_id: line.animal_id || null,
        cantidad: line.cantidad,
        peso: line.peso,
        edad: line.edad ?? 0,
        castrado: Boolean(line.castrado),
        precio: line.precio,
        descuento: line.descuento ?? 0,
      })),
    };

    try {
      if (isEdit && ordenId) {
        await update(ordenId, payload);
      } else {
        await create(payload);
      }
      navigate(ORDEN_COMPRA_ROUTES.list);
    } catch {
      // handled
    }
  };

  if (loading) {
    return <div>Cargando formulario...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {!isEdit && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200">
          Esta es una solicitud o autorización previa. Si la compra ya se efectuó, registre una
          cuarentena directa (compra efectuada) sin orden.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label>Proveedor</Label>
          <Select
            value={form.proveedor_id ? String(form.proveedor_id) : ""}
            placeholder="Seleccione un proveedor"
            options={proveedores}
            onChange={(value) => setForm((current) => ({ ...current, proveedor_id: Number(value) }))}
          />
        </div>
        <div>
          <Label>Fecha</Label>
          <InputField
            type="date"
            value={form.fecha}
            onChange={(e) => setForm((current) => ({ ...current, fecha: e.target.value }))}
          />
        </div>
        <div>
          <Label>Descuento general</Label>
          <InputField
            type="number"
            value={String(form.descuento ?? 0)}
            onChange={(e) =>
              setForm((current) => ({ ...current, descuento: Number(e.target.value) || 0 }))
            }
          />
        </div>
        {isEdit ? <RegistradoPorField nombre={registradoPorNombre} /> : null}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 dark:text-white">Animales identificados</h3>
          <Button type="button" size="sm" variant="outline" onClick={addLine}>
            + Animal
          </Button>
        </div>
        <p className="text-sm text-gray-500">
          La cantidad genera un animal preliminar por cada ejemplar (código propio). Datos comunes
          de la línea se copian; arete, raza y fecha de nacimiento se completan en el Ingreso.
        </p>
        {form.detalles.map((line, index) => (
          <div
            key={index}
            className="grid grid-cols-1 gap-3 rounded-xl border border-gray-200 p-4 dark:border-white/[0.05] md:grid-cols-6"
          >
            <div>
              <Label>Código</Label>
              <InputField type="text" value={line.animal_codigo || "Se asigna al guardar"} disabled />
            </div>
            <div>
              <Label>Sexo</Label>
              <Select
                value={line.sexo}
                placeholder="Sexo"
                options={ANIMAL_SEXO_OPTIONS.map((option) => ({
                  value: option.value,
                  label: option.label,
                }))}
                onChange={(value) =>
                  updateLine(index, {
                    sexo: value as "M" | "H",
                    castrado: value === "H" ? false : line.castrado,
                  })
                }
              />
            </div>
            {line.sexo === "M" ? (
              <div className="flex items-end pb-2">
                <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={Boolean(line.castrado)}
                    onChange={(e) => updateLine(index, { castrado: e.target.checked })}
                  />
                  Castrado
                </label>
              </div>
            ) : null}
            <div className="md:col-span-2">
              <Label>Categoría</Label>
              <Select
                value={line.categoria_animal_id ? String(line.categoria_animal_id) : ""}
                placeholder="Seleccione categoría"
                options={categorias}
                onChange={(value) => {
                  const categoriaId = Number(value);
                  const regla = categoriasData.find((item) => item.id === categoriaId)?.regla;
                  updateLine(index, {
                    categoria_animal_id: categoriaId,
                    animal_id: null,
                    animal_codigo: "",
                    castrado:
                      line.sexo === "H"
                        ? false
                        : regla?.castrado === true
                          ? true
                          : regla?.castrado === false
                            ? false
                            : Boolean(line.castrado),
                  });
                  void previewCodigo(index, categoriaId, null);
                }}
              />
            </div>
            <div>
              <Label>Cantidad</Label>
              <InputField
                type="number"
                value={String(line.cantidad)}
                onChange={(e) => updateLine(index, { cantidad: Number(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label>Edad inicial (meses)</Label>
              <InputField
                type="number"
                value={String(line.edad ?? 0)}
                onChange={(e) => updateLine(index, { edad: Number(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label>Peso ejemplar (kg)</Label>
              <InputField
                type="number"
                step={0.01}
                value={String(line.peso ?? 0)}
                onChange={(e) => updateLine(index, { peso: Number(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label>Precio</Label>
              <InputField
                type="number"
                value={String(line.precio)}
                onChange={(e) => updateLine(index, { precio: Number(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label>Desc. línea</Label>
              <InputField
                type="number"
                value={String(line.descuento ?? 0)}
                onChange={(e) => updateLine(index, { descuento: Number(e.target.value) || 0 })}
              />
            </div>
            <div className="flex items-end justify-between gap-2 md:col-span-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Peso línea: {formatPeso((line.cantidad || 0) * (line.peso || 0))} · Subtotal:{" "}
                {formatMoney(lineSubtotal(line))}
              </p>
              <Button type="button" size="sm" variant="outline" onClick={() => removeLine(index)}>
                Quitar
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-gray-50 p-4 text-sm dark:bg-white/[0.03]">
        <p>Animales identificados: {preview.identificados}</p>
        <p>Total peso: {formatPeso(preview.totalPeso)}</p>
        <p>Suma de líneas: {formatMoney(preview.suma)}</p>
        <p>Descuento general: {formatMoney(form.descuento ?? 0)}</p>
        <p className="font-semibold text-gray-800 dark:text-white">
          Monto total: {formatMoney(preview.total)}
        </p>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => navigate(ORDEN_COMPRA_ROUTES.list)}>
          Cancelar
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Guardando..." : isEdit ? "Guardar cambios" : "Registrar orden"}
        </Button>
      </div>
    </form>
  );
}
