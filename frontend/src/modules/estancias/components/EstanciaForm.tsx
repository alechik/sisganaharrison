import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";
import { ESTANCIA_ROUTES } from "../constants";
import { useCreateEstancia } from "../hooks/useCreateEstancia";
import { useUpdateEstancia } from "../hooks/useUpdateEstancia";
import { getEstancia } from "../services";
import { EstanciaCreateRequest } from "../types";

interface Props {
  estanciaId?: number;
}

const emptyForm: EstanciaCreateRequest = {
  codigo: "",
  nombre: "",
  propietario: "",
  telefono: "",
  direccion: "",
  municipio: "",
  departamento: "",
  pais: "Bolivia",
  area_total_ha: null,
  descripcion: "",
};

export default function EstanciaForm({ estanciaId }: Props) {
  const navigate = useNavigate();
  const isEdit = Boolean(estanciaId);

  const {
    create,
    loading: creating,
    error: createError,
    setError: setCreateError,
  } = useCreateEstancia();
  const {
    update,
    loading: updating,
    error: updateError,
    setError: setUpdateError,
  } = useUpdateEstancia();

  const [form, setForm] = useState<EstanciaCreateRequest>(emptyForm);
  const [loading, setLoading] = useState(isEdit);

  const saving = creating || updating;
  const error = createError || updateError;

  useEffect(() => {
    if (!estanciaId) {
      return;
    }

    const loadEstancia = async () => {
      try {
        const estancia = await getEstancia(estanciaId);
        setForm({
          codigo: estancia.codigo,
          nombre: estancia.nombre,
          propietario: estancia.propietario ?? "",
          telefono: estancia.telefono ?? "",
          direccion: estancia.direccion ?? "",
          municipio: estancia.municipio ?? "",
          departamento: estancia.departamento ?? "",
          pais: estancia.pais ?? "Bolivia",
          area_total_ha: estancia.area_total_ha,
          descripcion: estancia.descripcion ?? "",
        });
      } catch (err) {
        console.error(err);
        setUpdateError("No se pudo cargar la estancia.");
      } finally {
        setLoading(false);
      }
    };

    loadEstancia();
  }, [estanciaId, setUpdateError]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((current) => ({
      ...current,
      [name]:
        name === "codigo"
          ? value.toUpperCase()
          : name === "area_total_ha"
            ? value === ""
              ? null
              : Number(value)
            : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setUpdateError(null);

    try {
      if (isEdit && estanciaId) {
        await update(estanciaId, form);
        navigate(ESTANCIA_ROUTES.detail(estanciaId));
      } else {
        const response = await create(form);
        navigate(ESTANCIA_ROUTES.detail(response.data.id));
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
            placeholder="Ej: HAC_EL_CARMEN"
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

        <div>
          <Label>Propietario</Label>
          <InputField
            type="text"
            name="propietario"
            value={form.propietario ?? ""}
            onChange={handleChange}
          />
        </div>

        <div>
          <Label>Teléfono</Label>
          <InputField
            type="text"
            name="telefono"
            value={form.telefono ?? ""}
            onChange={handleChange}
            placeholder="Ej: +591 76432100"
          />
        </div>

        <div className="md:col-span-2">
          <Label>Dirección</Label>
          <InputField
            type="text"
            name="direccion"
            value={form.direccion ?? ""}
            onChange={handleChange}
          />
        </div>

        <div>
          <Label>Municipio</Label>
          <InputField
            type="text"
            name="municipio"
            value={form.municipio ?? ""}
            onChange={handleChange}
          />
        </div>

        <div>
          <Label>Departamento</Label>
          <InputField
            type="text"
            name="departamento"
            value={form.departamento ?? ""}
            onChange={handleChange}
          />
        </div>

        <div>
          <Label>País</Label>
          <InputField
            type="text"
            name="pais"
            value={form.pais ?? "Bolivia"}
            onChange={handleChange}
          />
        </div>

        <div>
          <Label>Área total (ha)</Label>
          <InputField
            type="number"
            name="area_total_ha"
            value={form.area_total_ha ?? ""}
            onChange={handleChange}
            min="0"
            step={0.01}
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
          {saving ? "Guardando..." : isEdit ? "Actualizar Estancia" : "Guardar Estancia"}
        </Button>

        <Button
          size="sm"
          variant="outline"
          type="button"
          onClick={() => navigate(ESTANCIA_ROUTES.list)}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
