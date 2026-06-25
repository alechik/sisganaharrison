import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";

interface Props {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  loading = false,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} className="max-w-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
        {title}
      </h3>

      <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
        {message}
      </p>

      <div className="mt-6 flex justify-end gap-3">
        <Button size="sm" variant="outline" onClick={onCancel} disabled={loading}>
          {cancelLabel}
        </Button>

        <Button size="sm" onClick={onConfirm} disabled={loading}>
          {loading ? "Procesando..." : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
