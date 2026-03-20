"use client";
import { useState } from "react";
import { useAccess } from "@/context/AccessContext";
import { ACCESS_SYSTEM_ENABLED } from "@/lib/feature-flags";

const SOLO_FEATURES = [
  { label: "Calcul de rentabilité", ok: true },
  { label: "Laboratoire des prix", ok: true },
  { label: "Répartition publicitaire", ok: true },
  { label: "Tableau de bord complet", ok: true },
  { label: "Graphiques d'évolution", ok: true },
  { label: "Suivi d'objectifs", ok: true },
  { label: "Produits & commandes illimités", ok: true },
  { label: "Gestion clients", ok: true },
  { label: "Rapport CEO PDF", ok: true },
  { label: "Notifications & alertes stock", ok: true },
  { label: "Multi-boutiques", ok: false },
  { label: "Multi-gestionnaires", ok: false },
  { label: "Connexion boutique Shopify", ok: false },
  { label: "Gestion des charges fixes", ok: false },
  { label: "Historique simulations labo", ok: false },
  { label: "Support prioritaire WhatsApp & Gmail", ok: false },
];

const PRO_FEATURES = [
  { label: "Tout le plan Solo", ok: true },
  { label: "Multi-boutiques (x3)", ok: true },
  { label: "Multi-gestionnaires", ok: true },
  { label: "Connexion boutique Shopify", ok: true },
  { label: "Gestion des charges fixes", ok: true },
  { label: "Historique simulations labo", ok: true },
  { label: "Support prioritaire WhatsApp & Gmail", ok: true },
];

export default function PricingModal() {
  const { showPricingModal, setShowPricingModal } = useAccess();
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [autoRenewSolo, setAutoRenewSolo] = useState(false);
  const [autoRenewPro, setAutoRenewPro] = useState(false);
  const [loadingSolo, setLoadingSolo] = useState(false);
  const [loadingPro, setLoadingPro] = useState(false);

  if (!ACCESS_SYSTEM_ENABLED) return null;
  if (!showPricingModal) return null;

  const prixSolo = billing === "monthly" ? 2500 : 25000;
  const prixPro = billing === "monthly" ? 4500 : 45000;
  const periodLabel = billing === "monthly" ? "mois" : "an";

  async function handlePay(plan: "solo" | "pro") {
    const setLoading = plan === "solo" ? setLoadingSolo : setLoadingPro;
    const autoRenew = plan === "solo" ? autoRenewSolo : autoRenewPro;
    setLoading(true);
    try {
      const res = await fetch("/api/payment/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, billing_period: billing, auto_renew: autoRenew }),
      });
      const data = await res.json();
      if (data.url) {
        window.open(data.url, "_blank", "noopener,noreferrer");
      }
    } catch (e) {
      console.error("[PricingModal] handlePay:", e);
    }
    setLoading(false);
  }

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        overflowY: "auto", padding: "20px",
      }}
    >
      <div style={{ width: "100%", maxWidth: "800px", paddingBottom: "40px" }}>
        <div style={{ textAlign: "center", marginBottom: "28px", paddingTop: "20px" }}>
          <div style={{
            width: "56px", height: "56px", borderRadius: "16px",
            background: "linear-gradient(135deg, #10b981, #059669)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "24px", color: "white", margin: "0 auto 16px",
          }}>
            <i className="fas fa-rocket"></i>
          </div>
          <h2 style={{ fontSize: "26px", fontWeight: 900, color: "var(--text-primary)", margin: "0 0 8px" }}>
            Tu as découvert VEKO.
          </h2>
          <p style={{ fontSize: "16px", color: "var(--text-secondary)", margin: "0 0 24px" }}>
            Continue avec un plan pour accéder à tes vrais chiffres.
          </p>

          <div style={{
            display: "inline-flex", background: "var(--dark-elevated)",
            borderRadius: "12px", padding: "4px", gap: "4px",
            border: "1px solid var(--diamond-border)",
          }}>
            <button
              onClick={() => setBilling("monthly")}
              style={{
                padding: "8px 20px", borderRadius: "9px", border: "none", cursor: "pointer",
                fontWeight: 700, fontSize: "14px", transition: "all 0.2s",
                background: billing === "monthly" ? "var(--accent-blue)" : "transparent",
                color: billing === "monthly" ? "white" : "var(--text-muted)",
              }}
            >
              Mensuel
            </button>
            <button
              onClick={() => setBilling("yearly")}
              style={{
                padding: "8px 20px", borderRadius: "9px", border: "none", cursor: "pointer",
                fontWeight: 700, fontSize: "14px", transition: "all 0.2s",
                background: billing === "yearly" ? "var(--accent-blue)" : "transparent",
                color: billing === "yearly" ? "white" : "var(--text-muted)",
                display: "flex", alignItems: "center", gap: "6px",
              }}
            >
              Annuel
              <span style={{
                background: "#10b981", color: "white", fontSize: "10px",
                fontWeight: 800, padding: "2px 7px", borderRadius: "20px",
              }}>
                -17%
              </span>
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <PlanCard
            name="SOLO"
            boutiques="1 boutique"
            prix={prixSolo}
            periodLabel={periodLabel}
            features={SOLO_FEATURES}
            gradient="linear-gradient(135deg, #3b82f6, #6366f1)"
            autoRenew={autoRenewSolo}
            onAutoRenewChange={setAutoRenewSolo}
            onPay={() => handlePay("solo")}
            loading={loadingSolo}
          />
          <PlanCard
            name="PRO"
            boutiques="Jusqu'à 3 boutiques"
            prix={prixPro}
            periodLabel={periodLabel}
            features={PRO_FEATURES}
            gradient="linear-gradient(135deg, #8b5cf6, #ec4899)"
            autoRenew={autoRenewPro}
            onAutoRenewChange={setAutoRenewPro}
            onPay={() => handlePay("pro")}
            loading={loadingPro}
            highlighted
          />
        </div>

        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: "16px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              <i className="fas fa-mobile-screen-button" style={{ marginRight: "6px", color: "#10b981" }}></i>
              Paiement Mobile Money
            </span>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              <i className="fas fa-bolt" style={{ marginRight: "6px", color: "#f59e0b" }}></i>
              Accès activé immédiatement
            </span>
          </div>
          <button
            onClick={() => setShowPricingModal(false)}
            style={{
              background: "none", border: "none", color: "var(--text-muted)",
              fontSize: "13px", cursor: "pointer",
            }}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

