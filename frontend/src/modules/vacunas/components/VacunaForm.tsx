import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";
import { VACUNA_ROUTES } from "../constants";
import { useCreateVacuna } from "../hooks/useCreateVacuna";
import { useUpdateVacuna } from "../hooks/useUpdateVacuna";
import { getVacuna } from "../services";
import { VacunaCreateRequest } from "../types";

interface Props {
  vacunaId?: number;
}

const emptyForm: VacunaCreateRequest = {
  codigo: "",
  nombre: "",
  laboratorio: "",
  descripcion: "",
};

export default function VacunaForm({ vacunaId }: Props) {
  const navigate = useNavigate();
  const isEdit = Boolean(vacunaId);

  const {
    create,
    loading: creating,
    error: createError,
    setError: setCreateError,
  } = useCreateVacuna();
  const {
    update,
    loading: updating,
    error: updateError,
    setError: setUpdateError,
  } = useUpdateVacuna();

  const [form, setForm] = useState<VacunaCreateRequest>(emptyForm);
  const [loading, setLoading] = useState(isEdit);

  const saving = creating || updating;
  const error = createError || updateError;

  useEffect(() => {
    if (!vacunaId) {
      return;
    }

    const loadVacuna = async () => {
      try {
        const vacuna = await getVacuna(vacunaId);
        setForm({
          codigo: vacuna.codigo,
          nombre: vacuna.nombre,
          laboratorio: vacuna.laboratorio ?? "",
          descripcion: vacuna.descripcion ?? "",
        });
      } catch (err) {
        console.error(err);
        setUpdateError("No se pudo cargar la vacuna.");
      } finally {
        setLoading(false);
      }
    };

    loadVacuna();
  }, [vacunaId, setUpdateError]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((current) => ({
      ...current,
      [name]: name === "codigo" ? value.toUpperCase() : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setUpdateError(null);

    try {
      if (isEdit && vacunaId) {
        await update(vacunaId, form);
        navigate(VACUNA_ROUTES.detail(vacunaId));
      } else {
        const response = await create(form);
        navigate(VACUNA_ROUTES.detail(response.data.id));
      }
    } catch {
      // Errors handled in hooks
    }
  };

  if (loading) {
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
        <div>
          <Label>Código</Label>
          <InputField
            type="text"
            name="codigo"
            value={form.codigo}
            onChange={handleChange}
            placeholder="Ej: AFTOSA"
          />
        </div>

        <div>
          <Label>Nombre</Label>
          <InputField
            type="text"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
          />
        </div>

        <div className="md:col-span-2">
          <Label>Laboratorio</Label>
          <InputField
            type="text"
            name="laboratorio"
            value={form.laboratorio ?? ""}
            onChange={handleChange}
            placeholder="Ej: Zoetis"
          />
        </div>

        <div className="md:col-span-2">
          <Label>Descripción</Label>
          <TextArea
            rows={4}
            value={form.descripcion ?? ""}
            onChange={(value) => setForm((current) => ({ ...current, descripcion: value }))}
          />
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Button size="sm" type="submit" disabled={saving}>
          {saving ? "Guardando..." : isEdit ? "Actualizar Vacuna" : "Guardar Vacuna"}
        </Button>

        <Button
          size="sm"
          variant="outline"
          type="button"
          onClick={() => navigate(VACUNA_ROUTES.list)}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
