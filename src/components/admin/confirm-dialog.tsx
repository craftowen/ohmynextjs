'use client';

import { useEffect, useRef } from 'react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  variant?: 'default' | 'destructive';
}

export function ConfirmDialog({
  open,
  title,
  description,
  onConfirm,
  onCancel,
  confirmLabel = '확인',
  variant = 'default',
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-desc">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px]" onClick={onCancel} aria-hidden="true" />
      <div className="relative z-50 w-full max-w-[420px] rounded-xl border border-border bg-card p-5 shadow-lg">
        <h2 id="confirm-title" className="text-[14px] font-semibold">{title}</h2>
        <p id="confirm-desc" className="mt-1.5 text-[13px] text-muted-foreground leading-relaxed">{description}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            ref={cancelRef}
            onClick={onCancel}
            className="h-8 rounded-md border border-border px-3 text-[13px] font-medium hover:bg-accent transition-colors"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className={`h-8 rounded-md px-3 text-[13px] font-medium transition-colors ${
              variant === 'destructive'
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