function PlanCard({
  name, boutiques, prix, periodLabel, features, gradient,
  autoRenew, onAutoRenewChange, onPay, loading, highlighted,
}: {
  name: string;
  boutiques: string;
  prix: number;
  periodLabel: string;
  features: { label: string; ok: boolean }[];
  gradient: string;
  autoRenew: boolean;
  onAutoRenewChange: (v: boolean) => void;
  onPay: () => void;
  loading: boolean;
  highlighted?: boolean;
}) {
  return (
    <div style={{
      background: "var(--dark-card)",
      border: highlighted ? "2px solid #8b5cf6" : "1px solid var(--diamond-border)",
      borderRadius: "20px",
      padding: "24px",
      display: "flex",
      flexDirection: "column",
      position: "relative",
      overflow: "hidden",
    }}>
      {highlighted && (
        <div style={{
          position: "absolute", top: "12px", right: "12px",
          background: "linear-gradient(135deg,#8b5cf6,#ec4899)",
          color: "white", fontSize: "10px", fontWeight: 800,
          padding: "4px 10px", borderRadius: "20px",
        }}>
          POPULAIRE
        </div>
      )}

      <div style={{ marginBottom: "20px" }}>
        <div style={{
          width: "44px", height: "44px", borderRadius: "12px",
          background: gradient, display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: "18px", color: "white",
          marginBottom: "12px",
        }}>
          <i className={name === "SOLO" ? "fas fa-user" : "fas fa-crown"}></i>
        </div>
        <div style={{ fontSize: "20px", fontWeight: 900, color: "var(--text-primary)" }}>{name}</div>
        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>{boutiques}</div>
        <div style={{ marginTop: "12px" }}>
          <span style={{ fontSize: "32px", fontWeight: 900, color: "var(--text-primary)" }}>
            {prix.toLocaleString("fr-FR")}
          </span>
          <span style={{ fontSize: "14px", color: "var(--text-muted)", marginLeft: "4px" }}>
            FCFA/{periodLabel}
          </span>
        </div>
      </div>

      <div style={{ flex: 1, marginBottom: "20px" }}>
        {features.map((f, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: "6px 0",
            borderBottom: i < features.length - 1 ? "1px solid var(--diamond-border)" : "none",
          }}>
            <i
              className={f.ok ? "fas fa-circle-check" : "fas fa-circle-xmark"}
              style={{ color: f.ok ? "#10b981" : "#ef4444", fontSize: "14px", flexShrink: 0 }}
            ></i>
            <span style={{ fontSize: "13px", color: f.ok ? "var(--text-secondary)" : "var(--text-muted)" }}>
              {f.label}
            </span>
          </div>
        ))}
      </div>

      <div>
        <label style={{
          display: "flex", alignItems: "center", gap: "8px",
          cursor: "pointer", marginBottom: "14px",
          fontSize: "12px", color: "var(--text-muted)",
        }}>
          <input
            type="checkbox"
            checked={autoRenew}
            onChange={(e) => onAutoRenewChange(e.target.checked)}
            style={{ cursor: "pointer", accentColor: "#3b82f6" }}
          />
          Renouvellement automatique chaque mois
        </label>

        <button
          onClick={onPay}
          disabled={loading}
          style={{
            width: "100%", padding: "14px", borderRadius: "12px",
            border: "none", cursor: loading ? "not-allowed" : "pointer",
            background: gradient, color: "white",
            fontWeight: 800, fontSize: "15px",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            opacity: loading ? 0.7 : 1,
          }}
        >
          <i className={`fas ${loading ? "fa-spinner fa-spin" : "fa-arrow-right"}`}></i>
          {loading ? "Chargement..." : `Commencer ${name}`}
        </button>
      </div>
    </div>
  );
}
