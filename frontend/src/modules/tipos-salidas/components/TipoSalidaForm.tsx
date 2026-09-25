import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { TIPO_SALIDA_ROUTES } from "../constants";
import { useCreateTipoSalida } from "../hooks/useCreateTipoSalida";
import { useUpdateTipoSalida } from "../hooks/useUpdateTipoSalida";
import { getTipoSalida } from "../services";
import { TipoSalidaCreateRequest } from "../types";

interface Props {
  tipoSalidaId?: number;
}

const emptyForm: TipoSalidaCreateRequest = {
  nombre: "",
};

export default function TipoSalidaForm({ tipoSalidaId }: Props) {
  const navigate = useNavigate();
  const isEdit = Boolean(tipoSalidaId);

  const {
    create,
    loading: creating,
    error: createError,
    setError: setCreateError,
  } = useCreateTipoSalida();
  const {
    update,
    loading: updating,
    error: updateError,
    setError: setUpdateError,
  } = useUpdateTipoSalida();

  const [form, setForm] = useState<TipoSalidaCreateRequest>(emptyForm);
  const [loading, setLoading] = useState(isEdit);

  const saving = creating || updating;
  const error = createError || updateError;

  useEffect(() => {
    if (!tipoSalidaId) {
      return;
    }

    const load = async () => {
      try {
        const tipo = await getTipoSalida(tipoSalidaId);
        setForm({ nombre: tipo.nombre });
      } catch (err) {
        console.error(err);
        setUpdateError("No se pudo cargar el tipo de salida.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [tipoSalidaId, setUpdateError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setUpdateError(null);

    if (!form.nombre.trim()) {
      setCreateError("El nombre es obligatorio.");
      return;
    }

    try {
      if (isEdit && tipoSalidaId) {
        await update(tipoSalidaId, form);
        navigate(TIPO_SALIDA_ROUTES.detail(tipoSalidaId));
      } else {
        const response = await create(form);
        navigate(TIPO_SALIDA_ROUTES.detail(response.data.id));
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
        <Label>Nombre *</Label>
        <InputField
          type="text"
          name="nombre"
          value={form.nombre}
          onChange={(e) => setForm({ nombre: e.target.value })}
        />
      </div>

      <div className="mt-6 flex gap-3">
        <Button size="sm" type="submit" disabled={saving}>
          {saving ? "Guardando..." : isEdit ? "Actualizar tipo" : "Guardar tipo"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          type="button"
          onClick={() => navigate(TIPO_SALIDA_ROUTES.list)}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
