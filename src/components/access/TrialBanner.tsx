"use client";
import { useState } from "react";
import { useAccess } from "@/context/AccessContext";
import { ACCESS_SYSTEM_ENABLED } from "@/lib/feature-flags";

export default function TrialBanner() {
  const { plan, isAuthenticated, setShowPricingModal } = useAccess();
  const [dismissed, setDismissed] = useState(false);

  if (!ACCESS_SYSTEM_ENABLED) return null;
  if (!isAuthenticated) return null;
  if (plan !== "free") return null;
  if (dismissed) return null;

  return (
    <div style={{
      background: "var(--dark-elevated)",
      borderBottom: "1px solid var(--diamond-border)",
      padding: "0 16px",
      height: "44px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "12px",
      flexShrink: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
        <i className="fas fa-star" style={{ color: "#f59e0b", fontSize: "13px", flexShrink: 0 }}></i>
        <span style={{ fontSize: "13px", color: "var(--text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          Essai gratuit — Passe à un plan payant pour un accès illimité
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
        <button
          onClick={() => setShowPricingModal(true)}
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: "#3b82f6", fontSize: "13px", fontWeight: 700,
            whiteSpace: "nowrap",
          }}
        >
          Voir les plans →
        </button>
        <button
          onClick={() => setDismissed(true)}
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: "var(--text-muted)", fontSize: "16px", lineHeight: 1,
          }}
        >
          <i className="fas fa-xmark"></i>
        </button>
      </div>
    </div>
  );
}
