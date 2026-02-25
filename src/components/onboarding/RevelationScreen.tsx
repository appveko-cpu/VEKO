"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import { useOnboarding } from "@/context/OnboardingContext";

type AnimationPhase = 
  | "achat_fournisseur" 
  | "vente_client" 
  | "question" 
  | "costs" 
  | "counter" 
  | "message";

const costs = [
  { label: "Prix d'achat fournisseur", amount: 6500 },
  { label: "Transport pour recuperer", amount: 1000 },
  { label: "Livraison chez le client", amount: 1500 },
];

function PersonIcon({ icon, label, color }: { icon: string; label: string; color: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
      <div style={{
        width: "60px",
        height: "60px",
        borderRadius: "50%",
        background: `linear-gradient(135deg, ${color}, ${color}88)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: `0 8px 24px ${color}40`,
      }}>
        <i className={icon} style={{ fontSize: "24px", color: "white" }}></i>
      </div>
      <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>{label}</span>
    </div>
  );
}

function AnimatedCounter({ from, to, duration }: { from: number; to: number; duration: number }) {
  const [displayValue, setDisplayValue] = useState(from);
  const count = useMotionValue(from);
  const color = useTransform(count, [to, from], ["#ef4444", "#10b981"]);

  useEffect(() => {
    const unsubscribe = count.on("change", (latest) => {
      setDisplayValue(Math.round(latest));
    });
    const controls = animate(count, to, { duration, ease: "easeOut" });
    return () => {
      unsubscribe();
      controls.stop();
    };
  }, [count, to, duration]);

  return (
    <motion.span style={{ color, fontSize: "48px", fontWeight: 900 }}>
      {displayValue.toLocaleString("fr-FR")}
      <span style={{ fontSize: "24px", marginLeft: "8px" }}>FCFA</span>
    </motion.span>
  );
}

export default function RevelationScreen() {
  const { setCurrentStep } = useOnboarding();
  const [phase, setPhase] = useState<AnimationPhase>("achat_fournisseur");
  const [visibleCosts, setVisibleCosts] = useState(0);
  const [canSkip, setCanSkip] = useState(false);
  const [showShake, setShowShake] = useState(false);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    // Phase 1: Achat fournisseur (0-6s)
    // Already showing

    // Phase 2: Vente client (6s)
    timers.push(setTimeout(() => setPhase("vente_client"), 6000));

    // Phase 3: Question (12s)
    timers.push(setTimeout(() => setPhase("question"), 12000));

    // Phase 4: Costs (16s)
    timers.push(setTimeout(() => setPhase("costs"), 16000));
    timers.push(setTimeout(() => setVisibleCosts(1), 17000));
    timers.push(setTimeout(() => setVisibleCosts(2), 18500));
    timers.push(setTimeout(() => setVisibleCosts(3), 20000));

    // Phase 5: Counter (22s)
    timers.push(setTimeout(() => setPhase("counter"), 22000));
    timers.push(setTimeout(() => setShowShake(true), 26000));

    // Phase 6: Message (27s)
    timers.push(setTimeout(() => setPhase("message"), 27000));

    // Can skip after 3s
    timers.push(setTimeout(() => setCanSkip(true), 3000));

    return () => timers.forEach(clearTimeout);
  }, []);

  const handleClick = () => {
    if (canSkip) {
      setCurrentStep("profile");
    }
  };

  const totalCosts = costs.reduce((s, c) => s + c.amount, 0);
  const realProfit = 10000 - totalCosts; // 10000 - 9000 = 1000

  return (
    <div
      onClick={handleClick}
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        cursor: canSkip ? "pointer" : "default",
        background: "#0a0a0f",
      }}
    >
      <div style={{ maxWidth: "380px", width: "100%" }}>
        <AnimatePresence mode="wait">
          
          {/* PHASE 1: Achat Fournisseur */}
          {phase === "achat_fournisseur" && (
            <motion.div
              key="achat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ textAlign: "center" }}
            >
              <div style={{ 
                fontSize: "16px", 
                color: "rgba(255,255,255,0.6)", 
                marginBottom: "24px",
                fontWeight: 600,
              }}>
                Tu achetes ton produit a <span style={{ color: "#f59e0b", fontWeight: 800 }}>6 500 FCFA</span> chez ton fournisseur
              </div>

              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
                padding: "0 20px",
                position: "relative",
                height: "140px",
              }}>
                <PersonIcon icon="fas fa-store" label="Fournisseur" color="#f59e0b" />

                {/* Product moving right */}
                <motion.div
                  initial={{ x: -80 }}
                  animate={{ x: 80 }}
                  transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
                  style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", top: "20px" }}
                >
                  <i className="fas fa-box" style={{ fontSize: "28px", color: "#8b5cf6" }}></i>
                </motion.div>

                {/* Money moving left */}
                <motion.div
                  initial={{ x: 80, opacity: 0 }}
                  animate={{ x: -80, opacity: 1 }}
                  transition={{ duration: 1.5, delay: 1.5, ease: "easeInOut" }}
                  style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", bottom: "30px" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <i className="fas fa-money-bill-wave" style={{ fontSize: "20px", color: "#ef4444" }}></i>
                    <span style={{ fontSize: "14px", fontWeight: 800, color: "#ef4444" }}>-6 500</span>
                  </div>
                </motion.div>

                <PersonIcon icon="fas fa-user" label="Toi" color="#3b82f6" />
              </div>
            </motion.div>
          )}

          {/* PHASE 2: Vente Client */}
          {phase === "vente_client" && (
            <motion.div
              key="vente"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ textAlign: "center" }}
            >
              <div style={{ 
                fontSize: "16px", 
                color: "rgba(255,255,255,0.6)", 
                marginBottom: "24px",
                fontWeight: 600,
              }}>
                Et tu le revends a <span style={{ color: "#10b981", fontWeight: 800 }}>10 000 FCFA</span>
              </div>

              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
                padding: "0 20px",
                position: "relative",
                height: "140px",
              }}>
                <PersonIcon icon="fas fa-user" label="Toi" color="#3b82f6" />

                {/* Product moving right */}
                <motion.div
                  initial={{ x: -80 }}
                  animate={{ x: 80 }}
                  transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
                  style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", top: "20px" }}
                >
                  <i className="fas fa-box" style={{ fontSize: "28px", color: "#8b5cf6" }}></i>
                </motion.div>

                {/* Money moving left */}
                <motion.div
                  initial={{ x: 80, opacity: 0 }}
                  animate={{ x: -80, opacity: 1 }}
                  transition={{ duration: 1.5, delay: 1.5, ease: "easeInOut" }}
                  style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", bottom: "30px" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <i className="fas fa-money-bill-wave" style={{ fontSize: "20px", color: "#10b981" }}></i>
                    <span style={{ fontSize: "14px", fontWeight: 800, color: "#10b981" }}>+10 000</span>
                  </div>
                </motion.div>

                <PersonIcon icon="fas fa-user-group" label="Client" color="#10b981" />
              </div>
            </motion.div>
          )}

          {/* PHASE 3: Question provocante */}
          {phase === "question" && (
            <motion.div
              key="question"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              style={{ textAlign: "center" }}
            >
              <motion.div
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                style={{ fontSize: "60px", marginBottom: "20px" }}
              >
                🤔
              </motion.div>

              <div style={{ 
                fontSize: "22px", 
                color: "white", 
                fontWeight: 800,
                marginBottom: "16px",
              }}>
                Et tu crois gagner <span style={{ color: "#10b981" }}>10 000</span> ?
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                style={{ 
                  fontSize: "16px", 
                  color: "#f59e0b",
                  fontWeight: 600,
                }}
              >
                Tu as oublie...
              </motion.div>
            </motion.div>
          )}

          {/* PHASE 4: Costs */}
          {phase === "costs" && (
            <motion.div
              key="costs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div style={{ 
                fontSize: "16px", 
                color: "rgba(255,255,255,0.6)", 
                marginBottom: "20px",
                textAlign: "center",
                fontWeight: 600,
              }}>
                Tu as oublie...
              </div>

              <div style={{
                background: "rgba(255,255,255,0.05)",
                borderRadius: "16px",
                padding: "20px",
                border: "1px solid rgba(239, 68, 68, 0.3)",
              }}>
                {costs.map((cost, idx) => (
                  <motion.div
                    key={cost.label}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ 
                      opacity: idx < visibleCosts ? 1 : 0, 
                      x: idx < visibleCosts ? 0 : -30 
                    }}
                    transition={{ duration: 0.4 }}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "14px 0",
                      borderBottom: idx < costs.length - 1 ? "1px solid rgba(255,255,255,0.1)" : "none",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <i className="fas fa-times-circle" style={{ color: "#ef4444", fontSize: "16px" }}></i>
                      <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "14px", fontWeight: 500 }}>
                        {cost.label}
                      </span>
                    </div>
                    <span style={{ color: "#ef4444", fontWeight: 800, fontSize: "15px" }}>
                      - {cost.amount.toLocaleString("fr-FR")} F
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* PHASE 5: Animated Counter */}
          {phase === "counter" && (
            <motion.div
              key="counter"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ textAlign: "center" }}
            >
              <div style={{ 
                fontSize: "16px", 
                color: "rgba(255,255,255,0.6)", 
                marginBottom: "24px",
                fontWeight: 600,
              }}>
                Ce que tu gagnes vraiment :
              </div>

              <motion.div
                animate={showShake ? { 
                  x: [0, -10, 10, -10, 10, 0],
                } : {}}
                transition={{ duration: 0.5 }}
              >
                <AnimatedCounter from={10000} to={realProfit} duration={4} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2 }}
                style={{ 
                  marginTop: "20px",
                  fontSize: "13px",
                  color: "rgba(255,255,255,0.5)",
                }}
              >
                Sur 10 000 FCFA de vente...
              </motion.div>
            </motion.div>
          )}

          {/* PHASE 6: Message + CTA */}
          {phase === "message" && (
            <motion.div
              key="message"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div style={{ textAlign: "center", marginBottom: "32px" }}>
                <div style={{ 
                  fontSize: "14px", 
                  color: "rgba(255,255,255,0.5)", 
                  marginBottom: "12px" 
                }}>
                  Ce que tu gagnes vraiment :
                </div>
                <div style={{
                  fontSize: "48px",
                  fontWeight: 900,
                  color: "#ef4444",
                }}>
                  {realProfit.toLocaleString("fr-FR")} FCFA
                </div>
                <div style={{ 
                  fontSize: "13px", 
                  color: "rgba(255,255,255,0.4)", 
                  marginTop: "8px" 
                }}>
                  Sur 10 000 FCFA de vente
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                style={{ textAlign: "center" }}
              >
                <div style={{
                  fontSize: "18px",
                  color: "white",
                  fontWeight: 700,
                  marginBottom: "28px",
                }}>
                  C&apos;est pour ca que <span style={{ color: "#8b5cf6" }}>VEKO</span> existe.
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentStep("profile");
                  }}
                  style={{
                    width: "100%",
                    padding: "18px 24px",
                    borderRadius: "14px",
                    border: "none",
                    background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
                    color: "white",
                    fontSize: "16px",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 8px 32px rgba(139, 92, 246, 0.4)",
                    fontFamily: "var(--font-inter), sans-serif",
                  }}
                >
                  Je veux voir mes vrais chiffres
                  <i className="fas fa-arrow-right" style={{ marginLeft: "12px" }}></i>
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {canSkip && phase !== "message" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              position: "fixed",
              bottom: "40px",
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: "12px",
              color: "rgba(255,255,255,0.3)",
            }}
          >
            Appuyez n&apos;importe ou pour passer
          </motion.div>
        )}
      </div>
    </div>
  );
}
