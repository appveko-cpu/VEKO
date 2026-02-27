"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOnboarding } from "@/context/OnboardingContext";

type Step = "intro" | "url";

export default function ShopifyConnectModal() {
  const { showShopifyModal, setShowShopifyModal, completeOnboarding } = useOnboarding();
  const [step, setStep] = useState<Step>("intro");
  const [storeUrl, setStoreUrl] = useState("");

  function handleConnect() {
    const name = storeUrl.trim();
    if (!name) return;
    window.location.href = `/api/auth/shopify/install?shop=${encodeURIComponent(name)}`;
  }

  async function handleSkip() {
    setShowShopifyModal(false);
    await completeOnboarding();
  }

  if (!showShopifyModal) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 10001,
          background: "rgba(0,0,0,0.8)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          style={{
            maxWidth: "400px",
            width: "100%",
            background: "var(--dark-card)",
            borderRadius: "24px",
            padding: "24px",
            border: "1px solid var(--diamond-border)",
          }}
        >
          {step === "intro" && (
            <>
              <div style={{
                width: "64px",
                height: "64px",
                borderRadius: "16px",
                background: "linear-gradient(135deg, #95bf47, #5e8e3e)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
              }}>
                <i className="fas fa-shopping-cart" style={{ fontSize: "28px", color: "white" }}></i>
              </div>

              <h2 style={{
                fontSize: "20px",
                fontWeight: 800,
                color: "white",
                textAlign: "center",
                marginBottom: "8px",
              }}>
                Connecter Shopify
              </h2>

              <p style={{
                fontSize: "13px",
                color: "var(--text-muted)",
                textAlign: "center",
                marginBottom: "24px",
                lineHeight: 1.6,
              }}>
                Importez automatiquement vos commandes Shopify dans VEKO pour calculer vos vrais bénéfices.
              </p>

              <div style={{
                background: "var(--dark-elevated)",
                borderRadius: "12px",
                padding: "16px",
                marginBottom: "24px",
              }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "12px" }}>
                  Comment ça marche :
                </div>
                {[
                  "Entrez le nom de votre boutique Shopify",
                  "Vous êtes redirigé vers Shopify pour autoriser VEKO",
                  "VEKO importe vos commandes automatiquement",
                ].map((text, idx) => (
                  <div key={idx} style={{ display: "flex", gap: "10px", marginBottom: "8px" }}>
                    <div style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      background: "#95bf47",
                      color: "white",
                      fontSize: "11px",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      {idx + 1}
                    </div>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{text}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={handleSkip}
                  style={{
                    flex: 1,
                    padding: "14px",
                    borderRadius: "12px",
                    border: "1px solid var(--diamond-border)",
                    background: "transparent",
                    color: "var(--text-muted)",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "var(--font-inter), sans-serif",
                  }}
                >
                  Plus tard
                </button>
                <button
                  onClick={() => setStep("url")}
                  style={{
                    flex: 1,
                    padding: "14px",
                    borderRadius: "12px",
                    border: "none",
                    background: "linear-gradient(135deg, #95bf47, #5e8e3e)",
                    color: "white",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "var(--font-inter), sans-serif",
                  }}
                >
                  Commencer
                </button>
              </div>
            </>
          )}

          {step === "url" && (
            <>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "20px",
              }}>
                <button
                  onClick={() => setStep("intro")}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    padding: "4px",
                  }}
                >
                  <i className="fas fa-arrow-left"></i>
                </button>
                <h2 style={{ fontSize: "18px", fontWeight: 700, color: "white" }}>
                  Nom de votre boutique
                </h2>
              </div>

              <div style={{ marginBottom: "8px" }}>
                <label style={{
                  display: "block",
                  fontSize: "12px",
                  color: "var(--text-muted)",
                  marginBottom: "8px",
                }}>
                  NOM DE LA BOUTIQUE
                </label>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <input
                    type="text"
                    value={storeUrl}
                    onChange={(e) => setStoreUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleConnect()}
                    placeholder="ma-boutique"
                    autoFocus
                    style={{
                      flex: 1,
                      padding: "14px",
                      borderRadius: "10px",
                      border: "1px solid var(--diamond-border)",
                      background: "var(--dark-elevated)",
                      color: "white",
                      fontSize: "14px",
                      fontFamily: "var(--font-inter), sans-serif",
                      outline: "none",
                    }}
                  />
                  <span style={{ fontSize: "13px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                    .myshopify.com
                  </span>
                </div>
              </div>

              <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "20px", lineHeight: 1.5 }}>
                Vous allez être redirigé vers Shopify pour autoriser l&apos;accès. Revenez ensuite sur VEKO.
              </p>

              <button
                onClick={handleConnect}
                disabled={!storeUrl.trim()}
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: "12px",
                  border: "none",
                  background: storeUrl.trim()
                    ? "linear-gradient(135deg, #95bf47, #5e8e3e)"
                    : "var(--dark-elevated)",
                  color: storeUrl.trim() ? "white" : "var(--text-muted)",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: storeUrl.trim() ? "pointer" : "not-allowed",
                  fontFamily: "var(--font-inter), sans-serif",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                <i className="fas fa-arrow-right"></i>
                Autoriser sur Shopify
              </button>

              <button
                onClick={handleSkip}
                style={{
                  width: "100%",
                  marginTop: "10px",
                  padding: "10px",
                  borderRadius: "10px",
                  border: "none",
                  background: "transparent",
                  color: "var(--text-muted)",
                  fontSize: "13px",
                  cursor: "pointer",
                  fontFamily: "var(--font-inter), sans-serif",
                }}
              >
                Passer pour l&apos;instant
              </button>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
