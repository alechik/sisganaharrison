import { useEffect, useMemo, useState } from "react";

import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { useAnimalReferenceOptions } from "@/modules/animales/hooks/useAnimalReferenceOptions";
import { getSiguienteCodigoAnimal } from "@/modules/animales/services";
import { getCategoriasAnimales } from "@/modules/categorias-animales/services";
import { CategoriaAnimal } from "@/modules/categorias-animales/types";
import { useGruposByLote } from "@/modules/grupos/hooks";
import { ESTADOS_NACIMIENTO, SEXOS_NACIMIENTO } from "@/modules/nacimientos/constants";
import { NacimientoAnimalPayload } from "@/modules/nacimientos/types";
import { hoyISO, validarFechaPartoExitoso } from "@/utils/reglasReproductivas";
import { useRegistrarPartoNacimiento } from "../hooks";
import { ServicioReproductivo } from "../types";

interface Props {
  isOpen: boolean;
  servicio: ServicioReproductivo | null;
  onClose: () => void;
  onSaved: (message: string) => void;
}

const emptyAnimal: NacimientoAnimalPayload = {
  arete: "",
  nombre: "",
  raza_id: null,
  estado_productivo_id: null,
  lote_id: null,
  grupo_id: null,
  color: "",
  observaciones: "",
};

