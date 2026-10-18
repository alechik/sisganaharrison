import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import InputField from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import Button from "@/components/ui/button/Button";
import { getEstablecimientos } from "@/modules/establecimientos/services";
import { getAlmacen } from "../services";
import { useCreateAlmacen } from "../hooks/useCreateAlmacen";
import { useUpdateAlmacen } from "../hooks/useUpdateAlmacen";
import { ALMACEN_ROUTES } from "../constants";
import { AlmacenCreateRequest } from "../types";

interface Props {
  almacenId?: number;
}

const emptyForm: AlmacenCreateRequest = {
  establecimiento_id: 0,
  nombre: "",
  direccion: "",
  observacion: "",
};

export default function AlmacenForm({ almacenId }: Props) {
  const navigate = useNavigate();
  const isEdit = Boolean(almacenId);

  const { create, loading: creating, error: createError, setError: setCreateError } = useCreateAlmacen();
  const { update, loading: updating, error: updateError, setError: setUpdateError } = useUpdateAlmacen();

  const [form, setForm] = useState<AlmacenCreateRequest>(emptyForm);
  const [establecimientoNombre, setEstablecimientoNombre] = useState("");
  const [loading, setLoading] = useState(isEdit);
  const [estancias, setEstancias] = useState<{ value: string; label: string }[]>([]);

  const saving = creating || updating;
  const error = createError || updateError;

  useEffect(() => {
    if (isEdit) {
      return;
    }

    getEstablecimientos({ per_page: 100, activo: true, sort_by: "nombre", sort_dir: "asc" })
      .then((res) => setEstancias(res.data.map((item) => ({ value: String(item.id), label: item.nombre }))))
      .catch(console.error);
  }, [isEdit]);

  useEffect(() => {
    if (!almacenId) {
      return;
    }

    const load = async () => {
      try {
        const item = await getAlmacen(almacenId);
        setForm({
          establecimiento_id: item.establecimiento_id,
          nombre: item.nombre,
          direccion: item.direccion ?? "",
          observacion: item.observacion ?? "",
        });
        setEstablecimientoNombre(item.establecimiento_nombre ?? "");
      } catch (err) {
        console.error(err);
        setUpdateError("No se pudo cargar el almacén.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [almacenId, setUpdateError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setUpdateError(null);

    if (!form.establecimiento_id) {
      setCreateError("Debe seleccionar una estancia.");
      return;
    }

    try {
      if (isEdit && almacenId) {
        await update(almacenId, form);
        navigate(ALMACEN_ROUTES.detail(almacenId));
      } else {
        const response = await create(form);
        navigate(ALMACEN_ROUTES.detail(response.data.id));
      }
    } catch {
      // handled in hooks
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
          <Label>Estancia</Label>
          {isEdit ? (
            <InputField type="text" value={establecimientoNombre} disabled />
          ) : (
            <Select
              value={form.establecimiento_id ? String(form.establecimiento_id) : ""}
              placeholder="Seleccione una estancia"
              options={estancias}
              onChange={(value) =>
                setForm((current) => ({ ...current, establecimiento_id: Number(value) }))
              }
            />
          )}
        </div>

        <div>
          <Label>Nombre</Label>
          <InputField
            type="text"
            name="nombre"
            value={form.nombre}
            onChange={(e) => setForm((current) => ({ ...current, nombre: e.target.value }))}
          />
        </div>

        <div className="md:col-span-2">
          <Label>Dirección</Label>
          <InputField
            type="text"
            name="direccion"
            value={form.direccion ?? ""}
            onChange={(e) => setForm((current) => ({ ...current, direccion: e.target.value }))}
          />
        </div>

        <div className="md:col-span-2">
          <Label>Observación</Label>
          <TextArea
            rows={4}
            value={form.observacion ?? ""}
            onChange={(value) => setForm((current) => ({ ...current, observacion: value }))}
          />
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Button size="sm" type="submit" disabled={saving}>
          {saving ? "Guardando..." : isEdit ? "Actualizar almacén" : "Guardar almacén"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          type="button"
          onClick={() => navigate(ALMACEN_ROUTES.list)}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
