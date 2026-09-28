import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { PRESENTACION_ROUTES } from "../constants";
import { useCreatePresentacion } from "../hooks/useCreatePresentacion";
import { useUpdatePresentacion } from "../hooks/useUpdatePresentacion";
import { getPresentacion } from "../services";
import { PresentacionCreateRequest } from "../types";

interface Props {
  presentacionId?: number;
}

const emptyForm: PresentacionCreateRequest = {
  descripcion: "",
};

export default function PresentacionForm({ presentacionId }: Props) {
  const navigate = useNavigate();
  const isEdit = Boolean(presentacionId);

  const {
    create,
    loading: creating,
    error: createError,
    setError: setCreateError,
  } = useCreatePresentacion();
  const {
    update,
    loading: updating,
    error: updateError,
    setError: setUpdateError,
  } = useUpdatePresentacion();

  const [form, setForm] = useState<PresentacionCreateRequest>(emptyForm);
  const [loading, setLoading] = useState(isEdit);

  const saving = creating || updating;
  const error = createError || updateError;

  useEffect(() => {
    if (!presentacionId) {
      return;
    }

    const load = async () => {
      try {
        const tipo = await getPresentacion(presentacionId);
        setForm({ descripcion: tipo.descripcion });
      } catch (err) {
        console.error(err);
        setUpdateError("No se pudo cargar la presentación.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [presentacionId, setUpdateError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setUpdateError(null);

    if (!form.descripcion.trim()) {
      setCreateError("La descripción es obligatoria.");
      return;
    }

    try {
      if (isEdit && presentacionId) {
        await update(presentacionId, form);
        navigate(PRESENTACION_ROUTES.detail(presentacionId));
      } else {
        const response = await create(form);
        navigate(PRESENTACION_ROUTES.detail(response.data.id));
      }
    } catch {
      // handled
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

      <div>
        <Label>Descripción *</Label>
        <InputField
          type="text"
          name="descripcion"
          value={form.descripcion}
          onChange={(e) => setForm({ descripcion: e.target.value })}
        />
      </div>

      <div className="mt-6 flex gap-3">
        <Button size="sm" type="submit" disabled={saving}>
          {saving ? "Guardando..." : isEdit ? "Actualizar" : "Guardar"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          type="button"
          onClick={() => navigate(PRESENTACION_ROUTES.list)}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
