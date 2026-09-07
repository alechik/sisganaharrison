import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { SOCIO_ROUTES } from "../constants";
import { createTipoPersona, getTipoPersona, updateTipoPersona } from "../services";

interface Props {
  tipoId?: number;
}

export default function TipoPersonaForm({ tipoId }: Props) {
  const navigate = useNavigate();
  const isEdit = Boolean(tipoId);
  const [nombre, setNombre] = useState("");
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tipoId) {
      return;
    }

    const load = async () => {
      try {
        const tipo = await getTipoPersona(tipoId);
        setNombre(tipo.nombre);
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar el tipo de persona.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [tipoId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (isEdit && tipoId) {
        await updateTipoPersona(tipoId, { nombre });
      } else {
        await createTipoPersona({ nombre });
      }
      navigate(SOCIO_ROUTES.tipos);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "No se pudo guardar el tipo de persona.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Cargando formulario...</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}
      <div>
        <Label>Nombre</Label>
        <InputField
          type="text"
          name="nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value.toUpperCase())}
          placeholder="Ej: TRANSPORTISTA"
        />
      </div>
      <div className="mt-6 flex gap-3">
        <Button size="sm" type="submit" disabled={saving}>
          {saving ? "Guardando..." : isEdit ? "Actualizar tipo" : "Guardar tipo"}
        </Button>
        <Button size="sm" variant="outline" type="button" onClick={() => navigate(SOCIO_ROUTES.tipos)}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
