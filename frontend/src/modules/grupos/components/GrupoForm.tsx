import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";
import { GRUPO_ROUTES } from "../constants";
import { useActiveLoteOptions } from "../hooks/useActiveLoteOptions";
import { useCreateGrupo } from "../hooks/useCreateGrupo";
import { useUpdateGrupo } from "../hooks/useUpdateGrupo";
import { getGrupo } from "../services";
import { GrupoCreateRequest } from "../types";

const emptyForm: GrupoCreateRequest = { lote_id: 0, nombre: "", observaciones: "" };

export default function GrupoForm({ grupoId }: { grupoId?: number }) {
  const navigate = useNavigate();
  const isEdit = Boolean(grupoId);
  const { options: loteOptions, loading: loadingLotes, error: lotesError } = useActiveLoteOptions();
  const { create, loading: creating, error: createError, setError: setCreateError } = useCreateGrupo();
  const { update, loading: updating, error: updateError, setError: setUpdateError } = useUpdateGrupo();
  const [form, setForm] = useState<GrupoCreateRequest>(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const error = createError || updateError || lotesError;

  useEffect(() => {
    if (!grupoId) return;
    getGrupo(grupoId)
      .then((grupo) => setForm({ lote_id: grupo.lote_id, nombre: grupo.nombre, observaciones: grupo.observaciones ?? "" }))
      .catch(() => setUpdateError("No se pudo cargar el grupo."))
      .finally(() => setLoading(false));
  }, [grupoId, setUpdateError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setUpdateError(null);
    if (!form.lote_id) {
      setCreateError("Debe seleccionar un potrero.");
      return;
    }
    try {
      if (isEdit && grupoId) {
        await update(grupoId, form);
        navigate(GRUPO_ROUTES.detail(grupoId));
      } else {
        const response = await create(form);
        navigate(GRUPO_ROUTES.detail(response.data.id));
      }
    } catch {
      // handled
    }
  };

  if (loading || loadingLotes) return <div>Cargando formulario...</div>;

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">{error}</div>}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <Label>Potrero</Label>
          <Select
            value={form.lote_id ? String(form.lote_id) : ""}
            placeholder="Seleccione un potrero"
            options={loteOptions}
            onChange={(value) => setForm((current) => ({ ...current, lote_id: Number(value) }))}
          />
        </div>
        <div className="md:col-span-2">
          <Label>Nombre</Label>
          <InputField type="text" name="nombre" value={form.nombre} onChange={(e) => setForm((current) => ({ ...current, nombre: e.target.value }))} />
        </div>
        <div className="md:col-span-2">
          <Label>Observaciones</Label>
          <TextArea rows={4} value={form.observaciones ?? ""} onChange={(value) => setForm((current) => ({ ...current, observaciones: value }))} />
        </div>
      </div>
      <div className="mt-6 flex gap-3">
        <Button size="sm" type="submit" disabled={creating || updating}>
          {creating || updating ? "Guardando..." : isEdit ? "Actualizar grupo" : "Guardar grupo"}
        </Button>
        <Button size="sm" variant="outline" type="button" onClick={() => navigate(GRUPO_ROUTES.list)}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
