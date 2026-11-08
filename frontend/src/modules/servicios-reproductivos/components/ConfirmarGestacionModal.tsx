import { useEffect, useState } from "react";

import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { fechaProbableParto, hoyISO, validarFechasGestacion } from "@/utils/reglasReproductivas";
import { useConfirmarGestacion } from "../hooks";
import { ServicioReproductivo } from "../types";

interface Props {
  isOpen: boolean;
  servicio: ServicioReproductivo | null;
  onClose: () => void;
  onSaved: (message: string) => void;
}

export default function ConfirmarGestacionModal({ isOpen, servicio, onClose, onSaved }: Props) {
  const { confirmar, loading, error, setError } = useConfirmarGestacion();
  const [fechaConfirmacion, setFechaConfirmacion] = useState(hoyISO());
  const [fechaProbable, setFechaProbable] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !servicio) {
      return;
    }

    const confirmacion = servicio.gestacion?.fecha_confirmacion || hoyISO();
    setFechaConfirmacion(confirmacion);
    setFechaProbable(
      servicio.gestacion?.fecha_probable_parto || fechaProbableParto(confirmacion)
    );
    setObservaciones(servicio.gestacion?.observaciones ?? "");
    setValidationError(null);
    setError(null);
  }, [isOpen, servicio, setError]);

  const handleConfirmacionChange = (value: string) => {
    setFechaConfirmacion(value);
    setFechaProbable(value ? fechaProbableParto(value) : "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!servicio) {
      return;
    }

    setValidationError(null);
    setError(null);

    const fechaError = validarFechasGestacion({
      fechaConfirmacion,
      fechaProbableParto: fechaProbable,
      fechaServicio: servicio.fecha_servicio,
    });
    if (fechaError) {
      setValidationError(fechaError);
      return;
    }

    try {
      const response = await confirmar(servicio.id, {
        fecha_confirmacion: fechaConfirmacion,
        fecha_probable_parto: fechaProbable || null,
        observaciones: observaciones || null,
      });
      onSaved(response.message);
      onClose();
    } catch {
      // handled in hook
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-xl p-6">
      <form onSubmit={handleSubmit}>
        <h3 className="pr-10 text-lg font-semibold text-gray-800 dark:text-white">
          Confirmar gestación
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          La fecha probable se calcula a 283 días desde la confirmación. Es informativa y no impide
          registrar el parto real.
        </p>

        {(validationError || error) && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            {validationError || error}
          </div>
        )}

        <div className="mt-4 grid grid-cols-1 gap-4">
          <div>
            <Label>Fecha de confirmación</Label>
            <InputField
              type="date"
              value={fechaConfirmacion}
              min={servicio?.fecha_servicio}
              max={hoyISO()}
              onChange={(e) => handleConfirmacionChange(e.target.value)}
            />
          </div>
          <div>
            <Label>Fecha probable de parto</Label>
            <InputField
              type="date"
              value={fechaProbable}
              min={fechaConfirmacion || servicio?.fecha_servicio}
              onChange={(e) => setFechaProbable(e.target.value)}
            />
          </div>
          <div>
            <Label>Observaciones</Label>
            <TextArea rows={3} value={observaciones} onChange={setObservaciones} />
          </div>
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
