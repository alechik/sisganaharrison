import { useState } from "react";

import PermissionGate from "@/components/auth/PermissionGate";
import ComponentCard from "@/components/common/ComponentCard";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import TextArea from "@/components/form/input/TextArea";
import Label from "@/components/form/Label";
import { useDecidirOrdenProducto } from "../hooks";
import { COMPRAS_PRODUCTOS_PERMISSIONS } from "../permissions";
import { OrdenCompraProducto } from "../types";
import { isPendiente } from "../utils";

interface Props {
  orden: OrdenCompraProducto;
  onDecided: (orden: OrdenCompraProducto) => void;
}

export default function OrdenProductoDecisionCard({ orden, onDecided }: Props) {
  const [observacion, setObservacion] = useState("");
  const [dialog, setDialog] = useState<"autorizar" | "cancelar" | null>(null);
  const { autorizar, cancelar, loading, error, setError } = useDecidirOrdenProducto();

  if (!isPendiente(orden.estado)) {
    return null;
  }

  const handleConfirm = async () => {
    try {
      const response =
        dialog === "autorizar"
          ? await autorizar(orden.id, observacion)
          : await cancelar(orden.id, observacion);
      onDecided(response.data);
      setDialog(null);
      setObservacion("");
    } catch {
      // handled
    }
  };

  return (
    <PermissionGate permission={COMPRAS_PRODUCTOS_PERMISSIONS.authorize}>
      <ComponentCard title="Autorización">
        {error && (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </div>
        )}
        <Label>Observación (opcional)</Label>
        <TextArea
          value={observacion}
          onChange={setObservacion}
          placeholder="Motivo de autorización o cancelación"
        />
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={() => {
              setError(null);
              setDialog("autorizar");
            }}
            className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-3 text-sm text-white hover:bg-brand-600"
          >
            Autorizar
          </button>
          <button
            type="button"
            onClick={() => {
              setError(null);
              setDialog("cancelar");
            }}
            className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-3 text-sm text-red-600 ring-1 ring-inset ring-red-200 hover:bg-red-50 dark:bg-gray-800 dark:text-red-400 dark:ring-red-500/30 dark:hover:bg-red-500/10"
          >
            Cancelar
          </button>
        </div>
      </ComponentCard>

      <ConfirmDialog
        isOpen={dialog !== null}
        title={dialog === "autorizar" ? "Autorizar orden" : "Cancelar orden"}
        message={
          dialog === "autorizar"
            ? `¿Confirma la autorización de ${orden.cod_compra}? Quedará bloqueada para edición.`
            : `¿Confirma la cancelación de ${orden.cod_compra}? No podrá modificarse.`
        }
        confirmLabel={dialog === "autorizar" ? "Autorizar" : "Cancelar orden"}
        loading={loading}
        onConfirm={handleConfirm}
        onCancel={() => setDialog(null)}
      />
    </PermissionGate>
  );
}
