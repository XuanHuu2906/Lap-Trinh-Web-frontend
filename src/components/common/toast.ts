import { createContext, useContext } from "react";

export type ToastVariant = "success" | "error" | "warning" | "info";

export type ToastInput = {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
};

export type ToastItem = Required<Pick<ToastInput, "title" | "variant" | "duration">> & {
  id: number;
  description?: string;
};

export type ToastContextValue = {
  toast: (input: ToastInput | string) => void;
  dismissToast: (id: number) => void;
};

export const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};
