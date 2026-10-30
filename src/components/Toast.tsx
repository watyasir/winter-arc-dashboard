"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export interface ToastMessage {
  text: string;
  tone?: "plain" | "danger";
  /** Shows an Undo button; runs once, then the toast closes. */
  undo?: () => void;
}

type Show = (t: ToastMessage) => void;

const ToastContext = createContext<Show>(() => {});

/** Shows a toast: one at a time (a new one replaces the old), bottom centre, 4.5 seconds. */
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<(ToastMessage & { id: number }) | null>(null);
  const show = useCallback<Show>((t) => setToast({ ...t, id: Date.now() }), []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-4 bottom-[calc(80px+env(safe-area-inset-bottom))] z-50 flex justify-center min-[561px]:bottom-8">
        {toast && (
          <div
            key={toast.id}
            role={toast.tone === "danger" ? "alert" : "status"}
            className={`pointer-events-auto flex min-h-12 max-w-[420px] animate-toast-in items-center gap-3 rounded-full py-1.5 pr-1.5 pl-5 text-sm font-semibold shadow-lift ${
              toast.tone === "danger" ? "bg-danger-soft text-danger" : "bg-hero text-white"
            }`}
          >
            <span className="py-2">{toast.text}</span>
            {toast.undo && (
              <button
                type="button"
                onClick={() => {
                  toast.undo?.();
                  setToast(null);
                }}
                className="press min-h-11 cursor-pointer rounded-full border-0 bg-dot-on px-4 text-sm font-bold text-hero"
              >
                Undo
              </button>
            )}
            {!toast.undo && <span className="w-3" />}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}
