"use client";
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";

export type UserLevel = "starter" | "actif" | "pro" | "expert" | "legend";

type LevelConfig = {
  name: string;
  xpRequired: number;
  badge: string;
  color: string;
};

export const LEVELS: Record<UserLevel, LevelConfig> = {
  starter: { name: "Starter", xpRequired: 0, badge: "fas fa-star", color: "#9ca3af" },
  actif: { name: "Actif", xpRequired: 100, badge: "fas fa-fire", color: "#f59e0b" },
  pro: { name: "Pro", xpRequired: 300, badge: "fas fa-rocket", color: "#3b82f6" },
  expert: { name: "Expert", xpRequired: 700, badge: "fas fa-trophy", color: "#8b5cf6" },
  legend: { name: "Legend", xpRequired: 1500, badge: "fas fa-crown", color: "#eab308" },
};

export const XP_REWARDS = {
  firstSale: 50,
  firstProduct: 30,
  setObjective: 20,
  checklistComplete: 100,
  tenSales: 50,
  fiftySales: 100,
  hundredSales: 200,
  profitableMonth: 75,
};

type UserLevelContextType = {
  currentLevel: UserLevel;
  xpPoints: number;
  levelConfig: LevelConfig;
  nextLevelConfig: LevelConfig | null;
  progressToNextLevel: number;
  addXP: (amount: number, reason: string) => Promise<void>;
  showLevelUpModal: boolean;
  setShowLevelUpModal: (show: boolean) => void;
  newLevel: UserLevel | null;
  loading: boolean;
};

const UserLevelContext = createContext<UserLevelContextType | null>(null);

export function useUserLevel() {
  const ctx = useContext(UserLevelContext);
  if (!ctx) throw new Error("useUserLevel doit etre utilise dans UserLevelProvider");
  return ctx;
}

function calculateLevel(xp: number): UserLevel {
  if (xp >= LEVELS.legend.xpRequired) return "legend";
  if (xp >= LEVELS.expert.xpRequired) return "expert";
  if (xp >= LEVELS.pro.xpRequired) return "pro";
  if (xp >= LEVELS.actif.xpRequired) return "actif";
  return "starter";
}

function getNextLevel(current: UserLevel): UserLevel | null {
  const order: UserLevel[] = ["starter", "actif", "pro", "expert", "legend"];
  const idx = order.indexOf(current);
  return idx < order.length - 1 ? order[idx + 1] : null;
}

export function UserLevelProvider({ children }: { children: ReactNode }) {
  const [currentLevel, setCurrentLevel] = useState<UserLevel>("starter");
  const [xpPoints, setXpPoints] = useState(0);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [newLevel, setNewLevel] = useState<UserLevel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserLevel();
  }, []);

  const loadUserLevel = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("user_level, xp_points")
        .eq("id", user.id)
        .single();

      if (error) {
        console.warn("UserLevelContext: Colonnes manquantes, utilisation des valeurs par defaut", error.message);
        setCurrentLevel("starter");
        setXpPoints(0);
      } else if (data) {
        setCurrentLevel((data.user_level as UserLevel) || "starter");
        setXpPoints(data.xp_points || 0);
      }
    } catch (e) {
      console.error("UserLevelContext loadUserLevel:", e);
      setCurrentLevel("starter");
      setXpPoints(0);
    }
    setLoading(false);
  };

  const addXP = useCallback(async (amount: number, reason: string) => {
    const newXP = xpPoints + amount;
    const oldLevel = currentLevel;
    const newLevelCalc = calculateLevel(newXP);

    setXpPoints(newXP);
    setCurrentLevel(newLevelCalc);

    if (newLevelCalc !== oldLevel) {
      setNewLevel(newLevelCalc);
      setShowLevelUpModal(true);
    }

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from("profiles").update({
        xp_points: newXP,
        user_level: newLevelCalc,
      }).eq("id", user.id);

      console.log(`XP +${amount} (${reason}) -> Total: ${newXP} XP, Level: ${newLevelCalc}`);
    } catch (e) {
      console.error("UserLevelContext addXP:", e);
    }
  }, [xpPoints, currentLevel]);

  const levelConfig = LEVELS[currentLevel];
  const nextLevel = getNextLevel(currentLevel);
  const nextLevelConfig = nextLevel ? LEVELS[nextLevel] : null;

  const progressToNextLevel = nextLevelConfig
    ? ((xpPoints - levelConfig.xpRequired) / (nextLevelConfig.xpRequired - levelConfig.xpRequired)) * 100
    : 100;

  return (
    <UserLevelContext.Provider value={{
      currentLevel,
      xpPoints,
      levelConfig,
      nextLevelConfig,
      progressToNextLevel: Math.min(Math.max(progressToNextLevel, 0), 100),
      addXP,
      showLevelUpModal,
      setShowLevelUpModal,
      newLevel,
      loading,
    }}>
      {children}
    </UserLevelContext.Provider>
  );
}
