import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";
import { CATEGORIA_ANIMAL_ROUTES } from "../constants";
import { useCreateCategoriaAnimal } from "../hooks/useCreateCategoriaAnimal";
import { useUpdateCategoriaAnimal } from "../hooks/useUpdateCategoriaAnimal";
import { getCategoriaAnimal } from "../services";
import { CategoriaAnimalCreateRequest } from "../types";

interface Props {
  categoriaId?: number;
}

const emptyForm: CategoriaAnimalCreateRequest = {
  codigo: "",
  nombre: "",
  descripcion: "",
  sexo: null,
  edad_min_meses: null,
  edad_max_meses: null,
  castrado: null,
  caracteristica: "",
  peso_min_kg: null,
  peso_max_kg: null,
  peso_referencia_meses: null,
  cambio_peso_meses: 2,
  indice_aumento: null,
};

const toNullableNumber = (value: string): number | null => {
  if (value.trim() === "") {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export default function CategoriaAnimalForm({ categoriaId }: Props) {
  const navigate = useNavigate();
  const isEdit = Boolean(categoriaId);

  const {
    create,
    loading: creating,
    error: createError,
    setError: setCreateError,
  } = useCreateCategoriaAnimal();
  const {
    update,
    loading: updating,
    error: updateError,
    setError: setUpdateError,
  } = useUpdateCategoriaAnimal();

  const [form, setForm] = useState<CategoriaAnimalCreateRequest>(emptyForm);
  const [loading, setLoading] = useState(isEdit);

  const saving = creating || updating;
  const error = createError || updateError;

  useEffect(() => {
    if (!categoriaId) {
      return;
    }

    const loadCategoria = async () => {
      try {
        const categoria = await getCategoriaAnimal(categoriaId);
        setForm({
          codigo: categoria.codigo,
          nombre: categoria.nombre,
          descripcion: categoria.descripcion ?? "",
          sexo: categoria.sexo ?? null,
          edad_min_meses: categoria.edad_min_meses ?? null,
          edad_max_meses: categoria.edad_max_meses ?? null,
          castrado: categoria.castrado ?? null,
          caracteristica: categoria.caracteristica ?? "",
          peso_min_kg: categoria.peso_min_kg ?? null,
          peso_max_kg: categoria.peso_max_kg ?? null,
          peso_referencia_meses: categoria.peso_referencia_meses ?? null,
          cambio_peso_meses: categoria.cambio_peso_meses ?? 2,
          indice_aumento: categoria.indice_aumento ?? null,
        });
      } catch (err) {
        console.error(err);
        setUpdateError("No se pudo cargar la categoría.");
      } finally {
        setLoading(false);
      }
    };

    loadCategoria();
  }, [categoriaId, setUpdateError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      if (isEdit && categoriaId) {
        await update(categoriaId, form);
        navigate(CATEGORIA_ANIMAL_ROUTES.detail(categoriaId));
      } else {
        const response = await create(form);
        navigate(CATEGORIA_ANIMAL_ROUTES.detail(response.data.id));
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
            placeholder="Ej: TERNEROS_M"
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
          <Label>Sexo</Label>
          <Select
            value={form.sexo ?? ""}
            placeholder="Ambos / no aplica"
            options={[
              { value: "", label: "Ambos / no aplica" },
              { value: "M", label: "Macho" },
              { value: "H", label: "Hembra" },
            ]}
            onChange={(value) =>
              setForm((current) => ({ ...current, sexo: value ? (value as "M" | "H") : null }))
            }
          />
        </div>

        <div>
          <Label>Castrado</Label>
          <Select
            value={form.castrado === null || form.castrado === undefined ? "" : form.castrado ? "si" : "no"}
            placeholder="No aplica"
            options={[
              { value: "", label: "No aplica" },
              { value: "si", label: "Requiere castrado" },
              { value: "no", label: "Entero (no castrado)" },
            ]}
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                castrado: value === "" ? null : value === "si",
              }))
            }
          />
        </div>

        <div>
          <Label>Edad mínima (meses)</Label>
          <InputField
            type="number"
            min="0"
            value={form.edad_min_meses ?? ""}
            onChange={(e) =>
              setForm((current) => ({ ...current, edad_min_meses: toNullableNumber(e.target.value) }))
            }
          />
        </div>

        <div>
          <Label>Edad máxima (meses)</Label>
          <InputField
            type="number"
            min="0"
            value={form.edad_max_meses ?? ""}
            onChange={(e) =>
              setForm((current) => ({ ...current, edad_max_meses: toNullableNumber(e.target.value) }))
            }
          />
        </div>

        <div className="md:col-span-2">
          <Label>Característica</Label>
          <InputField
            type="text"
            value={form.caracteristica ?? ""}
            onChange={(e) => setForm((current) => ({ ...current, caracteristica: e.target.value }))}
            placeholder="Ej. Ternero que permanece con la madre"
          />
        </div>

        <div>
          <Label>Peso de referencia mín. (kg)</Label>
          <InputField
            type="number"
            min="0"
            step={0.01}
            value={form.peso_min_kg ?? ""}
            onChange={(e) =>
              setForm((current) => ({ ...current, peso_min_kg: toNullableNumber(e.target.value) }))
            }
          />
        </div>

        <div>
          <Label>Peso de referencia máx. (kg)</Label>
          <InputField
            type="number"
            min="0"
            step={0.01}
            value={form.peso_max_kg ?? ""}
            onChange={(e) =>
              setForm((current) => ({ ...current, peso_max_kg: toNullableNumber(e.target.value) }))
            }
          />
        </div>

        <div>
          <Label>Peso de referencia a (meses)</Label>
          <InputField
            type="number"
            min="0"
            value={form.peso_referencia_meses ?? ""}
            onChange={(e) =>
              setForm((current) => ({
                ...current,
                peso_referencia_meses: toNullableNumber(e.target.value),
              }))
            }
          />
        </div>

        <div>
          <Label>Cambio de peso (meses)</Label>
          <InputField
            type="number"
            min="1"
            value={form.cambio_peso_meses ?? ""}
            onChange={(e) =>
              setForm((current) => ({
                ...current,
                cambio_peso_meses: toNullableNumber(e.target.value),
              }))
            }
          />
        </div>

        <div>
          <Label>Índice de aumento (kg)</Label>
          <InputField
            type="number"
            min="0"
            step={0.01}
            value={form.indice_aumento ?? ""}
            onChange={(e) =>
              setForm((current) => ({
                ...current,
                indice_aumento: toNullableNumber(e.target.value),
              }))
            }
          />
        </div>

        <div className="md:col-span-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            El peso y el índice de aumento son referencias de la categoría. No reemplazan el peso
            real del animal ni se aplican automáticamente en pesajes.
          </p>
        </div>

        <div className="md:col-span-2">
          <Label>Descripción</Label>
          <TextArea
            rows={3}
            value={form.descripcion ?? ""}
            onChange={(value) => setForm((current) => ({ ...current, descripcion: value }))}
          />
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Button size="sm" type="submit" disabled={saving}>
          {saving
            ? "Guardando..."
            : isEdit
              ? "Actualizar Categoría"
              : "Guardar Categoría"}
        </Button>

        <Button
          size="sm"
          variant="outline"
          type="button"
          onClick={() => navigate(CATEGORIA_ANIMAL_ROUTES.list)}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
