"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePlan } from "@/context/PlanContext";

function FeatureRow({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "7px" }}>
      <i
        className={ok ? "fas fa-check" : "fas fa-xmark"}
        style={{
          fontSize: "10px",
          color: ok ? "var(--accent-green)" : "var(--accent-red)",
          marginTop: "3px",
          flexShrink: 0,
          width: "12px",
        }}
      />
      <span style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.4 }}>
        {children}
      </span>
    </div>
  );
}

const SOLO_FEATURES_OK = [
  "Calcul de rentabilité",
  "Laboratoire des prix",
  "Répartition publicitaire",
  "Tableau de bord complet",
  "Graphiques d'évolution",
  "Suivi d'objectifs",
  "Produits illimités",
  "Historique commandes illimité",
  "Gestion clients",
  "Produit le plus rentable",
  "Rapport CEO PDF",
  "Notifications et alertes stock",
];

const SOLO_FEATURES_NOK = [
  "Multi-boutiques",
  "Multi-gestionnaires",
  "Connexion boutique Shopify",
  "Gestion des charges fixes",
  "Support prioritaire WhatsApp et Gmail",
];

const PRO_EXTRA = [
  "Multi-boutiques jusqu'à 3",
  "Multi-gestionnaires de commandes",
  "Connexion boutique Shopify",
  "Gestion des charges fixes",
  "Historique simulations laboratoire",
  "Support prioritaire WhatsApp et Gmail",
];

