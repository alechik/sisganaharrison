import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import RegistradoPorField from "@/components/form/RegistradoPorField";
import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";
import { hoyISO, validarFechaServicio } from "@/utils/reglasReproductivas";
import {
  SERVICIO_REPRODUCTIVO_ROUTES,
  TIPO_INSEMINACION_ARTIFICIAL,
  TIPO_MONTA_NATURAL,
} from "../constants";
import { useCreateServicioReproductivo, useUpdateServicioReproductivo } from "../hooks";
import { getServicioReproductivo } from "../services";
import { ServicioReproductivoCreateRequest } from "../types";
import { formatAnimalLabel } from "../utils";
import ReproAnimalSelect, { ReproAnimalOption, animalToOption } from "./ReproAnimalSelect";

interface Props {
  servicioId?: number;
  tipoServicioFijo?: string;
}

const sectionClass =
  "rounded-xl border border-gray-200 bg-gray-50/60 p-4 dark:border-white/[0.06] dark:bg-white/[0.02] sm:p-5";

const emptyForm = (tipoServicio = TIPO_MONTA_NATURAL): ServicioReproductivoCreateRequest => ({
  hembra_id: 0,
  macho_id: null,
  fecha_servicio: hoyISO(),
  tipo_servicio: tipoServicio,
  observaciones: "",
});

