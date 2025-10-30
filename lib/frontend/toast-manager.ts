// Toast notification manager
import { create } from "zustand";
import type { ToastType, ToastProps } from "@/components/Toast";

interface ToastState {
  toasts: Array<Omit<ToastProps, "onClose"> & { id: string }>;
  addToast: (message: string, type: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (message, type, duration = 5000) => {
    const id = Math.random().toString(36).substring(7);
    set((state) => ({
      toasts: [...state.toasts, { id, message, type, duration }],
    }));
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },
  success: (message) => {
    const id = Math.random().toString(36).substring(7);
    set((state) => ({
      toasts: [...state.toasts, { id, message, type: "success", duration: 5000 }],
    }));
  },
  error: (message) => {
    const id = Math.random().toString(36).substring(7);
    set((state) => ({
      toasts: [...state.toasts, { id, message, type: "error", duration: 7000 }],
    }));
  },
  info: (message) => {
    const id = Math.random().toString(36).substring(7);
    set((state) => ({
      toasts: [...state.toasts, { id, message, type: "info", duration: 5000 }],
    }));
  },
  warning: (message) => {
    const id = Math.random().toString(36).substring(7);
    set((state) => ({
      toasts: [...state.toasts, { id, message, type: "warning", duration: 6000 }],
    }));
  },
}));

