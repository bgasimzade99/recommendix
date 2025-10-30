"use client";

import { useToastStore } from "@/lib/frontend/toast-manager";
import { ToastContainer, type ToastProps } from "./Toast";

export function ToastProvider() {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);

  const toastsWithClose: ToastProps[] = toasts.map((toast) => ({
    ...toast,
    onClose: removeToast,
  }));

  return <ToastContainer toasts={toastsWithClose} />;
}

