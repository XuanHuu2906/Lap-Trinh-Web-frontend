import React, { useCallback, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { ToastContext, type ToastInput, type ToastItem, type ToastVariant } from "./toast";

const variantStyles: Record<ToastVariant, { icon: React.ElementType; className: string; iconClassName: string }> = {
  success: {
    icon: CheckCircle2,
    className: "border-emerald-200 bg-white text-slate-900 dark:border-emerald-900/70 dark:bg-slate-950 dark:text-slate-50",
    iconClassName: "text-emerald-600 dark:text-emerald-400",
  },
  error: {
    icon: XCircle,
    className: "border-red-200 bg-white text-slate-900 dark:border-red-900/70 dark:bg-slate-950 dark:text-slate-50",
    iconClassName: "text-red-600 dark:text-red-400",
  },
  warning: {
    icon: AlertTriangle,
    className: "border-amber-200 bg-white text-slate-900 dark:border-amber-900/70 dark:bg-slate-950 dark:text-slate-50",
    iconClassName: "text-amber-600 dark:text-amber-400",
  },
  info: {
    icon: Info,
    className: "border-indigo-200 bg-white text-slate-900 dark:border-indigo-900/70 dark:bg-slate-950 dark:text-slate-50",
    iconClassName: "text-indigo-600 dark:text-indigo-400",
  },
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback(
    (input: ToastInput | string) => {
      const nextToast: ToastItem = {
        id: Date.now() + Math.round(Math.random() * 1000),
        title: typeof input === "string" ? input : input.title,
        description: typeof input === "string" ? undefined : input.description,
        variant: typeof input === "string" ? "info" : input.variant ?? "info",
        duration: typeof input === "string" ? 4000 : input.duration ?? 4000,
      };

      setToasts((current) => [nextToast, ...current].slice(0, 4));
      window.setTimeout(() => dismissToast(nextToast.id), nextToast.duration);
    },
    [dismissToast],
  );

  const contextValue = useMemo(() => ({ toast, dismissToast }), [toast, dismissToast]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div className="fixed right-4 top-4 z-[100] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3 pointer-events-none">
        {toasts.map((item) => {
          const config = variantStyles[item.variant];
          const Icon = config.icon;

          return (
            <div
              key={item.id}
              className={`pointer-events-auto flex gap-3 rounded-lg border p-4 shadow-lg shadow-slate-900/10 backdrop-blur-sm transition-colors ${config.className}`}
            >
              <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${config.iconClassName}`} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold leading-5">{item.title}</p>
                {item.description && (
                  <p className="mt-1 whitespace-pre-line text-xs leading-5 text-slate-600 dark:text-slate-300">
                    {item.description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismissToast(item.id)}
                className="h-6 w-6 shrink-0 rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                aria-label="Đóng thông báo"
              >
                <X className="mx-auto h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};
