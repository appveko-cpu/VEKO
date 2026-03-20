"use client";
import { useAccess } from "@/context/AccessContext";
import Link from "next/link";

export default function AuthPromptModal() {
  const { showAuthModal, setShowAuthModal } = useAccess();
  if (!showAuthModal) return null;
  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px",
      }}
      onClick={() => setShowAuthModal(false)}
    >
      <div
        style={{
          background: "var(--dark-card)",
          border: "1px solid var(--diamond-border)",
          borderRadius: "20px",
          padding: "36px 32px",
          maxWidth: "420px",
          width: "100%",
          textAlign: "center",
          boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          width: "60px", height: "60px", borderRadius: "16px",
          background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "26px", color: "white", margin: "0 auto 20px",
        }}>
          <i className="fas fa-chart-line"></i>
        </div>

        <h2 style={{ fontSize: "22px", fontWeight: 900, color: "var(--text-primary)", margin: "0 0 12px" }}>
          Prêt à voir ta réalité ?
        </h2>
        <p style={{ fontSize: "15px", color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 28px" }}>
          Pour utiliser VEKO avec tes propres chiffres, crée ton compte gratuitement.
          Tu as <strong style={{ color: "#10b981" }}>6 actions gratuites</strong> pour tester.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <Link
            href="/signup"
            style={{
              display: "block", padding: "14px", borderRadius: "12px",
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              color: "white", fontWeight: 800, fontSize: "15px",
              textDecoration: "none", textAlign: "center",
            }}
            onClick={() => setShowAuthModal(false)}
          >
            <i className="fas fa-user-plus" style={{ marginRight: "8px" }}></i>
            Créer mon compte
          </Link>
          <Link
            href="/login"
            style={{
              display: "block", padding: "14px", borderRadius: "12px",
              background: "var(--dark-elevated)", border: "1px solid var(--diamond-border)",
              color: "var(--text-primary)", fontWeight: 700, fontSize: "15px",
              textDecoration: "none", textAlign: "center",
            }}
            onClick={() => setShowAuthModal(false)}
          >
            <i className="fas fa-right-to-bracket" style={{ marginRight: "8px" }}></i>
            Se connecter
          </Link>
        </div>

        <button
          onClick={() => setShowAuthModal(false)}
          style={{
            marginTop: "20px", background: "none", border: "none",
            color: "var(--text-muted)", fontSize: "13px", cursor: "pointer",
          }}
        >
          Continuer en mode démo
        </button>
      </div>
    </div>
  );
}
