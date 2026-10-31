import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";
import { INFORME_DIARIO_ROUTES } from "../constants";
import { useCreateInformeDiario, useUpdateInformeDiario } from "../hooks";
import { getInformeDiario } from "../services";
import { todayIsoDate } from "../utils";

interface Props {
  informeId?: number;
}

export default function InformeForm({ informeId }: Props) {
  const navigate = useNavigate();
  const isEdit = Boolean(informeId);

  const { create, loading: creating, error: createError, setError: setCreateError } = useCreateInformeDiario();
  const { update, loading: updating, error: updateError, setError: setUpdateError } = useUpdateInformeDiario();

  const [fecha, setFecha] = useState(todayIsoDate());
  const [detalle, setDetalle] = useState("");
  const [codigo, setCodigo] = useState("");
  const [trabajador, setTrabajador] = useState("");
  const [revisado, setRevisado] = useState("NO");
  const [bloqueado, setBloqueado] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  const saving = creating || updating;
  const error = createError || updateError;

  useEffect(() => {
    if (!informeId) {
      return;
    }

    const load = async () => {
      try {
        const informe = await getInformeDiario(informeId);
        setCodigo(informe.codigo_informe);
        setFecha(informe.fecha);
        setDetalle(informe.detalle_informe);
        setTrabajador(informe.trabajador?.nombre ?? "—");
        setRevisado(informe.revisado);
        setBloqueado(informe.revisado === "SI");
      } catch (err) {
        console.error(err);
        setUpdateError("No se pudo cargar el informe diario.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [informeId, setUpdateError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setUpdateError(null);

    if (!fecha) {
      setCreateError("Debe indicar la fecha del informe.");
      return;
    }

    if (!detalle.trim()) {
      setCreateError("Debe registrar el contenido del informe.");
      return;
    }

    try {
      if (isEdit && informeId) {
        await update(informeId, { fecha, detalle_informe: detalle });
        navigate(INFORME_DIARIO_ROUTES.detail(informeId));
        return;
      }

      const response = await create({ fecha, detalle_informe: detalle });
      navigate(INFORME_DIARIO_ROUTES.detail(response.data.id));
    } catch {
      // hook
    }
  };

  if (loading) {
    return <div>Cargando formulario...</div>;
  }

  if (bloqueado) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
          El informe {codigo} ya fue revisado y no puede modificarse.
        </div>
        <Button
          size="sm"
          variant="outline"
          type="button"
          onClick={() => navigate(informeId ? INFORME_DIARIO_ROUTES.detail(informeId) : INFORME_DIARIO_ROUTES.list)}
        >
          Volver
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {isEdit && (
          <>
            <div>
              <Label>Código</Label>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">{codigo}</p>
            </div>
            <div>
              <Label>Trabajador</Label>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">{trabajador}</p>
            </div>
            <div>
              <Label>Revisado</Label>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">{revisado}</p>
            </div>
          </>
        )}

        <div>
          <Label>Fecha</Label>
          <InputField
            type="date"
            name="fecha"
            value={fecha}
            onChange={(event) => setFecha(event.target.value)}
          />
        </div>

        <div className="md:col-span-2">
          <Label>Detalle del informe</Label>
          <TextArea
            rows={8}
            value={detalle}
            onChange={setDetalle}
            placeholder="Eventos y actividades de la jornada"
          />
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Button size="sm" type="submit" disabled={saving}>
          {saving ? "Guardando..." : isEdit ? "Actualizar informe" : "Registrar informe"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          type="button"
          onClick={() => navigate(INFORME_DIARIO_ROUTES.list)}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
