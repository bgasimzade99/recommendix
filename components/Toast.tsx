"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { fadeInVariants } from "@/lib/frontend/animations";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  onClose: (id: string) => void;
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const colors = {
  success: "bg-green-50 text-green-800 dark:bg-green-950/30 dark:text-green-400",
  error: "bg-red-50 text-red-800 dark:bg-red-950/30 dark:text-red-400",
  info: "bg-blue-50 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400",
  warning: "bg-yellow-50 text-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-400",
};

export function Toast({ id, message, type, duration = 5000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const Icon = icons[type];
  const colorClasses = colors[type];

  return (
    <motion.div
      variants={fadeInVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={`
        relative flex items-start gap-3 rounded-xl border p-4 shadow-lg
        ${colorClasses}
        border-current/20 dark:border-current/30
      `}
      role="alert"
      aria-live="polite"
    >
      <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={() => onClose(id)}
        className="flex-shrink-0 rounded-lg p-1 transition-colors hover:bg-current/10"
        aria-label="Close notification"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

export function ToastContainer({ toasts }: { toasts: Array<ToastProps> }) {
  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex w-full max-w-md flex-col gap-2 px-4"
      aria-label="Notification area"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} />
        ))}
      </AnimatePresence>
    </div>
  );
}

