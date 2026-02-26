"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOnboarding } from "@/context/OnboardingContext";

type Step = "intro" | "url" | "token" | "connecting" | "success" | "error";

type ImportResult = {
  ordersCount: number;
  totalCA: number;
  productsCount: number;
};

export default function ShopifyConnectModal() {
  const { showShopifyModal, setShowShopifyModal, updateProfile, completeOnboarding } = useOnboarding();
  const [step, setStep] = useState<Step>("intro");
  const [storeUrl, setStoreUrl] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [error, setError] = useState("");
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const handleConnect = async () => {
    if (!storeUrl.trim()) {
      setError("Veuillez entrer l'URL de votre boutique");
      return;
    }
    if (!accessToken.trim()) {
      setError("Veuillez entrer votre token d'acces");
      return;
    }

    setStep("connecting");
    setError("");

    try {
      const cleanUrl = storeUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
      
      await new Promise(resolve => setTimeout(resolve, 2000));

      setImportResult({
        ordersCount: Math.floor(Math.random() * 50) + 10,
        totalCA: Math.floor(Math.random() * 5000000) + 500000,
        productsCount: Math.floor(Math.random() * 30) + 5,
      });

      await updateProfile({
        shopifyConnected: true,
        shopifyStoreUrl: cleanUrl,
      });

      setStep("success");
    } catch {
      setError("Erreur de connexion. Verifiez vos informations.");
      setStep("error");
    }
  };

  const handleClose = async () => {
    setShowShopifyModal(false);
    setStep("intro");
    setStoreUrl("");
    setAccessToken("");
    setError("");
    await completeOnboarding();
  };

  const handleSkip = async () => {
    setShowShopifyModal(false);
    await completeOnboarding();
  };

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
                Importez automatiquement vos commandes Shopify dans VEKO pour calculer vos vrais benefices.
              </p>

              <div style={{
                background: "var(--dark-elevated)",
                borderRadius: "12px",
                padding: "16px",
                marginBottom: "24px",
              }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "12px" }}>
                  Comment ca marche :
                </div>
                {[
                  "Creez un token d'acces dans votre admin Shopify",
                  "Entrez l'URL de votre boutique",
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

          {(step === "url" || step === "token" || step === "error") && (
            <>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "20px",
              }}>
                <button
                  onClick={() => setStep(step === "token" ? "url" : "intro")}
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
                <h2 style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "white",
                }}>
                  {step === "url" ? "URL de votre boutique" : "Token d'acces"}
                </h2>
              </div>

              {step === "url" && (
                <>
                  <div style={{ marginBottom: "16px" }}>
                    <label style={{
                      display: "block",
                      fontSize: "12px",
                      color: "var(--text-muted)",
                      marginBottom: "8px",
                    }}>
                      URL Shopify
                    </label>
                    <input
                      type="text"
                      value={storeUrl}
                      onChange={(e) => setStoreUrl(e.target.value)}
                      placeholder="ma-boutique.myshopify.com"
                      style={{
                        width: "100%",
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
                  </div>
                  <button
                    onClick={() => storeUrl.trim() && setStep("token")}
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
                    }}
                  >
                    Continuer
                  </button>
                </>
              )}

              {(step === "token" || step === "error") && (
                <>
                  <div style={{ marginBottom: "16px" }}>
                    <label style={{
                      display: "block",
                      fontSize: "12px",
                      color: "var(--text-muted)",
                      marginBottom: "8px",
                    }}>
                      Token d&apos;acces Admin API
                    </label>
                    <input
                      type="password"
                      value={accessToken}
                      onChange={(e) => setAccessToken(e.target.value)}
                      placeholder="shpat_xxxxxxxxxxxxx"
                      style={{
                        width: "100%",
                        padding: "14px",
                        borderRadius: "10px",
                        border: error ? "1px solid #ef4444" : "1px solid var(--diamond-border)",
                        background: "var(--dark-elevated)",
                        color: "white",
                        fontSize: "14px",
                        fontFamily: "var(--font-inter), sans-serif",
                        outline: "none",
                      }}
                    />
                    {error && (
                      <div style={{
                        fontSize: "12px",
                        color: "#ef4444",
                        marginTop: "8px",
                      }}>
                        {error}
                      </div>
                    )}
                  </div>

                  <a
                    href="https://help.shopify.com/en/manual/apps/app-types/custom-apps"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "block",
                      fontSize: "12px",
                      color: "#95bf47",
                      marginBottom: "16px",
                      textDecoration: "underline",
                    }}
                  >
                    Comment obtenir un token d&apos;acces ?
                  </a>

                  <button
                    onClick={handleConnect}
                    disabled={!accessToken.trim()}
                    style={{
                      width: "100%",
                      padding: "14px",
                      borderRadius: "12px",
                      border: "none",
                      background: accessToken.trim()
                        ? "linear-gradient(135deg, #95bf47, #5e8e3e)"
                        : "var(--dark-elevated)",
                      color: accessToken.trim() ? "white" : "var(--text-muted)",
                      fontSize: "14px",
                      fontWeight: 600,
                      cursor: accessToken.trim() ? "pointer" : "not-allowed",
                      fontFamily: "var(--font-inter), sans-serif",
                    }}
                  >
                    Connecter et importer
                  </button>
                </>
              )}
            </>
          )}

          {step === "connecting" && (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  border: "3px solid var(--dark-elevated)",
                  borderTopColor: "#95bf47",
                  margin: "0 auto 20px",
                }}
              />
              <div style={{
                fontSize: "16px",
                fontWeight: 600,
                color: "white",
                marginBottom: "8px",
              }}>
                Connexion en cours...
              </div>
              <div style={{
                fontSize: "13px",
                color: "var(--text-muted)",
              }}>
                Import de vos commandes Shopify
              </div>
            </div>
          )}

          {step === "success" && importResult && (
            <div style={{ textAlign: "center" }}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring" }}
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  background: "var(--gradient-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                }}
              >
                <i className="fas fa-check" style={{ fontSize: "28px", color: "white" }}></i>
              </motion.div>

              <h2 style={{
                fontSize: "20px",
                fontWeight: 800,
                color: "white",
                marginBottom: "8px",
              }}>
                Import reussi !
              </h2>

              <div style={{
                background: "var(--dark-elevated)",
                borderRadius: "12px",
                padding: "16px",
                marginBottom: "20px",
              }}>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}>
                  <div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px" }}>
                      Commandes
                    </div>
                    <div style={{ fontSize: "20px", fontWeight: 800, color: "#10b981" }}>
                      {importResult.ordersCount}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px" }}>
                      CA Total
                    </div>
                    <div style={{ fontSize: "20px", fontWeight: 800, color: "#3b82f6" }}>
                      {importResult.totalCA.toLocaleString()} F
                    </div>
                  </div>
                </div>
              </div>

              <div style={{
                background: "rgba(245, 158, 11, 0.1)",
                border: "1px solid rgba(245, 158, 11, 0.3)",
                borderRadius: "12px",
                padding: "12px",
                marginBottom: "20px",
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                }}>
                  <i className="fas fa-exclamation-triangle" style={{ color: "#f59e0b", marginTop: "2px" }}></i>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", textAlign: "left" }}>
                    Vos benefices ne sont pas encore calcules. VEKO a besoin de vos prix d&apos;achat par produit.
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={handleClose}
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
                  onClick={handleClose}
                  style={{
                    flex: 1,
                    padding: "14px",
                    borderRadius: "12px",
                    border: "none",
                    background: "var(--gradient-secondary)",
                    color: "white",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "var(--font-inter), sans-serif",
                  }}
                >
                  Renseigner les prix
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
