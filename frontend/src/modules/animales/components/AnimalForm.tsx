import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";
import { ANIMAL_ROUTES, ANIMAL_SEXO_OPTIONS } from "../constants";
import { useAnimalReferenceOptions } from "../hooks/useAnimalReferenceOptions";
import { useCreateAnimal } from "../hooks/useCreateAnimal";
import { useUpdateAnimal } from "../hooks/useUpdateAnimal";
import { getAnimal } from "../services";
import { AnimalCreateRequest } from "../types";

interface Props {
  animalId?: number;
}

const emptyForm: AnimalCreateRequest = {
  codigo: "",
  arete: "",
  nombre: "",
  sexo: "M",
  fecha_nacimiento: "",
  raza_id: 0,
  categoria_id: 0,
  estado_productivo_id: 0,
  lote_id: 0,
  madre_id: null,
  padre_id: null,
  color: "",
  observaciones: "",
};

export default function AnimalForm({ animalId }: Props) {
  const navigate = useNavigate();
  const isEdit = Boolean(animalId);

  const {
    razaOptions,
    categoriaOptions,
    estadoProductivoOptions,
    loteOptions,
    parentOptions,
    loading: loadingOptions,
    error: optionsError,
  } = useAnimalReferenceOptions(animalId);

  const {
    create,
    loading: creating,
    error: createError,
    setError: setCreateError,
  } = useCreateAnimal();
  const {
    update,
    loading: updating,
    error: updateError,
    setError: setUpdateError,
  } = useUpdateAnimal();

  const [form, setForm] = useState<AnimalCreateRequest>(emptyForm);
  const [loading, setLoading] = useState(isEdit);

  const saving = creating || updating;
  const error = createError || updateError || optionsError;

  useEffect(() => {
    if (!animalId) {
      return;
    }

    const loadAnimal = async () => {
      try {
        const animal = await getAnimal(animalId);
        setForm({
          codigo: animal.codigo,
          arete: animal.arete ?? "",
          nombre: animal.nombre ?? "",
          sexo: animal.sexo,
          fecha_nacimiento: animal.fecha_nacimiento,
          raza_id: animal.raza_id,
          categoria_id: animal.categoria_id,
          estado_productivo_id: animal.estado_productivo_id,
          lote_id: animal.lote_id,
          madre_id: animal.madre_id,
          padre_id: animal.padre_id,
          color: animal.color ?? "",
          observaciones: animal.observaciones ?? "",
        });
      } catch (err) {
        console.error(err);
        setUpdateError("No se pudo cargar el animal.");
      } finally {
        setLoading(false);
      }
    };

    loadAnimal();
  }, [animalId, setUpdateError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((current) => ({
      ...current,
      [name]:
        name === "codigo" || name === "arete"
          ? value.toUpperCase()
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setUpdateError(null);

    if (!form.raza_id || !form.categoria_id || !form.estado_productivo_id || !form.lote_id) {
      setCreateError("Debe completar todos los campos de referencia obligatorios.");
      return;
    }

    const payload: AnimalCreateRequest = {
      ...form,
      arete: form.arete || null,
      nombre: form.nombre || null,
      madre_id: form.madre_id || null,
      padre_id: form.padre_id || null,
      color: form.color || null,
      observaciones: form.observaciones || null,
    };

    try {
      if (isEdit && animalId) {
        await update(animalId, payload);
        navigate(ANIMAL_ROUTES.detail(animalId));
      } else {
        const response = await create(payload);
        navigate(ANIMAL_ROUTES.detail(response.data.id));
      }
    } catch {
      // Errors handled in hooks
    }
  };

  if (loading || loadingOptions) {
    return <div>Cargando formulario...</div>;
  }

  const parentSelectOptions = [
    { value: "", label: "Sin seleccionar" },
    ...parentOptions,
  ];

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
            placeholder="Ej: AN-VACA-001"
          />
        </div>

        <div>
          <Label>Arete</Label>
          <InputField
            type="text"
            name="arete"
            value={form.arete ?? ""}
            onChange={handleChange}
            placeholder="Ej: AR-2001"
          />
        </div>

        <div>
          <Label>Nombre</Label>
          <InputField
            type="text"
            name="nombre"
            value={form.nombre ?? ""}
            onChange={handleChange}
          />
        </div>

        <div>
          <Label>Sexo</Label>
          <Select
            value={form.sexo}
            options={ANIMAL_SEXO_OPTIONS.map((o) => ({
              value: o.value,
              label: o.label,
            }))}
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                sexo: value as AnimalCreateRequest["sexo"],
              }))
            }
          />
        </div>

        <div>
          <Label>Fecha de nacimiento</Label>
          <InputField
            type="date"
            name="fecha_nacimiento"
            value={form.fecha_nacimiento}
            onChange={handleChange}
          />
        </div>

        <div>
          <Label>Color</Label>
          <InputField
            type="text"
            name="color"
            value={form.color ?? ""}
            onChange={handleChange}
          />
        </div>

        <div>
          <Label>Raza</Label>
          <Select
            value={form.raza_id ? String(form.raza_id) : ""}
            placeholder="Seleccione una raza"
            options={razaOptions}
            onChange={(value) =>
              setForm((current) => ({ ...current, raza_id: Number(value) }))
            }
          />
        </div>

        <div>
          <Label>Categoría</Label>
          <Select
            value={form.categoria_id ? String(form.categoria_id) : ""}
            placeholder="Seleccione una categoría"
            options={categoriaOptions}
            onChange={(value) =>
              setForm((current) => ({ ...current, categoria_id: Number(value) }))
            }
          />
        </div>

        <div>
          <Label>Estado productivo</Label>
          <Select
            value={form.estado_productivo_id ? String(form.estado_productivo_id) : ""}
            placeholder="Seleccione un estado productivo"
            options={estadoProductivoOptions}
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                estado_productivo_id: Number(value),
              }))
            }
          />
        </div>

        <div>
          <Label>Lote</Label>
          <Select
            value={form.lote_id ? String(form.lote_id) : ""}
            placeholder="Seleccione un lote"
            options={loteOptions}
            onChange={(value) =>
              setForm((current) => ({ ...current, lote_id: Number(value) }))
            }
          />
        </div>

        <div>
          <Label>Madre</Label>
          <Select
            value={form.madre_id ? String(form.madre_id) : ""}
            placeholder="Opcional"
            options={parentSelectOptions}
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                madre_id: value ? Number(value) : null,
              }))
            }
          />
        </div>

        <div>
          <Label>Padre</Label>
          <Select
            value={form.padre_id ? String(form.padre_id) : ""}
            placeholder="Opcional"
            options={parentSelectOptions}
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                padre_id: value ? Number(value) : null,
              }))
            }
          />
        </div>

        <div className="md:col-span-2">
          <Label>Observaciones</Label>
          <TextArea
            rows={4}
            value={form.observaciones ?? ""}
            onChange={(value) => setForm((current) => ({ ...current, observaciones: value }))}
          />
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Button size="sm" type="submit" disabled={saving}>
          {saving ? "Guardando..." : isEdit ? "Actualizar Animal" : "Guardar Animal"}
        </Button>

        <Button
          size="sm"
          variant="outline"
          type="button"
          onClick={() => navigate(ANIMAL_ROUTES.list)}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
