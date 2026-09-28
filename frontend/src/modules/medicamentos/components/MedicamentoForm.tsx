import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";
import { getPresentaciones } from "@/modules/presentaciones/services";
import { MEDICAMENTO_ROUTES } from "../constants";
import { useCreateMedicamento } from "../hooks/useCreateMedicamento";
import { useUpdateMedicamento } from "../hooks/useUpdateMedicamento";
import { getMedicamento } from "../services";
import { MedicamentoCreateRequest } from "../types";

interface Props {
  medicamentoId?: number;
}

const emptyForm: MedicamentoCreateRequest = {
  presentacion_id: 0,
  codigo: "",
  nombre: "",
  laboratorio: "",
  precio: 0,
  descripcion: "",
};

export default function MedicamentoForm({ medicamentoId }: Props) {
  const navigate = useNavigate();
  const isEdit = Boolean(medicamentoId);
  const { create, loading: creating, error: createError, setError: setCreateError } = useCreateMedicamento();
  const { update, loading: updating, error: updateError, setError: setUpdateError } = useUpdateMedicamento();
  const [form, setForm] = useState<MedicamentoCreateRequest>(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [presentaciones, setPresentaciones] = useState<{ value: string; label: string }[]>([]);

  const saving = creating || updating;
  const error = createError || updateError;

  useEffect(() => {
    getPresentaciones({ per_page: 100, sort_by: "descripcion", sort_dir: "asc" })
      .then((res) =>
        setPresentaciones(res.data.map((item) => ({ value: String(item.id), label: item.descripcion })))
      )
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!medicamentoId) {
      return;
    }

    const loadMedicamento = async () => {
      try {
        const medicamento = await getMedicamento(medicamentoId);
        setForm({
          presentacion_id: medicamento.presentacion_id,
          codigo: medicamento.codigo,
          nombre: medicamento.nombre,
          laboratorio: medicamento.laboratorio ?? "",
          precio: medicamento.precio,
          descripcion: medicamento.descripcion ?? "",
        });
      } catch (err) {
        console.error(err);
        setUpdateError("No se pudo cargar el medicamento.");
      } finally {
        setLoading(false);
      }
    };

    loadMedicamento();
  }, [medicamentoId, setUpdateError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((current) => ({
      ...current,
      [name]: name === "codigo" ? value.toUpperCase() : name === "precio" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setUpdateError(null);

    if (!form.presentacion_id) {
      setCreateError("Debe seleccionar una presentación.");
      return;
    }

    try {
      if (isEdit && medicamentoId) {
        await update(medicamentoId, form);
        navigate(MEDICAMENTO_ROUTES.detail(medicamentoId));
      } else {
        const response = await create(form);
        navigate(MEDICAMENTO_ROUTES.detail(response.data.id));
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
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label>Presentación *</Label>
          <Select
            value={form.presentacion_id ? String(form.presentacion_id) : ""}
            placeholder="Seleccione presentación"
            options={presentaciones}
            onChange={(value) => setForm((current) => ({ ...current, presentacion_id: Number(value) }))}
          />
        </div>
        <div>
          <Label>Código *</Label>
          <InputField type="text" name="codigo" value={form.codigo} onChange={handleChange} />
        </div>
        <div>
          <Label>Nombre *</Label>
          <InputField type="text" name="nombre" value={form.nombre} onChange={handleChange} />
        </div>
        <div>
          <Label>Precio *</Label>
          <InputField
            type="number"
            name="precio"
            min="0"
            step={0.01}
            value={String(form.precio)}
            onChange={handleChange}
          />
        </div>
        <div className="md:col-span-2">
          <Label>Laboratorio</Label>
          <InputField type="text" name="laboratorio" value={form.laboratorio ?? ""} onChange={handleChange} />
        </div>
        <div className="md:col-span-2">
          <Label>Descripción *</Label>
          <TextArea
            rows={4}
            value={form.descripcion ?? ""}
            onChange={(value) => setForm((current) => ({ ...current, descripcion: value }))}
          />
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Button size="sm" type="submit" disabled={saving}>
          {saving ? "Guardando..." : isEdit ? "Actualizar medicamento" : "Guardar medicamento"}
        </Button>
        <Button size="sm" variant="outline" type="button" onClick={() => navigate(MEDICAMENTO_ROUTES.list)}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
