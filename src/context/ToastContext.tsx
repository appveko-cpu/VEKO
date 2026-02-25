"use client";
import { createContext, useContext, useState, useCallback } from "react";

type ToastType = "success" | "warning" | "error" | "info";

type Toast = {
  id: number;
  message: string;
  type: ToastType;
};

type ToastContextType = {
  showToast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast doit être utilisé dans ToastProvider");
  return ctx;
}

const COLORS: Record<ToastType, { bg: string; border: string; icon: string }> = {
  success: { bg: "rgba(16,185,129,0.15)", border: "rgba(16,185,129,0.4)", icon: "fa-check-circle" },
  error:   { bg: "rgba(239,68,68,0.15)",  border: "rgba(239,68,68,0.4)",  icon: "fa-exclamation-circle" },
  warning: { bg: "rgba(245,158,11,0.15)", border: "rgba(245,158,11,0.4)", icon: "fa-triangle-exclamation" },
  info:    { bg: "rgba(59,130,246,0.15)", border: "rgba(59,130,246,0.4)", icon: "fa-circle-info" },
};

const ICON_COLORS: Record<ToastType, string> = {
  success: "#10b981",
  error:   "#ef4444",
  warning: "#f59e0b",
  info:    "#3b82f6",
};

let nextId = 1;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = nextId++;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        style={{
          position: "fixed",
          top: "80px",
          right: "16px",
          zIndex: 99999,
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          pointerEvents: "none",
        }}
      >
        {toasts.map(t => {
          const c = COLORS[t.type];
          return (
            <div
              key={t.id}
              style={{
                background: c.bg,
                border: `1px solid ${c.border}`,
                borderRadius: "12px",
                padding: "12px 16px",
                fontSize: "13px",
                fontWeight: 700,
                color: "var(--text-primary)",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                backdropFilter: "blur(12px)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                maxWidth: "320px",
                animation: "toastIn 0.25s ease",
                pointerEvents: "auto",
              }}
            >
              <i
                className={`fas ${c.icon}`}
                style={{ color: ICON_COLORS[t.type], fontSize: "15px", flexShrink: 0 }}
              />
              {t.message}
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(24px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </ToastContext.Provider>
  );
}
