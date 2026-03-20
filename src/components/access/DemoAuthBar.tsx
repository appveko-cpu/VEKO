"use client";
import Link from "next/link";
import { useAccess } from "@/context/AccessContext";

export default function DemoAuthBar() {
  const { isDemoMode } = useAccess();
  if (!isDemoMode) return null;

  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(59,130,246,0.18), rgba(139,92,246,0.12))",
      borderBottom: "1px solid rgba(99,102,241,0.35)",
      borderTop: "3px solid #3b82f6",
      padding: "0 20px",
      height: "54px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "12px",
      flexShrink: 0,
      zIndex: 100,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
        <div style={{
          width: "30px", height: "30px", borderRadius: "8px",
          background: "rgba(239,68,68,0.15)",
          border: "1px solid rgba(239,68,68,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <i className="fas fa-user-slash" style={{ color: "#ef4444", fontSize: "12px" }}></i>
        </div>
        <span style={{
          fontSize: "13px", color: "var(--text-secondary)",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          <strong style={{ color: "var(--text-primary)" }}>Tu n'es pas connecté</strong>
          {" "}— Crée un compte pour sauvegarder tes données
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
        <Link
          href="/login"
          style={{
            padding: "7px 16px",
            borderRadius: "9px",
            background: "var(--dark-card)",
            border: "1px solid var(--diamond-border)",
            color: "var(--text-primary)",
            fontWeight: 700,
            fontSize: "13px",
            textDecoration: "none",
            whiteSpace: "nowrap",
          }}
        >
          Se connecter
        </Link>
        <Link
          href="/login?tab=signup"
          style={{
            padding: "7px 16px",
            borderRadius: "9px",
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            border: "none",
            color: "white",
            fontWeight: 700,
            fontSize: "13px",
            textDecoration: "none",
            whiteSpace: "nowrap",
          }}
        >
          Créer mon compte
        </Link>
      </div>
    </div>
  );
}
