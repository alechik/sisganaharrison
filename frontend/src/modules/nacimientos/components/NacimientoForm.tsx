import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";
import { useAnimalReferenceOptions } from "@/modules/animales/hooks/useAnimalReferenceOptions";
import { getAnimal, getSiguienteCodigoAnimal } from "@/modules/animales/services";
import { getCategoriasAnimales } from "@/modules/categorias-animales/services";
import { CategoriaAnimal } from "@/modules/categorias-animales/types";
import {
  useCreateNacimiento,
  usePartoOptions,
  useRegistradoPorOptions,
  useUpdateNacimiento,
} from "../hooks";
import { ESTADOS_NACIMIENTO, NACIMIENTO_ROUTES, SEXOS_NACIMIENTO } from "../constants";
import { getNacimiento } from "../services";
import { NacimientoAnimalPayload, NacimientoCreateRequest } from "../types";

interface Props {
  nacimientoId?: number;
}

const emptyAnimal: NacimientoAnimalPayload = {
  arete: "",
  nombre: "",
  raza_id: null,
  estado_productivo_id: null,
  lote_id: null,
  color: "",
  observaciones: "",
};

const emptyForm: NacimientoCreateRequest = {
  parto_id: 0,
  arete: "",
  sexo: "",
  peso_nacimiento: null,
  estado_nacimiento: "",
  causa_muerte: "",
  observaciones: "",
  registrado_por: null,
  animal: emptyAnimal,
};

