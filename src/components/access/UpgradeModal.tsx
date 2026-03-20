"use client";
import { useAccess } from "@/context/AccessContext";
import { ACCESS_SYSTEM_ENABLED } from "@/lib/feature-flags";

export default function UpgradeModal() {
  const { showUpgradeModal, setShowUpgradeModal, upgradeFeature, setShowPricingModal } = useAccess();

  if (!ACCESS_SYSTEM_ENABLED) return null;
  if (!showUpgradeModal) return null;

  const featureLabels: Record<string, string> = {
    shopify: "Connexion boutique Shopify",
    charges_fixes: "Gestion des charges fixes",
    labo_history: "Historique des simulations labo",
    multi_boutiques: "Multi-boutiques",
    multi_gestionnaires: "Multi-gestionnaires",
    support_prioritaire: "Support prioritaire",
  };
  const label = upgradeFeature ? (featureLabels[upgradeFeature] ?? upgradeFeature) : "cette fonctionnalité";

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px",
      }}
      onClick={() => setShowUpgradeModal(false)}
    >
      <div
        style={{
          background: "var(--dark-card)",
          border: "1px solid rgba(139,92,246,0.4)",
          borderRadius: "20px",
          padding: "32px 28px",
          maxWidth: "380px",
          width: "100%",
          textAlign: "center",
          boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          width: "52px", height: "52px", borderRadius: "14px",
          background: "linear-gradient(135deg,#8b5cf6,#ec4899)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "22px", color: "white", margin: "0 auto 18px",
        }}>
          <i className="fas fa-crown"></i>
        </div>

        <h3 style={{ fontSize: "20px", fontWeight: 900, color: "var(--text-primary)", margin: "0 0 10px" }}>
          Fonctionnalité Pro
        </h3>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 24px" }}>
          <strong style={{ color: "var(--text-primary)" }}>{label}</strong> est disponible
          dans le plan Pro.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <button
            onClick={() => {
              setShowUpgradeModal(false);
              setShowPricingModal(true);
            }}
            style={{
              padding: "13px", borderRadius: "11px", border: "none", cursor: "pointer",
              background: "linear-gradient(135deg,#8b5cf6,#ec4899)",
              color: "white", fontWeight: 800, fontSize: "15px",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            }}
          >
            <i className="fas fa-arrow-up"></i>
            Passer au Pro
          </button>
          <button
            onClick={() => setShowUpgradeModal(false)}
            style={{
              padding: "13px", borderRadius: "11px",
              background: "var(--dark-elevated)", border: "1px solid var(--diamond-border)",
              color: "var(--text-muted)", fontWeight: 700, fontSize: "14px", cursor: "pointer",
            }}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
