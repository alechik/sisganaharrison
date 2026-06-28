import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";
import { getRaza } from "../services";
import { useCreateRaza } from "../hooks/useCreateRaza";
import { useUpdateRaza } from "../hooks/useUpdateRaza";
import { RAZA_ROUTES } from "../constants";
import { RazaCreateRequest } from "../types";

interface Props {
  razaId?: number;
}

const emptyForm: RazaCreateRequest = {
  nombre: "",
  codigo: "",
  descripcion: "",
};

export default function RazaForm({ razaId }: Props) {
  const navigate = useNavigate();
  const isEdit = Boolean(razaId);

  const { create, loading: creating, error: createError, setError: setCreateError } = useCreateRaza();
  const { update, loading: updating, error: updateError, setError: setUpdateError } = useUpdateRaza();

  const [form, setForm] = useState<RazaCreateRequest>(emptyForm);
  const [loading, setLoading] = useState(isEdit);

  const saving = creating || updating;
  const error = createError || updateError;

  useEffect(() => {
    if (!razaId) {
      return;
    }

    const loadRaza = async () => {
      try {
        const raza = await getRaza(razaId);
        setForm({
          nombre: raza.nombre,
          codigo: raza.codigo,
          descripcion: raza.descripcion ?? "",
        });
      } catch (err) {
        console.error(err);
        setUpdateError("No se pudo cargar la raza.");
      } finally {
        setLoading(false);
      }
    };

    loadRaza();
  }, [razaId, setUpdateError]);

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
      if (isEdit && razaId) {
        await update(razaId, form);
        navigate(RAZA_ROUTES.detail(razaId));
      } else {
        const response = await create(form);
        navigate(RAZA_ROUTES.detail(response.data.id));
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
          <Label>Nombre</Label>
          <InputField
            type="text"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
          />
        </div>

        <div>
          <Label>Código</Label>
          <InputField
            type="text"
            name="codigo"
            value={form.codigo}
            onChange={handleChange}
            placeholder="Ej: BRAHMAN"
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
          {saving ? "Guardando..." : isEdit ? "Actualizar Raza" : "Guardar Raza"}
        </Button>

        <Button
          size="sm"
          variant="outline"
          type="button"
          onClick={() => navigate(RAZA_ROUTES.list)}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
