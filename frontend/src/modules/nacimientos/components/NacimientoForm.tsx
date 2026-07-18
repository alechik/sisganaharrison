import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";
import {
  useAnimalOptions,
  useCreateNacimiento,
  usePartoOptions,
  useRegistradoPorOptions,
  useUpdateNacimiento,
} from "../hooks";
import { ESTADOS_NACIMIENTO, NACIMIENTO_ROUTES, SEXOS_NACIMIENTO } from "../constants";
import { getNacimiento } from "../services";
import { NacimientoCreateRequest } from "../types";

interface Props {
  nacimientoId?: number;
}

const emptyForm: NacimientoCreateRequest = {
  parto_id: 0,
  animal_id: null,
  arete: "",
  sexo: "",
  peso_nacimiento: null,
  estado_nacimiento: "VIVO",
  causa_muerte: "",
  observaciones: "",
  registrado_por: null,
};

export default function NacimientoForm({ nacimientoId }: Props) {
  const navigate = useNavigate();
  const isEdit = Boolean(nacimientoId);
  const { create, loading: creating, error: createError, setError: setCreateError } = useCreateNacimiento();
  const { update, loading: updating, error: updateError, setError: setUpdateError } = useUpdateNacimiento();
  const { partoOptions, loading: loadingPartos, error: partoError } = usePartoOptions();
  const { animalOptions, loading: loadingAnimales, error: animalError } = useAnimalOptions();
  const { userOptions, loading: loadingUsers, error: userError } = useRegistradoPorOptions();

  const [form, setForm] = useState<NacimientoCreateRequest>(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [validationError, setValidationError] = useState<string | null>(null);

  const saving = creating || updating;
  const error = createError || updateError;
  const esMuerto = form.estado_nacimiento === "MUERTO";

  useEffect(() => {
    if (!nacimientoId) return;
    const load = async () => {
      try {
        const data = await getNacimiento(nacimientoId);
        setForm({
          parto_id: data.parto_id,
          animal_id: data.animal_id,
          arete: data.arete ?? "",
          sexo: data.sexo,
          peso_nacimiento: data.peso_nacimiento,
          estado_nacimiento: data.estado_nacimiento,
          causa_muerte: data.causa_muerte ?? "",
          observaciones: data.observaciones ?? "",
          registrado_por: data.registrado_por,
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleEstadoChange = (value: string) => {
    setForm((current) => ({
      ...current,
      estado_nacimiento: value,
      animal_id: value === "MUERTO" ? null : current.animal_id,
      causa_muerte: value === "VIVO" ? "" : current.causa_muerte,
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
    if (!form.sexo) {
      setValidationError("Debe seleccionar el sexo.");
      return;
    }
    if (!form.estado_nacimiento) {
      setValidationError("Debe seleccionar el estado de nacimiento.");
      return;
    }
    if (esMuerto && !form.causa_muerte?.trim()) {
      setValidationError("La causa de muerte es obligatoria para nacimientos muertos.");
      return;
    }

    const payload: NacimientoCreateRequest = {
      ...form,
      animal_id: esMuerto ? null : form.animal_id || null,
      arete: form.arete || null,
      peso_nacimiento: form.peso_nacimiento ? Number(form.peso_nacimiento) : null,
      causa_muerte: esMuerto ? form.causa_muerte || null : null,
      observaciones: form.observaciones || null,
      registrado_por: form.registrado_por || null,
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

  if (loading || loadingPartos || loadingAnimales || loadingUsers) {
    return <div>Cargando formulario...</div>;
  }

  const displayError = validationError || error || partoError || animalError || userError;

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
        </div>

        <div>
          <Label>Estado de nacimiento</Label>
          <Select
            value={form.estado_nacimiento}
            options={ESTADOS_NACIMIENTO.map((item) => ({ value: item.value, label: item.label }))}
            onChange={handleEstadoChange}
          />
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
          <Label>Arete de la cría</Label>
          <InputField type="text" name="arete" value={form.arete ?? ""} onChange={handleChange} />
        </div>

        <div>
          <Label>Peso al nacer (kg)</Label>
          <InputField
            type="number"
            name="peso_nacimiento"
            step={0.01}
            value={form.peso_nacimiento ?? ""}
            onChange={handleChange}
          />
        </div>

        {!esMuerto && (
          <div className="md:col-span-2">
            <Label>Animal vinculado (opcional)</Label>
            <Select
              value={form.animal_id ? String(form.animal_id) : ""}
              placeholder="Sin animal vinculado"
              options={animalOptions}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  animal_id: value ? Number(value) : null,
                }))
              }
            />
          </div>
        )}

        {esMuerto && (
          <div className="md:col-span-2">
            <Label>Causa de muerte</Label>
            <InputField
              type="text"
              name="causa_muerte"
              value={form.causa_muerte ?? ""}
              onChange={handleChange}
            />
          </div>
        )}

        <div className="md:col-span-2">
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

        <div className="md:col-span-2">
          <Label>Observaciones</Label>
          <TextArea
            rows={4}
            value={form.observaciones ?? ""}
            onChange={(value) => setForm((current) => ({ ...current, observaciones: value }))}
          />
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Button size="sm" type="submit" disabled={saving}>
          {saving ? "Guardando..." : isEdit ? "Actualizar Nacimiento" : "Registrar Nacimiento"}
        </Button>
        <Button size="sm" variant="outline" type="button" onClick={() => navigate(NACIMIENTO_ROUTES.list)}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
