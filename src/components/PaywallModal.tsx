"use client";
import { useState, useEffect, useRef } from "react";
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
  const [activeCard, setActiveCard] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const sliderContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 560);
      if (sliderContainerRef.current) {
        setContainerWidth(sliderContainerRef.current.offsetWidth);
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [showPaywall]);

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

  const soloCard = (
    <div style={{
      background: "var(--dark-elevated)",
      borderRadius: "20px",
      border: "1px solid var(--diamond-border)",
      padding: "24px",
      display: "flex",
      flexDirection: "column",
      transition: "transform 0.2s",
    }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; }}
    >
      <div style={{
        fontSize: "11px", fontWeight: 700, color: "var(--text-muted)",
        textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: "8px",
      }}>
        Solo
      </div>
      <div style={{ marginBottom: "4px" }}>
        <span style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-primary)" }}>
          {billingPeriod === "mensuel" ? "2 500" : "25 000"}
        </span>
        <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-muted)" }}>
          {" "}FCFA{billingPeriod === "mensuel" ? "/mois" : "/an"}
        </span>
      </div>
      {billingPeriod === "annuel" && (
        <div style={{ fontSize: "11px", color: "var(--accent-green)", marginBottom: "16px" }}>
          soit ≈ 2 083 FCFA/mois
        </div>
      )}
      {billingPeriod === "mensuel" && <div style={{ marginBottom: "16px" }} />}

      <div style={{ flex: 1, marginBottom: "16px" }}>
        {SOLO_FEATURES_OK.map((f) => (
          <FeatureRow key={f} ok={true}>{f}</FeatureRow>
        ))}
        <div style={{ position: "relative", margin: "12px 0 10px" }}>
          <div style={{ height: "1px", background: "var(--diamond-border)" }} />
          <span style={{
            position: "absolute", top: "-9px", left: "50%", transform: "translateX(-50%)",
            background: "var(--dark-elevated)", padding: "0 8px",
            fontSize: "10px", color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.5px",
            whiteSpace: "nowrap",
          }}>
            Non inclus
          </span>
        </div>
        {SOLO_FEATURES_NOK.map((f) => (
          <FeatureRow key={f} ok={false}>{f}</FeatureRow>
        ))}
      </div>

      <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", marginBottom: "14px" }}>
        <input
          type="checkbox"
          checked={autoRenewSolo}
          onChange={(e) => setAutoRenewSolo(e.target.checked)}
          style={{ cursor: "pointer", accentColor: "var(--accent-green)" }}
        />
        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
          Renouvellement automatique
        </span>
      </label>

      <button
        onClick={() => handleChoose("solo")}
        disabled={loading}
        style={{
          width: "100%", padding: "14px", borderRadius: "12px", border: "none",
          background: "var(--gradient-primary)", color: "white",
          fontSize: "14px", fontWeight: 700, letterSpacing: "0.3px",
          cursor: loading ? "not-allowed" : "pointer",
          fontFamily: "var(--font-inter), sans-serif",
          opacity: loading ? 0.7 : 1,
          display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
        }}
      >
        {loading ? <i className="fas fa-spinner fa-spin" /> : null}
        Commencer Solo
      </button>
    </div>
  );

  const proCard = (
    <div style={{
      background: "var(--dark-elevated)",
      borderRadius: "20px",
      border: "2px solid var(--accent-purple)",
      padding: "24px",
      boxShadow: "0 0 40px rgba(139,92,246,0.2), 0 8px 32px rgba(0,0,0,0.2)",
      position: "relative",
      display: "flex",
      flexDirection: "column",
    }}>
      <div style={{
        position: "absolute", top: "-12px", right: "16px",
        background: "var(--gradient-secondary)",
        color: "white", borderRadius: "8px",
        padding: "3px 12px", fontSize: "11px", fontWeight: 700, letterSpacing: "0.5px",
      }}>
        Recommandé
      </div>

      <div style={{
        fontSize: "11px", fontWeight: 700, color: "var(--accent-purple)",
        textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: "8px",
      }}>
        Pro
      </div>
      <div style={{ marginBottom: "4px" }}>
        <span style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-primary)" }}>
          {billingPeriod === "mensuel" ? "4 500" : "45 000"}
        </span>
        <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-muted)" }}>
          {" "}FCFA{billingPeriod === "mensuel" ? "/mois" : "/an"}
        </span>
      </div>
      {billingPeriod === "annuel" && (
        <div style={{ fontSize: "11px", color: "var(--accent-green)", marginBottom: "16px" }}>
          soit ≈ 3 750 FCFA/mois
        </div>
      )}
      {billingPeriod === "mensuel" && <div style={{ marginBottom: "16px" }} />}

      <div style={{ flex: 1, marginBottom: "16px" }}>
        {SOLO_FEATURES_OK.map((f) => (
          <FeatureRow key={f} ok={true}>{f}</FeatureRow>
        ))}
        <div style={{ position: "relative", margin: "12px 0 10px" }}>
          <div style={{ height: "1px", background: "rgba(139,92,246,0.3)" }} />
          <span style={{
            position: "absolute", top: "-9px", left: "50%", transform: "translateX(-50%)",
            background: "var(--dark-elevated)", padding: "0 8px",
            fontSize: "10px", color: "var(--accent-purple)", fontWeight: 600, letterSpacing: "0.5px",
            whiteSpace: "nowrap",
          }}>
            Exclusif Pro
          </span>
        </div>
        {PRO_EXTRA.map((f) => (
          <FeatureRow key={f} ok={true}>{f}</FeatureRow>
        ))}
      </div>

      <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", marginBottom: "14px" }}>
        <input
          type="checkbox"
          checked={autoRenewPro}
          onChange={(e) => setAutoRenewPro(e.target.checked)}
          style={{ cursor: "pointer", accentColor: "var(--accent-purple)" }}
        />
        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
          Renouvellement automatique
        </span>
      </label>

      <button
        onClick={() => handleChoose("pro")}
        disabled={loading}
        style={{
          width: "100%", padding: "14px", borderRadius: "12px", border: "none",
          background: "var(--gradient-secondary)", color: "white",
          fontSize: "14px", fontWeight: 700, letterSpacing: "0.3px",
          cursor: loading ? "not-allowed" : "pointer",
          fontFamily: "var(--font-inter), sans-serif",
          opacity: loading ? 0.7 : 1,
          display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
        }}
      >
        {loading ? <i className="fas fa-spinner fa-spin" /> : null}
        Commencer Pro
      </button>
    </div>
  );

  return (
    <AnimatePresence>
      {showPaywall && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed", inset: 0, zIndex: 10003,
            background: "rgba(0,0,0,0.88)",
            backdropFilter: "blur(14px)",
            overflowY: "auto", padding: "20px",
            display: "flex", alignItems: "flex-start",
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            style={{
              maxWidth: "560px", width: "100%", margin: "auto",
              background: "var(--dark-card)",
              borderRadius: "28px", padding: "32px 28px",
              border: "1px solid var(--diamond-border)",
              boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
            }}
          >
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: "28px" }}>
              <div style={{
                width: "64px", height: "64px", borderRadius: "50%",
                background: "var(--gradient-secondary)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 18px",
                boxShadow: "0 0 24px rgba(139,92,246,0.35)",
              }}>
                <i className="fas fa-crown" style={{ fontSize: "26px", color: "white" }} />
              </div>
              <h2 style={{
                fontSize: "22px", fontWeight: 800,
                color: "var(--text-primary)", lineHeight: 1.3, marginBottom: "0",
              }}>
                Tu as découvert VEKO.<br />Continue avec un plan.
              </h2>
              <div style={{
                width: "48px", height: "3px",
                background: "var(--gradient-secondary)",
                borderRadius: "2px", margin: "12px auto 8px",
              }} />
              <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "0" }}>
                Choisissez le plan qui correspond à votre activité.
              </p>
            </div>

            {/* Toggle Mensuel / Annuel */}
            <div style={{
              display: "flex", gap: "4px", marginBottom: "24px",
              background: "var(--dark-elevated)",
              borderRadius: "14px", padding: "4px",
              border: "1px solid var(--diamond-border)",
            }}>
              <button
                onClick={() => setBillingPeriod("mensuel")}
                style={{
                  flex: 1, padding: "9px 16px", borderRadius: "11px", border: "none",
                  background: billingPeriod === "mensuel" ? "var(--gradient-primary)" : "transparent",
                  color: billingPeriod === "mensuel" ? "white" : "var(--text-muted)",
                  fontSize: "13px", fontWeight: 700, cursor: "pointer",
                  fontFamily: "var(--font-inter), sans-serif", transition: "all 0.2s",
                }}
              >
                Mensuel
              </button>
              <button
                onClick={() => setBillingPeriod("annuel")}
                style={{
                  flex: 1, padding: "9px 16px", borderRadius: "11px", border: "none",
                  background: billingPeriod === "annuel" ? "var(--gradient-secondary)" : "transparent",
                  color: billingPeriod === "annuel" ? "white" : "var(--text-muted)",
                  fontSize: "13px", fontWeight: 700, cursor: "pointer",
                  fontFamily: "var(--font-inter), sans-serif", transition: "all 0.2s",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "7px",
                }}
              >
                Annuel
                <span style={{
                  fontSize: "10px", fontWeight: 800,
                  color: billingPeriod === "annuel" ? "rgba(255,255,255,0.9)" : "var(--accent-green)",
                  background: billingPeriod === "annuel" ? "rgba(255,255,255,0.2)" : "rgba(16,185,129,0.12)",
                  padding: "1px 6px", borderRadius: "6px",
                }}>
                  -17%
                </span>
              </button>
            </div>

            {/* Cards — desktop grid / mobile slider */}
            {!isMobile ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                {soloCard}
                {proCard}
              </div>
            ) : (
              <>
                <div
                  ref={sliderContainerRef}
                  style={{ overflow: "hidden", width: "100%", borderRadius: "20px" }}
                >
                  <motion.div
                    drag="x"
                    dragConstraints={{ left: -containerWidth, right: 0 }}
                    dragElastic={0.08}
                    animate={{ x: activeCard === 0 ? 0 : -containerWidth }}
                    transition={{ type: "spring", stiffness: 320, damping: 32 }}
                    onDragEnd={(_, info) => {
                      if (info.velocity.x < -250 || info.offset.x < -50) setActiveCard(1);
                      if (info.velocity.x > 250 || info.offset.x > 50) setActiveCard(0);
                    }}
                    style={{ display: "flex", width: "200%", cursor: "grab" }}
                  >
                    <div style={{ width: "50%", paddingRight: "8px" }}>{soloCard}</div>
                    <div style={{ width: "50%", paddingLeft: "8px" }}>{proCard}</div>
                  </motion.div>
                </div>

                {/* Dots navigation */}
                <div style={{
                  display: "flex", justifyContent: "center",
                  alignItems: "center", gap: "8px", marginTop: "16px",
                }}>
                  {[0, 1].map((idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveCard(idx)}
                      style={{
                        width: activeCard === idx ? "24px" : "8px",
                        height: "8px",
                        borderRadius: "4px",
                        border: "none",
                        background: activeCard === idx ? "var(--accent-purple)" : "var(--diamond-border)",
                        cursor: "pointer",
                        padding: 0,
                        transition: "all 0.3s ease",
                      }}
                    />
                  ))}
                </div>

                {/* Label carte active */}
                <div style={{
                  textAlign: "center", marginTop: "8px",
                  fontSize: "12px", color: "var(--text-muted)",
                }}>
                  {activeCard === 0 ? "Solo" : "Pro"} · Glissez pour voir l&apos;autre plan
                </div>
              </>
            )}

            {error && (
              <p style={{
                textAlign: "center", marginTop: "16px",
                fontSize: "13px", color: "var(--accent-red)",
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
