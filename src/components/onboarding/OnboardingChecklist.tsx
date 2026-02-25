"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useOnboarding } from "@/context/OnboardingContext";
import { useUserLevel, XP_REWARDS } from "@/context/UserLevelContext";
import { useData } from "@/context/DataContext";
import { useRouter } from "next/navigation";

type ChecklistItem = {
  id: string;
  label: string;
  completed: boolean;
  action?: () => void;
};

export default function OnboardingChecklist() {
  const router = useRouter();
  const { userProfile, updateProfile, isOnboardingDone } = useOnboarding();
  const { ventes, produits, activeGoal, setShowObjectifModal } = useData();
  const { addXP } = useUserLevel();
  const [visible, setVisible] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  const [recentlyCompleted, setRecentlyCompleted] = useState<string | null>(null);

  const daysSinceOnboarding = userProfile.onboardingCompletedAt
    ? Math.floor((Date.now() - new Date(userProfile.onboardingCompletedAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const items: ChecklistItem[] = [
    { id: "account", label: "Compte cree", completed: true },
    { id: "profile", label: "Profil configure", completed: isOnboardingDone },
    { 
      id: "product", 
      label: "Ajouter votre premier produit", 
      completed: userProfile.firstProductDone || produits.length > 0,
      action: () => router.push("/dashboard/produits"),
    },
    { 
      id: "sale", 
      label: "Enregistrer votre premiere vente", 
      completed: userProfile.firstSaleDone || ventes.length > 0,
      action: () => router.push("/dashboard/calcul"),
    },
    { 
      id: "objective", 
      label: "Definir un objectif", 
      completed: userProfile.objectiveSet || activeGoal !== null,
      action: () => setShowObjectifModal(true),
    },
  ];

  const completedCount = items.filter(i => i.completed).length;
  const allCompleted = completedCount === items.length;

  const triggerConfetti = useCallback(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#8b5cf6", "#ec4899", "#10b981", "#3b82f6"],
    });
  }, []);

  useEffect(() => {
    if (produits.length > 0 && !userProfile.firstProductDone) {
      updateProfile({ firstProductDone: true });
      addXP(XP_REWARDS.firstProduct, "Premier produit cree");
      setRecentlyCompleted("product");
      setTimeout(() => setRecentlyCompleted(null), 2000);
    }
  }, [produits.length, userProfile.firstProductDone, updateProfile, addXP]);

  useEffect(() => {
    if (ventes.length > 0 && !userProfile.firstSaleDone) {
      updateProfile({ firstSaleDone: true });
      addXP(XP_REWARDS.firstSale, "Premiere vente enregistree");
      setRecentlyCompleted("sale");
      setTimeout(() => setRecentlyCompleted(null), 2000);
    }
  }, [ventes.length, userProfile.firstSaleDone, updateProfile, addXP]);

  useEffect(() => {
    if (activeGoal !== null && !userProfile.objectiveSet) {
      updateProfile({ objectiveSet: true });
      addXP(XP_REWARDS.setObjective, "Objectif defini");
      setRecentlyCompleted("objective");
      setTimeout(() => setRecentlyCompleted(null), 2000);
    }
  }, [activeGoal, userProfile.objectiveSet, updateProfile, addXP]);

  useEffect(() => {
    if (allCompleted && !showCelebration) {
      setShowCelebration(true);
      triggerConfetti();
      addXP(XP_REWARDS.checklistComplete, "Checklist completee");
      setTimeout(() => {
        setVisible(false);
        updateProfile({ checklistHidden: true });
      }, 5000);
    }
  }, [allCompleted, showCelebration, triggerConfetti, addXP, updateProfile]);

  if (!isOnboardingDone) return null;
  if (userProfile.checklistHidden) return null;
  if (daysSinceOnboarding > 7 && !allCompleted) return null;
  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      style={{
        background: "var(--dark-card)",
        borderRadius: "16px",
        border: "1px solid var(--diamond-border)",
        padding: "16px",
        marginBottom: "16px",
      }}
    >
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "12px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
            Votre demarrage VEKO
          </span>
          <span style={{
            fontSize: "11px",
            color: "var(--text-muted)",
            background: "var(--dark-elevated)",
            padding: "2px 8px",
            borderRadius: "10px",
          }}>
            {completedCount}/{items.length} etapes
          </span>
        </div>
        <button
          onClick={() => {
            setVisible(false);
            updateProfile({ checklistHidden: true });
          }}
          style={{
            background: "none",
            border: "none",
            color: "var(--text-muted)",
            cursor: "pointer",
            padding: "4px",
            fontSize: "12px",
          }}
        >
          <i className="fas fa-times"></i>
        </button>
      </div>

      <div style={{
        height: "4px",
        background: "var(--dark-elevated)",
        borderRadius: "2px",
        marginBottom: "16px",
        overflow: "hidden",
      }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(completedCount / items.length) * 100}%` }}
          transition={{ duration: 0.5 }}
          style={{
            height: "100%",
            background: allCompleted 
              ? "linear-gradient(90deg, #10b981, #059669)"
              : "linear-gradient(90deg, #8b5cf6, #ec4899)",
            borderRadius: "2px",
          }}
        />
      </div>

      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            style={{
              textAlign: "center",
              padding: "20px 0",
            }}
          >
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>🎉</div>
            <div style={{ fontSize: "16px", fontWeight: 700, color: "#10b981" }}>
              Votre VEKO est 100% configure !
            </div>
            <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
              Vous passez au niveau Actif
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!showCelebration && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {items.map(item => (
            <motion.div
              key={item.id}
              animate={recentlyCompleted === item.id ? { scale: [1, 1.02, 1] } : {}}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 0",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <motion.div
                  animate={recentlyCompleted === item.id ? { scale: [1, 1.3, 1] } : {}}
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    border: item.completed 
                      ? "none" 
                      : "2px solid var(--text-muted)",
                    background: item.completed 
                      ? "linear-gradient(135deg, #10b981, #059669)" 
                      : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {item.completed && (
                    <i className="fas fa-check" style={{ color: "white", fontSize: "10px" }}></i>
                  )}
                </motion.div>
                <span style={{
                  fontSize: "13px",
                  color: item.completed ? "var(--text-muted)" : "var(--text-primary)",
                  textDecoration: item.completed ? "line-through" : "none",
                }}>
                  {item.label}
                </span>
              </div>
              {!item.completed && item.action && (
                <button
                  onClick={item.action}
                  style={{
                    background: "var(--dark-elevated)",
                    border: "1px solid var(--diamond-border)",
                    borderRadius: "8px",
                    padding: "6px 12px",
                    color: "var(--accent-purple)",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "var(--font-inter), sans-serif",
                  }}
                >
                  <i className="fas fa-arrow-right" style={{ marginRight: "6px" }}></i>
                  Faire
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
