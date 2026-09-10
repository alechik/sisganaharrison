import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import MultiSelect from "@/components/form/MultiSelect";
import Select from "@/components/form/Select";
import Button from "@/components/ui/button/Button";
import { ESTADO_CIVIL_OPTIONS, SEXO_OPTIONS, SOCIO_ROUTES } from "../constants";
import { useCreateSocio, useTipoPersonaOptions, useUpdateSocio } from "../hooks";
import { getSocio } from "../services";
import { SocioCreateRequest } from "../types";

interface Props {
  socioId?: number;
}

const emptyForm: SocioCreateRequest = {
  razon_social: "",
  responsable: "",
  email: "",
  fecha_nacimiento: "",
  ci: null,
  nit: "",
  celular: null,
  estado_civil: "",
  sexo: "",
  direccion: "",
  tipo_ids: [],
};

export default function SocioForm({ socioId }: Props) {
  const navigate = useNavigate();
  const isEdit = Boolean(socioId);
  const { tipoOptions, loading: loadingTipos, error: tiposError } = useTipoPersonaOptions();
  const { create, loading: creating, error: createError, setError: setCreateError } = useCreateSocio();
  const { update, loading: updating, error: updateError, setError: setUpdateError } = useUpdateSocio();

  const [form, setForm] = useState<SocioCreateRequest>(emptyForm);
  const [loading, setLoading] = useState(isEdit);

  const saving = creating || updating;
  const error = createError || updateError || tiposError;

  useEffect(() => {
    if (!socioId) {
      return;
    }

    const load = async () => {
      try {
        const socio = await getSocio(socioId);
        setForm({
          razon_social: socio.razon_social,
          responsable: socio.responsable ?? "",
          email: socio.email ?? "",
          fecha_nacimiento: socio.fecha_nacimiento ?? "",
          ci: socio.ci,
          nit: socio.nit ?? "",
          celular: socio.celular,
          estado_civil: socio.estado_civil ?? "",
          sexo: socio.sexo ?? "",
          direccion: socio.direccion ?? "",
          tipo_ids: (socio.tipos ?? []).map((tipo) => tipo.id),
        });
      } catch (err) {
        console.error(err);
        setUpdateError("No se pudo cargar el socio de negocio.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [socioId, setUpdateError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((current) => ({
      ...current,
      [name]: name === "ci" || name === "celular"
        ? value === "" ? null : Number(value)
        : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setUpdateError(null);

    const payload: SocioCreateRequest = {
      ...form,
      responsable: form.responsable || null,
      email: form.email || null,
      fecha_nacimiento: form.fecha_nacimiento || null,
      nit: form.nit || null,
      estado_civil: form.estado_civil || null,
      sexo: form.sexo || null,
      direccion: form.direccion || null,
    };

    try {
      if (isEdit && socioId) {
        await update(socioId, payload);
        navigate(SOCIO_ROUTES.detail(socioId));
      } else {
        const response = await create(payload);
        navigate(SOCIO_ROUTES.detail(response.data.id));
      }
    } catch {
      // handled in hooks
    }
  };

  if (loading || loadingTipos) {
    return <div>Cargando formulario...</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <MultiSelect
            label="Tipos de persona (Cliente, Proveedor o ambos)"
            options={tipoOptions}
            value={form.tipo_ids.map(String)}
            placeholder="Seleccione uno o más tipos"
            onChange={(selected) =>
              setForm((current) => ({
                ...current,
                tipo_ids: selected.map(Number),
              }))
            }
          />
        </div>

        <div>
          <Label>Razón social</Label>
          <InputField type="text" name="razon_social" value={form.razon_social} onChange={handleChange} />
        </div>
        <div>
          <Label>Responsable</Label>
          <InputField type="text" name="responsable" value={form.responsable ?? ""} onChange={handleChange} />
        </div>
        <div>
          <Label>Email</Label>
          <InputField type="email" name="email" value={form.email ?? ""} onChange={handleChange} />
        </div>
        <div>
          <Label>Celular</Label>
          <InputField type="number" name="celular" value={form.celular ?? ""} onChange={handleChange} />
        </div>
        <div>
          <Label>CI</Label>
          <InputField type="number" name="ci" value={form.ci ?? ""} onChange={handleChange} />
        </div>
        <div>
          <Label>NIT</Label>
          <InputField type="text" name="nit" value={form.nit ?? ""} onChange={handleChange} />
        </div>
        <div>
          <Label>Fecha de nacimiento</Label>
          <InputField type="date" name="fecha_nacimiento" value={form.fecha_nacimiento ?? ""} onChange={handleChange} />
        </div>
        <div>
          <Label>Sexo</Label>
          <Select
            value={form.sexo ?? ""}
            placeholder="Seleccione el sexo"
            options={SEXO_OPTIONS.map((item) => ({ value: item.value, label: item.label }))}
            onChange={(value) => setForm((current) => ({ ...current, sexo: value || null }))}
          />
        </div>
        <div>
          <Label>Estado civil</Label>
          <Select
            value={form.estado_civil ?? ""}
            placeholder="Seleccione el estado civil"
            options={ESTADO_CIVIL_OPTIONS.map((item) => ({ value: item.value, label: item.label }))}
            onChange={(value) => setForm((current) => ({ ...current, estado_civil: value || null }))}
          />
        </div>
        <div>
          <Label>Dirección</Label>
          <InputField type="text" name="direccion" value={form.direccion ?? ""} onChange={handleChange} />
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Button size="sm" type="submit" disabled={saving}>
          {saving ? "Guardando..." : isEdit ? "Actualizar socio" : "Guardar socio"}
        </Button>
        <Button size="sm" variant="outline" type="button" onClick={() => navigate(SOCIO_ROUTES.list)}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
