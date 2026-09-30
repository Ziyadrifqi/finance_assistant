"use client";

import { Modal } from "./Modal";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Hapus",
  danger = true,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <p className="text-sm text-[var(--color-muted)] mb-5">{message}</p>
      <div className="flex gap-2">
        <button
          onClick={onConfirm}
          className={`flex-1 text-sm font-medium py-2.5 rounded-lg text-white transition-opacity active:scale-[0.98] ${
            danger ? "bg-red-500 hover:opacity-90" : "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] hover:opacity-90"
          }`}
        >
          {confirmLabel}
        </button>
        <button
          onClick={onCancel}
          className="flex-1 text-sm font-medium py-2.5 rounded-lg border border-[var(--color-border)] text-[var(--foreground)] hover:bg-[var(--background)] transition-colors"
        >
          Batal
        </button>
      </div>
    </Modal>
  );
}