export default function PaywallModal() {
  const { showPaywall } = usePlan();
  const [billingPeriod, setBillingPeriod] = useState<"mensuel" | "annuel">("mensuel");
  const [autoRenewSolo, setAutoRenewSolo] = useState(false);
  const [autoRenewPro, setAutoRenewPro] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChoose(plan: "solo" | "pro") {
    setLoading(true);
    setError(null);
    const autoRenew = plan === "solo" ? autoRenewSolo : autoRenewPro;
    try {
      const res = await fetch("/api/payment/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, period: billingPeriod, autoRenew }),
      });
      const data = await res.json();
      if (!res.ok || !data.payment_url) {
        setError("Erreur lors du lancement du paiement. Réessayez.");
        return;
      }
      window.location.href = data.payment_url;
    } catch {
      setError("Erreur réseau. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {showPaywall && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10003,
            background: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(12px)",
            overflowY: "auto",
            padding: "20px",
            display: "flex",
            alignItems: "flex-start",
          }}
        >
          <style>{`
            .paywall-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 12px;
            }
            @media (max-width: 520px) {
              .paywall-grid {
                grid-template-columns: 1fr;
              }
            }
          `}</style>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            style={{
              maxWidth: "500px",
              width: "100%",
              margin: "auto",
              background: "var(--dark-card)",
              borderRadius: "24px",
              padding: "28px 24px",
              border: "1px solid var(--diamond-border)",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <div style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "var(--gradient-secondary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}>
                <i className="fas fa-crown" style={{ fontSize: "24px", color: "white" }} />
              </div>
              <h2 style={{
                fontSize: "20px",
                fontWeight: 800,
                color: "var(--text-primary)",
                marginBottom: "4px",
                lineHeight: 1.3,
              }}>
                Tu as découvert VEKO.<br />Continue avec un plan.
              </h2>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "8px" }}>
                Choisissez le plan qui correspond à votre activité.
              </p>
            </div>

            <div style={{
              display: "flex",
              justifyContent: "center",
              gap: "4px",
              marginBottom: "20px",
              background: "var(--dark-elevated)",
              borderRadius: "12px",
              padding: "4px",
            }}>
              <button
                onClick={() => setBillingPeriod("mensuel")}
                style={{
                  flex: 1,
                  padding: "8px 16px",
                  borderRadius: "9px",
                  border: "none",
                  background: billingPeriod === "mensuel" ? "var(--dark-card)" : "transparent",
                  color: billingPeriod === "mensuel" ? "var(--text-primary)" : "var(--text-muted)",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "var(--font-inter), sans-serif",
                  transition: "all 0.2s",
                  boxShadow: billingPeriod === "mensuel" ? "0 1px 4px rgba(0,0,0,0.2)" : "none",
                }}
              >
                Mensuel
              </button>
              <button
                onClick={() => setBillingPeriod("annuel")}
                style={{
                  flex: 1,
                  padding: "8px 16px",
                  borderRadius: "9px",
                  border: "none",
                  background: billingPeriod === "annuel" ? "var(--dark-card)" : "transparent",
                  color: billingPeriod === "annuel" ? "var(--text-primary)" : "var(--text-muted)",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "var(--font-inter), sans-serif",
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  boxShadow: billingPeriod === "annuel" ? "0 1px 4px rgba(0,0,0,0.2)" : "none",
                }}
              >
                Annuel
                <span style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  color: "var(--accent-green)",
                  background: "rgba(16,185,129,0.12)",
                  padding: "1px 6px",
                  borderRadius: "6px",
                }}>
                  -17%
                </span>
              </button>
            </div>

            <div className="paywall-grid">
              <div style={{
                background: "var(--dark-elevated)",
                borderRadius: "16px",
                border: "1px solid var(--diamond-border)",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
              }}>
                <div style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  marginBottom: "6px",
                }}>
                  Solo
                </div>
                <div style={{
                  fontSize: "20px",
                  fontWeight: 800,
                  color: "var(--text-primary)",
                  marginBottom: "16px",
                  lineHeight: 1.2,
                }}>
                  {billingPeriod === "mensuel" ? "2 500 FCFA" : "25 000 FCFA"}
                  <span style={{ fontSize: "12px", fontWeight: 400, color: "var(--text-muted)" }}>
                    {billingPeriod === "mensuel" ? "/mois" : "/an"}
                  </span>
                </div>

                <div style={{ flex: 1, marginBottom: "16px" }}>
                  {SOLO_FEATURES_OK.map((f) => (
                    <FeatureRow key={f} ok={true}>{f}</FeatureRow>
                  ))}
                  {SOLO_FEATURES_NOK.map((f) => (
                    <FeatureRow key={f} ok={false}>{f}</FeatureRow>
                  ))}
                </div>

                <label style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                  marginBottom: "12px",
                }}>
                  <input
                    type="checkbox"
                    checked={autoRenewSolo}
                    onChange={(e) => setAutoRenewSolo(e.target.checked)}
                    style={{ cursor: "pointer" }}
                  />
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    Renouvellement automatique
                  </span>
                </label>

                <button
                  onClick={() => handleChoose("solo")}
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "10px",
                    border: "none",
                    background: "var(--gradient-primary)",
                    color: "white",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: loading ? "not-allowed" : "pointer",
                    fontFamily: "var(--font-inter), sans-serif",
                    opacity: loading ? 0.7 : 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  {loading ? <i className="fas fa-spinner fa-spin" /> : null}
                  Commencer Solo
                </button>
              </div>

              <div style={{
                background: "var(--dark-elevated)",
                borderRadius: "16px",
                border: "2px solid var(--accent-purple)",
                padding: "20px",
                boxShadow: "0 0 30px rgba(139,92,246,0.15)",
                position: "relative",
                display: "flex",
                flexDirection: "column",
              }}>
                <div style={{
                  position: "absolute",
                  top: "-10px",
                  right: "16px",
                  background: "var(--accent-purple)",
                  color: "white",
                  borderRadius: "8px",
                  padding: "3px 10px",
                  fontSize: "11px",
                  fontWeight: 700,
                }}>
                  Recommandé
                </div>

                <div style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "var(--accent-purple)",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  marginBottom: "6px",
                }}>
                  Pro
                </div>
                <div style={{
                  fontSize: "20px",
                  fontWeight: 800,
                  color: "var(--text-primary)",
                  marginBottom: "16px",
                  lineHeight: 1.2,
                }}>
                  {billingPeriod === "mensuel" ? "4 500 FCFA" : "45 000 FCFA"}
                  <span style={{ fontSize: "12px", fontWeight: 400, color: "var(--text-muted)" }}>
                    {billingPeriod === "mensuel" ? "/mois" : "/an"}
                  </span>
                </div>

                <div style={{ flex: 1, marginBottom: "16px" }}>
                  {SOLO_FEATURES_OK.map((f) => (
                    <FeatureRow key={f} ok={true}>{f}</FeatureRow>
                  ))}
                  {PRO_EXTRA.map((f) => (
                    <FeatureRow key={f} ok={true}>{f}</FeatureRow>
                  ))}
                </div>

                <label style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                  marginBottom: "12px",
                }}>
                  <input
                    type="checkbox"
                    checked={autoRenewPro}
                    onChange={(e) => setAutoRenewPro(e.target.checked)}
                    style={{ cursor: "pointer" }}
                  />
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    Renouvellement automatique
                  </span>
                </label>

                <button
                  onClick={() => handleChoose("pro")}
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "10px",
                    border: "none",
                    background: "var(--gradient-secondary)",
                    color: "white",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: loading ? "not-allowed" : "pointer",
                    fontFamily: "var(--font-inter), sans-serif",
                    opacity: loading ? 0.7 : 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  {loading ? <i className="fas fa-spinner fa-spin" /> : null}
                  Commencer Pro
                </button>
              </div>
            </div>

            {error && (
              <p style={{
                textAlign: "center",
                marginTop: "16px",
                fontSize: "13px",
                color: "var(--accent-red)",
              }}>
                {error}
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
