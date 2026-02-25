"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useOnboarding } from "@/context/OnboardingContext";

const configSteps = [
  "Interface configuree pour votre profil",
  "Champs inutiles masques",
  "Donnees d'exemple pretes",
  "Votre VEKO est pret",
];

export default function ConfigurationScreen() {
  const { completeOnboarding, userProfile, showShopifyModal } = useOnboarding();
  const [visibleSteps, setVisibleSteps] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    configSteps.forEach((_, idx) => {
      timers.push(setTimeout(() => {
        setVisibleSteps(idx + 1);
      }, 400 * (idx + 1)));
    });

    timers.push(setTimeout(() => {
      setIsComplete(true);
    }, 400 * configSteps.length + 500));

    timers.push(setTimeout(async () => {
      if (!showShopifyModal) {
        await completeOnboarding();
      }
    }, 400 * configSteps.length + 1500));

    return () => timers.forEach(clearTimeout);
  }, [completeOnboarding, showShopifyModal]);

  const getProfileSummary = () => {
    const type = userProfile.businessType;
    if (type === "boutique") return "Boutique Physique";
    if (type === "social") return "Vente Sociale";
    if (type === "shopify") return "E-commerce Shopify";
    return "Configuration personnalisee";
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
    }}>
      <motion.div
        animate={{ 
          scale: isComplete ? [1, 1.1, 1] : 1,
        }}
        transition={{ duration: 0.5 }}
        style={{
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          background: isComplete 
            ? "linear-gradient(135deg, #10b981, #059669)" 
            : "linear-gradient(135deg, #8b5cf6, #7c3aed)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "24px",
          boxShadow: isComplete 
            ? "0 0 40px rgba(16, 185, 129, 0.4)" 
            : "0 0 40px rgba(139, 92, 246, 0.3)",
        }}
      >
        {isComplete ? (
          <motion.i
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="fas fa-check"
            style={{ color: "white", fontSize: "32px" }}
          />
        ) : (
          <motion.i
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="fas fa-gear"
            style={{ color: "white", fontSize: "32px" }}
          />
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          fontSize: "18px",
          fontWeight: 700,
          color: "white",
          marginBottom: "8px",
          textAlign: "center",
        }}
      >
        {isComplete ? "Tout est pret !" : "On prepare votre espace..."}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          fontSize: "13px",
          color: "rgba(255,255,255,0.5)",
          marginBottom: "32px",
          textAlign: "center",
        }}
      >
        {getProfileSummary()}
      </motion.div>

      <div style={{
        background: "rgba(0,0,0,0.3)",
        borderRadius: "12px",
        padding: "20px",
        width: "100%",
        maxWidth: "320px",
        fontFamily: "monospace",
      }}>
        {configSteps.map((step, idx) => (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: -10 }}
            animate={{ 
              opacity: idx < visibleSteps ? 1 : 0.2,
              x: idx < visibleSteps ? 0 : -10,
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "8px 0",
              fontSize: "13px",
              color: idx < visibleSteps ? "#10b981" : "rgba(255,255,255,0.3)",
            }}
          >
            <i 
              className={idx < visibleSteps ? "fas fa-check" : "fas fa-circle"} 
              style={{ 
                fontSize: idx < visibleSteps ? "14px" : "6px",
                width: "16px",
              }}
            />
            {step}
          </motion.div>
        ))}
      </div>

      {isComplete && !showShopifyModal && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginTop: "32px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "rgba(255,255,255,0.5)",
            fontSize: "13px",
          }}
        >
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Redirection...
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
