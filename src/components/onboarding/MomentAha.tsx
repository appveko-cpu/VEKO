"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useDevise } from "@/context/DeviseContext";

type MomentAhaProps = {
  venteData: {
    prixVente: number;
    benefice: number;
    depenses: number;
    details?: {
      prixAchat?: number;
      transport?: number;
      livraison?: number;
      pub?: number;
    };
  };
  onClose: () => void;
};

export default function MomentAha({ venteData, onClose }: MomentAhaProps) {
  const { deviseActuelle, convertir } = useDevise();
  const [phase, setPhase] = useState<"reveal" | "details" | "message">("reveal");

  useEffect(() => {
    localStorage.setItem("veko_moment_aha_done", "1");

    const t1 = setTimeout(() => setPhase("details"), 1500);
    const t2 = setTimeout(() => setPhase("message"), 3500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const fmt = (n: number) => Math.round(convertir(n)).toLocaleString("fr-FR") + " " + deviseActuelle;

  const isProfit = venteData.benefice >= 0;
  const costItems = [
    { label: "Cout d'achat", value: venteData.details?.prixAchat || venteData.depenses * 0.7 },
    { label: "Transport", value: venteData.details?.transport || venteData.depenses * 0.1 },
    { label: "Pub/Marketing", value: venteData.details?.pub || venteData.depenses * 0.2 },
  ].filter(item => item.value > 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10001,
        background: "rgba(0,0,0,0.95)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{
          maxWidth: "360px",
          width: "100%",
          textAlign: "center",
        }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          style={{ fontSize: "48px", marginBottom: "16px" }}
        >
          {isProfit ? "💡" : "⚠️"}
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            fontSize: "20px",
            fontWeight: 800,
            color: "white",
            marginBottom: "24px",
          }}
        >
          {isProfit ? "Vous venez de voir la verite" : "Attention a vos marges"}
        </motion.h2>

        {phase !== "reveal" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: "rgba(255,255,255,0.05)",
              borderRadius: "16px",
              padding: "20px",
              marginBottom: "20px",
            }}
          >
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "16px",
              paddingBottom: "16px",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
            }}>
              <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px" }}>
                Vous avez vendu a
              </span>
              <span style={{ color: "#3b82f6", fontWeight: 700, fontSize: "16px" }}>
                {fmt(venteData.prixVente)}
              </span>
            </div>

            {costItems.map((item, idx) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * idx }}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 0",
                }}
              >
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px" }}>
                  {item.label}
                </span>
                <span style={{ color: "#ef4444", fontWeight: 600, fontSize: "13px" }}>
                  - {fmt(item.value)}
                </span>
              </motion.div>
            ))}

            <div style={{
              marginTop: "16px",
              paddingTop: "16px",
              borderTop: "1px dashed rgba(255,255,255,0.2)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
              <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px", fontWeight: 600 }}>
                Vous avez reellement gagne
              </span>
              <motion.span
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                style={{
                  color: isProfit ? "#10b981" : "#ef4444",
                  fontWeight: 900,
                  fontSize: "20px",
                }}
              >
                {isProfit ? "+" : ""}{fmt(venteData.benefice)}
              </motion.span>
            </div>
          </motion.div>
        )}

        {phase === "message" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p style={{
              color: "rgba(255,255,255,0.7)",
              fontSize: "14px",
              lineHeight: 1.6,
              marginBottom: "24px",
            }}>
              {isProfit
                ? "C'est exactement pour ca que VEKO existe. Pour que vous sachiez toujours la verite sur votre argent."
                : "VEKO vous aide a identifier les ventes non rentables pour ajuster vos prix."
              }
            </p>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              style={{
                width: "100%",
                padding: "16px 24px",
                borderRadius: "14px",
                border: "none",
                background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
                color: "white",
                fontSize: "15px",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "var(--font-inter), sans-serif",
              }}
            >
              Voir mon dashboard mis a jour
              <i className="fas fa-arrow-right" style={{ marginLeft: "10px" }}></i>
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
