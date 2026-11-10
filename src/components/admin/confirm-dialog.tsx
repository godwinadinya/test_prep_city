"use client";

import { useEffect, useRef, type ReactNode } from "react";

export function ConfirmDialog(props: {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  danger?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { open, title, message, confirmLabel = "Confirm", danger = false, busy = false, onConfirm, onCancel } = props;
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) onCancel();
      }}
      className="w-[min(28rem,92vw)] rounded-2xl bg-white p-6 text-navy-900 shadow-xl backdrop:bg-black/50 dark:bg-navy-900 dark:text-white"
    >
      <h2 className="text-lg font-black">{title}</h2>
      <div className="mt-2 text-sm text-neutral-600 dark:text-white/80">{message}</div>
      <div className="mt-5 flex justify-end gap-2">
        <button type="button" onClick={onCancel} disabled={busy} className="btn-ghost px-4 py-2 text-sm disabled:opacity-60">
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className={
            danger
              ? "rounded-xl bg-red-700 px-4 py-2 text-sm font-bold text-white hover:bg-red-800 disabled:opacity-60"
              : "btn-primary px-4 py-2 text-sm disabled:opacity-60"
          }
        >
          {busy ? "Working…" : confirmLabel}
        </button>
      </div>
    </dialog>
  );
}