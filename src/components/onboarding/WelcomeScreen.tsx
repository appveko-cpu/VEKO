"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useOnboarding } from "@/context/OnboardingContext";

function Particles() {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; size: number; delay: number }[]>([]);

  useEffect(() => {
    const p = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 5,
    }));
    setParticles(p);
  }, []);

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {particles.map(p => (
        <motion.div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: "rgba(139, 92, 246, 0.4)",
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: 4 + Math.random() * 2,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

export default function WelcomeScreen() {
  const { setCurrentStep, skipOnboarding, userProfile } = useOnboarding();
  const prenom = userProfile.prenom || "Boss";

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      position: "relative",
    }}>
      <Particles />

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        style={{
          fontSize: "48px",
          marginBottom: "16px",
        }}
      >
        <span style={{ filter: "drop-shadow(0 0 20px rgba(139, 92, 246, 0.5))" }}>
          <i className="fas fa-chart-line" style={{ 
            background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}></i>
        </span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        style={{
          fontSize: "28px",
          fontWeight: 900,
          color: "white",
          marginBottom: "12px",
          textAlign: "center",
        }}
      >
        Bienvenue {prenom}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.9 }}
        style={{
          fontSize: "14px",
          color: "rgba(255,255,255,0.6)",
          textAlign: "center",
          maxWidth: "300px",
          lineHeight: 1.6,
          marginBottom: "40px",
        }}
      >
        VEKO vous aide a voir ce que vous gagnez vraiment sur chaque vente.
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.2 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setCurrentStep("revelation")}
        style={{
          width: "100%",
          maxWidth: "320px",
          padding: "18px 24px",
          borderRadius: "16px",
          border: "none",
          background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
          color: "white",
          fontSize: "16px",
          fontWeight: 800,
          cursor: "pointer",
          boxShadow: "0 8px 32px rgba(139, 92, 246, 0.4)",
          fontFamily: "var(--font-inter), sans-serif",
        }}
      >
        Decouvrir VEKO
        <i className="fas fa-arrow-right" style={{ marginLeft: "10px" }}></i>
      </motion.button>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.5 }}
        onClick={skipOnboarding}
        style={{
          marginTop: "20px",
          background: "none",
          border: "none",
          color: "rgba(255,255,255,0.4)",
          fontSize: "12px",
          cursor: "pointer",
          textDecoration: "underline",
          fontFamily: "var(--font-inter), sans-serif",
        }}
      >
        Je connais deja l&apos;app, passer
      </motion.button>
    </div>
  );
}
