"use client";
import { createContext, useContext, useState, useCallback } from "react";

type FelicitationContextType = {
  showFelicitation: (message: string) => void;
};

const FelicitationContext = createContext<FelicitationContextType | null>(null);

export function useFelicitation() {
  const ctx = useContext(FelicitationContext);
  if (!ctx) throw new Error("useFelicitation doit être utilisé dans FelicitationProvider");
  return ctx;
}

export function FelicitationProvider({ children }: { children: import("react").ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  const showFelicitation = useCallback((msg: string) => {
    setMessage(msg);
    setVisible(true);
    setTimeout(() => setVisible(false), 4000);
  }, []);

  if (!visible || !message) {
    return (
      <FelicitationContext.Provider value={{ showFelicitation }}>
        {children}
      </FelicitationContext.Provider>
    );
  }

  return (
    <FelicitationContext.Provider value={{ showFelicitation }}>
      {children}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 999999,
          padding: "20px",
          animation: "fadeIn 0.3s ease",
        }}
        onClick={() => setVisible(false)}
      >
        <div
          style={{
            background: "var(--dark-card)",
            border: "1px solid var(--diamond-border)",
            borderRadius: "24px",
            padding: "40px 32px",
            textAlign: "center",
            maxWidth: "340px",
            width: "100%",
            boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
            animation: "popIn 0.35s cubic-bezier(0.34,1.56,0.64,1)",
          }}
          onClick={e => e.stopPropagation()}
        >
          <div style={{ fontSize: "56px", marginBottom: "16px" }}>🎉</div>
          <div
            style={{
              fontSize: "22px",
              fontWeight: 900,
              background: "linear-gradient(135deg,#8b5cf6,#ec4899)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: "12px",
              lineHeight: 1.2,
            }}
          >
            Félicitations !
          </div>
          <div style={{ fontSize: "15px", color: "var(--text-secondary)", fontWeight: 600, lineHeight: 1.5 }}>
            {message}
          </div>
          <button
            onClick={() => setVisible(false)}
            style={{
              marginTop: "24px",
              padding: "12px 32px",
              background: "linear-gradient(135deg,#8b5cf6,#ec4899)",
              border: "none",
              borderRadius: "12px",
              color: "white",
              fontWeight: 700,
              fontSize: "14px",
              cursor: "pointer",
              fontFamily: "var(--font-inter),sans-serif",
            }}
          >
            Super !
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.7) }
          to   { opacity: 1; transform: scale(1) }
        }
      `}</style>
    </FelicitationContext.Provider>
  );
}
