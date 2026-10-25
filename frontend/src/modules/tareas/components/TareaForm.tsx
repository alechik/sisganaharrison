import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";
import { canManageTareas } from "@/utils/roles";
import { TAREA_ROUTES } from "../constants";
import { useCreateTarea, useUpdateTarea } from "../hooks";
import { getAsignables, getTarea } from "../services";
import { TareaUsuario } from "../types";

interface Props {
  tareaId?: number;
}

export default function TareaForm({ tareaId }: Props) {
  const navigate = useNavigate();
  const isEdit = Boolean(tareaId);
  const isGestor = canManageTareas();

  const { create, loading: creating, error: createError, setError: setCreateError } = useCreateTarea();
  const { update, loading: updating, error: updateError, setError: setUpdateError } = useUpdateTarea();

  const [asignables, setAsignables] = useState<TareaUsuario[]>([]);
  const [userTrabajadorId, setUserTrabajadorId] = useState("");
  const [indicacion, setIndicacion] = useState("");
  const [respuesta, setRespuesta] = useState("");
  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(isEdit || isGestor);

  const saving = creating || updating;
  const error = createError || updateError;

  useEffect(() => {
    const load = async () => {
      try {
        if (isGestor && !isEdit) {
          const users = await getAsignables();
          setAsignables(users);
          if (users.length === 0) {
            setCreateError("No hay trabajadores o veterinarios activos para asignar.");
          }
        }

        if (tareaId) {
          const tarea = await getTarea(tareaId);
          setCodigo(tarea.codigo_tarea);
          setIndicacion(tarea.indicacion);
          setRespuesta(tarea.respuesta_indicacion ?? "");
          setUserTrabajadorId(String(tarea.user_trabajador_id));
        }
      } catch (err) {
        console.error(err);
        setUpdateError("No se pudo cargar la tarea.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isEdit, isGestor, tareaId, setUpdateError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setUpdateError(null);

    try {
      if (isEdit && tareaId) {
        await update(tareaId, { respuesta_indicacion: respuesta });
        navigate(TAREA_ROUTES.detail(tareaId));
        return;
      }

      if (!userTrabajadorId) {
        setCreateError("Debe seleccionar el usuario asignado.");
        return;
      }

      if (!indicacion.trim()) {
        setCreateError("Debe indicar las instrucciones de la tarea.");
        return;
      }

      const response = await create({
        user_trabajador_id: Number(userTrabajadorId),
        indicacion,
      });
      navigate(TAREA_ROUTES.detail(response.data.id));
    } catch {
      // hook
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

      <div className="grid grid-cols-1 gap-4">
        {isEdit && (
          <div>
            <Label>Código</Label>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">{codigo}</p>
          </div>
        )}

        {!isEdit && (
          <div>
            <Label>Usuario asignado</Label>
            <Select
              value={userTrabajadorId}
              placeholder="Seleccione trabajador o veterinario"
              options={asignables.map((user) => ({
                value: String(user.id),
                label: user.nombre,
              }))}
              onChange={setUserTrabajadorId}
            />
          </div>
        )}

        <div>
          <Label>Indicación</Label>
          {isEdit ? (
            <p className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">{indicacion}</p>
          ) : (
            <TextArea
              rows={5}
              value={indicacion}
              onChange={setIndicacion}
            />
          )}
        </div>

        {isEdit && (
          <div>
            <Label>Respuesta</Label>
            <TextArea
              rows={5}
              value={respuesta}
              onChange={setRespuesta}
            />
          </div>
        )}
      </div>

      <div className="mt-6 flex gap-3">
        <Button size="sm" type="submit" disabled={saving}>
          {saving ? "Guardando..." : isEdit ? "Guardar respuesta" : "Crear tarea"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          type="button"
          onClick={() => navigate(TAREA_ROUTES.list)}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