export default function RegistrarPartoNacimientoModal({
  isOpen,
  servicio,
  onClose,
  onSaved,
}: Props) {
  const { registrar, loading, error, setError } = useRegistrarPartoNacimiento();
  const [fechaParto, setFechaParto] = useState(hoyISO());
  const [observacionesParto, setObservacionesParto] = useState("");
  const [estadoNacimiento, setEstadoNacimiento] = useState("");
  const [sexo, setSexo] = useState("");
  const [peso, setPeso] = useState("");
  const [causaMuerte, setCausaMuerte] = useState("");
  const [observacionesNacimiento, setObservacionesNacimiento] = useState("");
  const [animal, setAnimal] = useState<NacimientoAnimalPayload>(emptyAnimal);
  const [categorias, setCategorias] = useState<CategoriaAnimal[]>([]);
  const [codigoPreview, setCodigoPreview] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const { options: grupoOptions, loading: loadingGrupos } = useGruposByLote(animal.lote_id ?? null);
  const {
    razaOptions,
    estadoProductivoOptions,
    loteOptions,
    loading: loadingRefs,
    error: refsError,
  } = useAnimalReferenceOptions();

  const esVivo = estadoNacimiento === "VIVO";
  const esMuerto = estadoNacimiento === "MUERTO";
  const categoriaCria = useMemo(
    () => categorias.find((item) => item.codigo === "TERNEROS") ?? null,
    [categorias]
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    setFechaParto(hoyISO());
    setObservacionesParto("");
    setEstadoNacimiento("");
    setSexo("");
    setPeso("");
    setCausaMuerte("");
    setObservacionesNacimiento("");
    setAnimal(emptyAnimal);
    setCodigoPreview("");
    setValidationError(null);
    setError(null);
  }, [isOpen, setError]);

  useEffect(() => {
    getCategoriasAnimales({ activo: true, per_page: 100, sort_by: "nombre", sort_dir: "asc" })
      .then((response) => setCategorias(response.data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!esVivo || !categoriaCria) {
      setCodigoPreview("");
      return;
    }
    getSiguienteCodigoAnimal(categoriaCria.id)
      .then(setCodigoPreview)
      .catch(() => setCodigoPreview(""));
  }, [categoriaCria, esVivo]);

  const handleAnimalChange = (partial: NacimientoAnimalPayload) => {
    setAnimal((current) => ({ ...current, ...partial }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!servicio) {
      return;
    }

    setValidationError(null);
    setError(null);

    const fechaError = validarFechaPartoExitoso({
      fechaParto,
      fechaServicio: servicio.fecha_servicio,
      fechaConfirmacion: servicio.gestacion?.fecha_confirmacion,
    });
    if (fechaError) {
      setValidationError(fechaError);
      return;
    }
    if (!estadoNacimiento) {
      setValidationError("Debe indicar si el nacimiento es VIVO o MUERTO.");
      return;
    }
    if (!sexo) {
      setValidationError("El sexo de la cría es obligatorio.");
      return;
    }
    if (esMuerto && !causaMuerte.trim()) {
      setValidationError("La causa de muerte es obligatoria para nacimientos muertos.");
      return;
    }

    const nacimiento = esMuerto
      ? {
          sexo,
          peso_nacimiento: peso ? Number(peso) : null,
          estado_nacimiento: "MUERTO",
          causa_muerte: causaMuerte,
          observaciones: observacionesNacimiento || null,
        }
      : {
          sexo,
          peso_nacimiento: peso ? Number(peso) : null,
          estado_nacimiento: "VIVO",
          causa_muerte: null,
          observaciones: observacionesNacimiento || null,
          arete: animal.arete || null,
          animal: {
            arete: animal.arete || null,
            nombre: animal.nombre || null,
            raza_id: animal.raza_id ?? null,
            estado_productivo_id: animal.estado_productivo_id ?? null,
            lote_id: animal.lote_id ?? null,
            grupo_id: animal.grupo_id ?? null,
            color: animal.color || null,
            observaciones: animal.observaciones || null,
          },
        };

    try {
      const response = await registrar(servicio.id, {
        fecha_parto: fechaParto,
        observaciones: observacionesParto || null,
        nacimiento,
      });
      onSaved(response.message);
      onClose();
    } catch {
      // handled in hook
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-h-[90vh] max-w-4xl overflow-y-auto p-6">
      <form onSubmit={handleSubmit}>
        <h3 className="pr-10 text-lg font-semibold text-gray-800 dark:text-white">
          Registrar parto y nacimiento
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          El parto y un único nacimiento se guardan juntos. La fecha probable es informativa; el
          parto real debe haber ocurrido entre 8,5 y 9,5 meses después del servicio.
        </p>

        {(validationError || error || refsError) && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            {validationError || error || refsError}
          </div>
        )}

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <h4 className="font-semibold text-gray-800 dark:text-white">Datos del parto</h4>
          </div>
          <div>
            <Label>Fecha de parto</Label>
            <InputField
              type="date"
              value={fechaParto}
              onChange={(e) => setFechaParto(e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <Label>Observaciones del parto</Label>
            <TextArea rows={2} value={observacionesParto} onChange={setObservacionesParto} />
          </div>

          <div className="md:col-span-2">
            <h4 className="font-semibold text-gray-800 dark:text-white">Datos del nacimiento</h4>
          </div>
          <div>
            <Label>Resultado</Label>
            <Select
              value={estadoNacimiento}
              placeholder="VIVO o MUERTO"
              options={ESTADOS_NACIMIENTO.map((item) => ({ value: item.value, label: item.label }))}
              onChange={(value) => {
                setEstadoNacimiento(value);
                if (value === "VIVO") {
                  setCausaMuerte("");
                } else {
                  setAnimal(emptyAnimal);
                }
              }}
            />
          </div>
          <div>
            <Label>Sexo</Label>
            <Select
              value={sexo}
              placeholder="Seleccione el sexo"
              options={SEXOS_NACIMIENTO.map((item) => ({ value: item.value, label: item.label }))}
              onChange={setSexo}
            />
          </div>

          {esVivo && (
            <>
              <div>
                <Label>Código (generado automáticamente)</Label>
                <InputField type="text" value={loadingRefs ? "Cargando..." : codigoPreview} disabled />
              </div>
              <div>
                <Label>Categoría</Label>
                <InputField
                  type="text"
                  value={categoriaCria ? `${categoriaCria.codigo} — ${categoriaCria.nombre}` : "TERNEROS"}
                  disabled
                />
              </div>
              <div>
                <Label>Fecha de nacimiento</Label>
                <InputField type="date" value={fechaParto} disabled />
              </div>
              <div>
                <Label>Arete</Label>
                <InputField
                  type="text"
                  value={animal.arete ?? ""}
                  onChange={(e) => handleAnimalChange({ arete: e.target.value.toUpperCase() })}
                />
              </div>
              <div>
                <Label>Nombre</Label>
                <InputField
                  type="text"
                  value={animal.nombre ?? ""}
                  onChange={(e) => handleAnimalChange({ nombre: e.target.value })}
                />
              </div>
              <div>
                <Label>Raza</Label>
                <Select
                  value={animal.raza_id ? String(animal.raza_id) : ""}
                  placeholder="Sin raza"
                  options={razaOptions}
                  onChange={(value) => handleAnimalChange({ raza_id: value ? Number(value) : null })}
                />
              </div>
              <div>
                <Label>Estado productivo</Label>
                <Select
                  value={animal.estado_productivo_id ? String(animal.estado_productivo_id) : ""}
                  placeholder="Sin estado"
                  options={estadoProductivoOptions}
                  onChange={(value) =>
                    handleAnimalChange({ estado_productivo_id: value ? Number(value) : null })
                  }
                />
              </div>
              <div>
                <Label>Potrero</Label>
                <Select
                  value={animal.lote_id ? String(animal.lote_id) : ""}
                  placeholder="Sin potrero"
                  options={loteOptions}
                  onChange={(value) =>
                    handleAnimalChange({ lote_id: value ? Number(value) : null, grupo_id: null })
                  }
                />
              </div>
              <div>
                <Label>Grupo</Label>
                <Select
                  value={animal.grupo_id ? String(animal.grupo_id) : ""}
                  placeholder={!animal.lote_id ? "Seleccione un potrero" : loadingGrupos ? "Cargando..." : "Sin grupo"}
                  options={grupoOptions}
                  onChange={(value) => handleAnimalChange({ grupo_id: value ? Number(value) : null })}
                />
              </div>
              <div>
                <Label>Madre</Label>
                <InputField type="text" value="Se toma del servicio" disabled />
              </div>
              <div>
                <Label>Padre</Label>
                <InputField type="text" value="Se toma del servicio" disabled />
              </div>
              <div>
                <Label>Color</Label>
                <InputField
                  type="text"
                  value={animal.color ?? ""}
                  onChange={(e) => handleAnimalChange({ color: e.target.value })}
                />
              </div>
              <div>
                <Label>Peso de nacimiento (kg)</Label>
                <InputField type="number" step={0.01} value={peso} onChange={(e) => setPeso(e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <Label>Observaciones del animal</Label>
                <TextArea
                  rows={2}
                  value={animal.observaciones ?? ""}
                  onChange={(value) => handleAnimalChange({ observaciones: value })}
                />
              </div>
            </>
          )}

          {esMuerto && (
            <>
              <div>
                <Label>Peso de nacimiento (kg)</Label>
                <InputField type="number" step={0.01} value={peso} onChange={(e) => setPeso(e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <Label>Causa de muerte</Label>
                <InputField
                  type="text"
                  value={causaMuerte}
                  onChange={(e) => setCausaMuerte(e.target.value)}
                />
              </div>
            </>
          )}

          {estadoNacimiento && (
            <div className="md:col-span-2">
              <Label>Observaciones del nacimiento</Label>
              <TextArea rows={2} value={observacionesNacimiento} onChange={setObservacionesNacimiento} />
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button size="sm" variant="outline" type="button" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button size="sm" type="submit" disabled={loading}>
            {loading ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
