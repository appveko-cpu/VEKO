"use client";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useUserLevel, LEVELS, UserLevel } from "@/context/UserLevelContext";

export default function LevelUpModal() {
  const { showLevelUpModal, setShowLevelUpModal, newLevel, xpPoints, nextLevelConfig } = useUserLevel();

  useEffect(() => {
    if (showLevelUpModal && newLevel) {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.5 },
        colors: [LEVELS[newLevel].color, "#ec4899", "#10b981"],
      });
    }
  }, [showLevelUpModal, newLevel]);

  if (!showLevelUpModal || !newLevel) return null;

  const levelConfig = LEVELS[newLevel];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 10002,
          background: "rgba(0,0,0,0.9)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          style={{
            maxWidth: "340px",
            width: "100%",
            background: "var(--dark-card)",
            borderRadius: "24px",
            padding: "32px 24px",
            textAlign: "center",
            border: "1px solid var(--diamond-border)",
            boxShadow: `0 0 60px ${levelConfig.color}40`,
          }}
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", delay: 0.2, duration: 0.8 }}
            style={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${levelConfig.color}, ${levelConfig.color}99)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              boxShadow: `0 8px 32px ${levelConfig.color}50`,
            }}
          >
            <i className={levelConfig.badge} style={{ fontSize: "40px", color: "white" }}></i>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div style={{
              fontSize: "14px",
              color: levelConfig.color,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "2px",
              marginBottom: "8px",
            }}>
              Nouveau Niveau
            </div>

            <h2 style={{
              fontSize: "28px",
              fontWeight: 900,
              color: "white",
              marginBottom: "12px",
            }}>
              {levelConfig.name}
            </h2>

            <p style={{
              fontSize: "14px",
              color: "var(--text-muted)",
              lineHeight: 1.6,
              marginBottom: "24px",
            }}>
              {getLevelMessage(newLevel)}
            </p>

            <div style={{
              background: "var(--dark-elevated)",
              borderRadius: "12px",
              padding: "16px",
              marginBottom: "24px",
            }}>
              <div style={{
                fontSize: "12px",
                color: "var(--text-muted)",
                marginBottom: "8px",
              }}>
                Experience totale
              </div>
              <div style={{
                fontSize: "24px",
                fontWeight: 900,
                color: levelConfig.color,
              }}>
                {xpPoints} XP
              </div>
              {nextLevelConfig && (
                <div style={{
                  fontSize: "11px",
                  color: "var(--text-muted)",
                  marginTop: "8px",
                }}>
                  Prochain niveau : {nextLevelConfig.name} a {nextLevelConfig.xpRequired} XP
                </div>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowLevelUpModal(false)}
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: "14px",
                border: "none",
                background: `linear-gradient(135deg, ${levelConfig.color}, ${levelConfig.color}cc)`,
                color: "white",
                fontSize: "15px",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "var(--font-inter), sans-serif",
              }}
            >
              Continuer
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function getLevelMessage(level: UserLevel): string {
  const messages: Record<UserLevel, string> = {
    starter: "Bienvenue dans VEKO ! Votre aventure commence.",
    actif: "Vous etes sur la bonne voie ! Continuez a enregistrer vos ventes.",
    pro: "Impressionnant ! Vous maitrisez maintenant les bases de VEKO.",
    expert: "Vous etes un expert ! Vos analyses sont de plus en plus precises.",
    legend: "Legendaire ! Vous faites partie des meilleurs utilisateurs VEKO.",
  };
  return messages[level];
}