export default function NacimientoForm({ nacimientoId }: Props) {
  const navigate = useNavigate();
  const isEdit = Boolean(nacimientoId);
  const { create, loading: creating, error: createError, setError: setCreateError } = useCreateNacimiento();
  const { update, loading: updating, error: updateError, setError: setUpdateError } = useUpdateNacimiento();
  const { partoOptions, partos, loading: loadingPartos, error: partoError } = usePartoOptions({
    soloPendientes: true,
    incluirId: form.parto_id,
  });
  const { userOptions, loading: loadingUsers, error: userError } = useRegistradoPorOptions();
  const {
    razaOptions,
    estadoProductivoOptions,
    loteOptions,
    loading: loadingRefs,
    error: refsError,
  } = useAnimalReferenceOptions();

  const [form, setForm] = useState<NacimientoCreateRequest>(emptyForm);
  const [categorias, setCategorias] = useState<CategoriaAnimal[]>([]);
  const [codigoPreview, setCodigoPreview] = useState("");
  const [loading, setLoading] = useState(isEdit);
  const [validationError, setValidationError] = useState<string | null>(null);

  const saving = creating || updating;
  const esVivo = form.estado_nacimiento === "VIVO";
  const esMuerto = form.estado_nacimiento === "MUERTO";

  const categoriaCria = useMemo(() => {
    if (form.sexo !== "M" && form.sexo !== "H") {
      return null;
    }
    const codigo = form.sexo === "H" ? "TERNERA" : "TERNERO";
    return categorias.find((item) => item.codigo === codigo) ?? null;
  }, [categorias, form.sexo]);

  const fechaNacimiento = useMemo(() => {
    const parto = partos.find((item) => item.id === form.parto_id);
    return parto?.fecha_parto ?? "";
  }, [form.parto_id, partos]);

  useEffect(() => {
    const loadCategorias = async () => {
      try {
        const response = await getCategoriasAnimales({
          activo: true,
          per_page: 100,
          sort_by: "nombre",
          sort_dir: "asc",
        });
        setCategorias(response.data);
      } catch (err) {
        console.error(err);
      }
    };
    loadCategorias();
  }, []);

  useEffect(() => {
    if (!nacimientoId) {
      return;
    }
    const load = async () => {
      try {
        const data = await getNacimiento(nacimientoId);
        let animal = emptyAnimal;
        if (data.animal_id && data.estado_nacimiento === "VIVO") {
          const ficha = await getAnimal(data.animal_id);
          animal = {
            arete: ficha.arete ?? "",
            nombre: ficha.nombre ?? "",
            raza_id: ficha.raza_id,
            estado_productivo_id: ficha.estado_productivo_id,
            lote_id: ficha.lote_id,
            color: ficha.color ?? "",
            observaciones: ficha.observaciones ?? "",
          };
          setCodigoPreview(ficha.codigo);
        }
        setForm({
          parto_id: data.parto_id,
          arete: data.arete ?? "",
          sexo: data.sexo,
          peso_nacimiento: data.peso_nacimiento,
          estado_nacimiento: data.estado_nacimiento,
          causa_muerte: data.causa_muerte ?? "",
          observaciones: data.observaciones ?? "",
          registrado_por: data.registrado_por,
          animal,
        });
      } catch (err) {
        console.error(err);
        setUpdateError("No se pudo cargar el nacimiento.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [nacimientoId, setUpdateError]);

  useEffect(() => {
    if (!esVivo || !categoriaCria || isEdit) {
      if (!esVivo) {
        setCodigoPreview("");
      }
      return;
    }

    const loadCodigo = async () => {
      try {
        setCodigoPreview(await getSiguienteCodigoAnimal(categoriaCria.id));
      } catch (err) {
        console.error(err);
        setCodigoPreview("");
      }
    };
    loadCodigo();
  }, [categoriaCria, esVivo, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleAnimalChange = (partial: NacimientoAnimalPayload) => {
    setForm((current) => ({
      ...current,
      animal: { ...emptyAnimal, ...current.animal, ...partial },
      arete: partial.arete !== undefined ? partial.arete : current.arete,
    }));
  };

  const handleEstadoChange = (value: string) => {
    setForm((current) => ({
      ...current,
      estado_nacimiento: value,
      causa_muerte: value === "VIVO" ? "" : current.causa_muerte,
      animal: value === "VIVO" ? current.animal ?? emptyAnimal : emptyAnimal,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setUpdateError(null);
    setValidationError(null);

    if (!form.parto_id) {
      setValidationError("Debe seleccionar un parto.");
      return;
    }
    if (!form.estado_nacimiento) {
      setValidationError("Debe seleccionar el estado de nacimiento.");
      return;
    }
    if (!form.sexo) {
      setValidationError("Debe seleccionar el sexo.");
      return;
    }
    if (esMuerto && !form.causa_muerte?.trim()) {
      setValidationError("La causa de muerte es obligatoria para nacimientos muertos.");
      return;
    }

    const payload: NacimientoCreateRequest = esMuerto
      ? {
          parto_id: form.parto_id,
          sexo: form.sexo,
          peso_nacimiento: form.peso_nacimiento ? Number(form.peso_nacimiento) : null,
          estado_nacimiento: "MUERTO",
          causa_muerte: form.causa_muerte || null,
          observaciones: form.observaciones || null,
          registrado_por: form.registrado_por || null,
        }
      : {
          parto_id: form.parto_id,
          sexo: form.sexo,
          peso_nacimiento: form.peso_nacimiento ? Number(form.peso_nacimiento) : null,
          estado_nacimiento: "VIVO",
          causa_muerte: null,
          observaciones: form.observaciones || null,
          registrado_por: form.registrado_por || null,
          arete: form.animal?.arete || form.arete || null,
          animal: {
            arete: form.animal?.arete || null,
            nombre: form.animal?.nombre || null,
            raza_id: form.animal?.raza_id ?? null,
            estado_productivo_id: form.animal?.estado_productivo_id ?? null,
            lote_id: form.animal?.lote_id ?? null,
            color: form.animal?.color || null,
            observaciones: form.animal?.observaciones || null,
          },
        };

    try {
      if (isEdit && nacimientoId) {
        await update(nacimientoId, payload);
        navigate(NACIMIENTO_ROUTES.detail(nacimientoId));
      } else {
        const response = await create(payload);
        navigate(NACIMIENTO_ROUTES.detail(response.data.id));
      }
    } catch {
      // handled in hooks
    }
  };

  if (loading || loadingPartos || loadingUsers || loadingRefs) {
    return <div>Cargando formulario...</div>;
  }

  const displayError = validationError || createError || updateError || partoError || userError || refsError;

  return (
    <form onSubmit={handleSubmit}>
      {displayError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {displayError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <Label>Parto</Label>
          <Select
            value={form.parto_id ? String(form.parto_id) : ""}
            placeholder="Seleccione un parto"
            options={partoOptions}
            onChange={(value) => setForm((current) => ({ ...current, parto_id: Number(value) }))}
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Solo se listan partos pendientes.
          </p>
        </div>

        <div>
          <Label>Estado de nacimiento</Label>
          <Select
            value={form.estado_nacimiento}
            placeholder="Seleccione el estado"
            options={ESTADOS_NACIMIENTO.map((item) => ({ value: item.value, label: item.label }))}
            onChange={handleEstadoChange}
          />
        </div>

        <div>
          <Label>Registrado por (opcional)</Label>
          <Select
            value={form.registrado_por ? String(form.registrado_por) : ""}
            placeholder="Sin registrador"
            options={userOptions}
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                registrado_por: value ? Number(value) : null,
              }))
            }
          />
        </div>

        {esVivo && (
          <>
            <div className="md:col-span-2">
              <h3 className="text-base font-semibold text-gray-800 dark:text-white">Información del animal</h3>
              <p className="mt-1 text-xs text-gray-500">
                El código se genera con la misma lógica del módulo Animales. La categoría es Ternero/Ternera
                según el sexo. La fecha de nacimiento es la del parto.
              </p>
            </div>
            <div>
              <Label>Código (generado automáticamente)</Label>
              <InputField type="text" value={codigoPreview} disabled />
            </div>
            <div>
              <Label>Sexo</Label>
              <Select
                value={form.sexo}
                placeholder="Seleccione el sexo"
                options={SEXOS_NACIMIENTO.map((item) => ({ value: item.value, label: item.label }))}
                onChange={(value) => setForm((current) => ({ ...current, sexo: value }))}
              />
            </div>
            <div>
              <Label>Categoría</Label>
              <InputField
                type="text"
                value={categoriaCria ? `${categoriaCria.codigo} — ${categoriaCria.nombre}` : "Según el sexo"}
                disabled
              />
            </div>
            <div>
              <Label>Fecha de nacimiento</Label>
              <InputField type="date" value={fechaNacimiento} disabled />
            </div>
            <div>
              <Label>Arete</Label>
              <InputField
                type="text"
                value={form.animal?.arete ?? ""}
                onChange={(e) => handleAnimalChange({ arete: e.target.value.toUpperCase() })}
              />
            </div>
            <div>
              <Label>Nombre</Label>
              <InputField
                type="text"
                value={form.animal?.nombre ?? ""}
                onChange={(e) => handleAnimalChange({ nombre: e.target.value })}
              />
            </div>
            <div>
              <Label>Raza</Label>
              <Select
                value={form.animal?.raza_id ? String(form.animal.raza_id) : ""}
                placeholder="Sin raza"
                options={razaOptions}
                onChange={(value) => handleAnimalChange({ raza_id: value ? Number(value) : null })}
              />
            </div>
            <div>
              <Label>Estado productivo</Label>
              <Select
                value={form.animal?.estado_productivo_id ? String(form.animal.estado_productivo_id) : ""}
                placeholder="Sin estado"
                options={estadoProductivoOptions}
                onChange={(value) =>
                  handleAnimalChange({ estado_productivo_id: value ? Number(value) : null })
                }
              />
            </div>
            <div>
              <Label>Lote</Label>
              <Select
                value={form.animal?.lote_id ? String(form.animal.lote_id) : ""}
                placeholder="Sin lote"
                options={loteOptions}
                onChange={(value) => handleAnimalChange({ lote_id: value ? Number(value) : null })}
              />
            </div>
            <div>
              <Label>Madre</Label>
              <InputField type="text" value="Se toma del parto / servicio" disabled />
            </div>
            <div>
              <Label>Padre</Label>
              <InputField type="text" value="Se toma del parto / servicio" disabled />
            </div>
            <div>
              <Label>Color</Label>
              <InputField
                type="text"
                value={form.animal?.color ?? ""}
                onChange={(e) => handleAnimalChange({ color: e.target.value })}
              />
            </div>
            <div>
              <Label>Peso de nacimiento (kg)</Label>
              <InputField
                type="number"
                name="peso_nacimiento"
                step={0.01}
                value={form.peso_nacimiento ?? ""}
                onChange={handleChange}
              />
            </div>
            <div className="md:col-span-2">
              <Label>Observaciones del animal</Label>
              <TextArea
                rows={3}
                value={form.animal?.observaciones ?? ""}
                onChange={(value) => handleAnimalChange({ observaciones: value })}
              />
            </div>
            <div className="md:col-span-2">
              <Label>Observaciones del nacimiento</Label>
              <TextArea
                rows={3}
                value={form.observaciones ?? ""}
                onChange={(value) => setForm((current) => ({ ...current, observaciones: value }))}
              />
            </div>
          </>
        )}

        {esMuerto && (
          <>
            <div className="md:col-span-2">
              <h3 className="text-base font-semibold text-gray-800 dark:text-white">Información del nacimiento</h3>
            </div>
            <div>
              <Label>Sexo</Label>
              <Select
                value={form.sexo}
                placeholder="Seleccione el sexo"
                options={SEXOS_NACIMIENTO.map((item) => ({ value: item.value, label: item.label }))}
                onChange={(value) => setForm((current) => ({ ...current, sexo: value }))}
              />
            </div>
            <div>
              <Label>Peso de nacimiento (kg)</Label>
              <InputField
                type="number"
                name="peso_nacimiento"
                step={0.01}
                value={form.peso_nacimiento ?? ""}
                onChange={handleChange}
              />
            </div>
            <div className="md:col-span-2">
              <Label>Causa de muerte</Label>
              <InputField
                type="text"
                name="causa_muerte"
                value={form.causa_muerte ?? ""}
                onChange={handleChange}
              />
            </div>
            <div className="md:col-span-2">
              <Label>Observaciones</Label>
              <TextArea
                rows={4}
                value={form.observaciones ?? ""}
                onChange={(value) => setForm((current) => ({ ...current, observaciones: value }))}
              />
            </div>
          </>
        )}
      </div>

      <div className="mt-6 flex gap-3">
        <Button size="sm" type="submit" disabled={saving || !form.estado_nacimiento}>
          {saving ? "Guardando..." : isEdit ? "Actualizar Nacimiento" : "Registrar Nacimiento"}
        </Button>
        <Button size="sm" variant="outline" type="button" onClick={() => navigate(NACIMIENTO_ROUTES.list)}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