export default function ServicioReproductivoForm({ servicioId, tipoServicioFijo }: Props) {
  const navigate = useNavigate();
  const isEdit = Boolean(servicioId);
  const tipoFijo = tipoServicioFijo ?? TIPO_MONTA_NATURAL;
  const esIa = tipoFijo === TIPO_INSEMINACION_ARTIFICIAL;

  const { create, loading: creating, error: createError, setError: setCreateError } =
    useCreateServicioReproductivo();
  const { update, loading: updating, error: updateError, setError: setUpdateError } =
    useUpdateServicioReproductivo();

  const [form, setForm] = useState<ServicioReproductivoCreateRequest>(emptyForm(tipoFijo));
  const [hembraOption, setHembraOption] = useState<ReproAnimalOption | null>(null);
  const [machoOption, setMachoOption] = useState<ReproAnimalOption | null>(null);
  const [loading, setLoading] = useState(isEdit);
  const [registradoPorNombre, setRegistradoPorNombre] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [semenNombre, setSemenNombre] = useState<string | null>(null);

  const saving = creating || updating;
  const error = createError || updateError;
  const listPath = SERVICIO_REPRODUCTIVO_ROUTES.listByTipo(form.tipo_servicio || tipoFijo);

  useEffect(() => {
    if (!servicioId) {
      return;
    }

    const loadServicio = async () => {
      try {
        const servicio = await getServicioReproductivo(servicioId);
        setForm({
          hembra_id: servicio.hembra_id,
          macho_id: servicio.macho_id,
          fecha_servicio: servicio.fecha_servicio,
          tipo_servicio: servicio.tipo_servicio,
          observaciones: servicio.observaciones ?? "",
        });
        setRegistradoPorNombre(servicio.usuario_nombre ?? null);
        setSemenNombre(servicio.semen_nombre ?? null);
        if (servicio.hembra_id) {
          setHembraOption(
            animalToOption({
              id: servicio.hembra_id,
              codigo: servicio.hembra_codigo ?? "",
              arete: servicio.hembra_arete ?? null,
            })
          );
        }
        if (servicio.macho_id) {
          setMachoOption(
            animalToOption({
              id: servicio.macho_id,
              codigo: servicio.macho_codigo ?? "",
              arete: servicio.macho_arete ?? null,
            })
          );
        }
      } catch (err) {
        console.error(err);
        setUpdateError("No se pudo cargar el servicio reproductivo.");
      } finally {
        setLoading(false);
      }
    };

    loadServicio();
  }, [servicioId, setUpdateError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setUpdateError(null);
    setValidationError(null);

    if (!form.hembra_id) {
      setValidationError("Debe seleccionar una hembra.");
      return;
    }

    const tipo = form.tipo_servicio || tipoFijo;
    if (tipo === TIPO_MONTA_NATURAL && !form.macho_id) {
      setValidationError("La monta natural requiere un macho.");
      return;
    }

    if (form.macho_id && form.macho_id === form.hembra_id) {
      setValidationError("La hembra y el macho no pueden ser el mismo animal.");
      return;
    }

    const fechaError = validarFechaServicio(form.fecha_servicio);
    if (fechaError) {
      setValidationError(fechaError);
      return;
    }

    const payload: ServicioReproductivoCreateRequest = {
      hembra_id: form.hembra_id,
      macho_id: form.macho_id || null,
      fecha_servicio: form.fecha_servicio,
      tipo_servicio: tipo,
      observaciones: form.observaciones || null,
    };

    try {
      if (isEdit && servicioId) {
        await update(servicioId, payload);
        navigate(SERVICIO_REPRODUCTIVO_ROUTES.detail(servicioId));
      } else {
        const response = await create(payload);
        navigate(SERVICIO_REPRODUCTIVO_ROUTES.detail(response.data.id));
      }
    } catch {
      // handled
    }
  };

  if (loading) {
    return <div>Cargando formulario...</div>;
  }

  const displayError = validationError || error;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {displayError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {displayError}
        </div>
      )}

      <section className={`${sectionClass} space-y-4`}>
        <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90">
          {esIa ? "Inseminación artificial" : "Monta natural"}
        </h3>
        <div className="flex flex-wrap items-end gap-x-3 gap-y-3">
          {isEdit ? (
            <div className="w-full sm:w-[14rem]">
              <RegistradoPorField nombre={registradoPorNombre} />
            </div>
          ) : null}
          <div className="min-w-0 w-full sm:min-w-[16rem] sm:flex-[1.2_1_16rem]">
            <Label>Hembra</Label>
            <ReproAnimalSelect
              sexo="H"
              value={hembraOption}
              excludedIds={form.macho_id ? [form.macho_id] : []}
              onChange={(option) => {
                setHembraOption(option);
                setForm((current) => ({ ...current, hembra_id: option?.value ?? 0 }));
              }}
            />
          </div>
          {!esIa && (
            <div className="min-w-0 w-full sm:min-w-[16rem] sm:flex-[1.2_1_16rem]">
              <Label>Macho</Label>
              <ReproAnimalSelect
                sexo="M"
                value={machoOption}
                excludedIds={form.hembra_id ? [form.hembra_id] : []}
                onChange={(option) => {
                  setMachoOption(option);
                  setForm((current) => ({ ...current, macho_id: option?.value ?? null }));
                }}
              />
            </div>
          )}
          {esIa && (
            <div className="min-w-0 w-full sm:min-w-[14rem] sm:flex-1">
              <Label>Semen</Label>
              <InputField type="text" value={semenNombre || "—"} disabled />
            </div>
          )}
          <div className="w-full shrink-0 sm:w-[10.5rem]">
            <Label>Fecha del servicio</Label>
            <InputField
              type="date"
              name="fecha_servicio"
              value={form.fecha_servicio}
              max={hoyISO()}
              onChange={(e) => setForm((current) => ({ ...current, fecha_servicio: e.target.value }))}
            />
          </div>
          <div className="min-w-0 w-full sm:min-w-[16rem] sm:flex-[1_1_16rem]">
            <Label>Observaciones</Label>
            <TextArea
              rows={1}
              value={form.observaciones ?? ""}
              onChange={(value) => setForm((current) => ({ ...current, observaciones: value }))}
            />
          </div>
        </div>
        {hembraOption ? (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Hembra: {formatAnimalLabel(hembraOption.animal.codigo, hembraOption.animal.arete)}
          </p>
        ) : null}
      </section>

      <div className="flex flex-wrap gap-3">
        <Button size="sm" type="submit" disabled={saving}>
          {saving ? "Guardando..." : isEdit ? "Actualizar servicio" : "Registrar monta"}
        </Button>
        <Button size="sm" variant="outline" type="button" onClick={() => navigate(listPath)}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
