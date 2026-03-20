"use client";
import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User, AuthChangeEvent, Session, RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { ACCESS_SYSTEM_ENABLED } from "@/lib/feature-flags";

export type Plan = "free" | "solo" | "pro" | "fondateur" | null;

const SOLO_BLOCKED_FEATURES = [
  "multi_boutiques",
  "multi_gestionnaires",
  "shopify",
  "charges_fixes",
  "support_prioritaire",
  "labo_history",
];

const PRO_ONLY_FEATURES = [
  "charges_fixes",
  "shopify",
  "labo_history",
  "multi_boutiques",
  "multi_gestionnaires",
];

interface AccessContextType {
  plan: Plan;
  essaisRestants: number;
  isAuthenticated: boolean;
  isDemoMode: boolean;
  checkAndGate: (feature: string, onAllowed: () => void) => void;
  canAccess: (feature: string) => boolean;
  showAuthModal: boolean;
  showPricingModal: boolean;
  showUpgradeModal: boolean;
  upgradeFeature: string | null;
  setShowPricingModal: (v: boolean) => void;
  setShowAuthModal: (v: boolean) => void;
  setShowUpgradeModal: (v: boolean) => void;
  refreshAccess: () => Promise<void>;
}

const AccessContext = createContext<AccessContextType | null>(null);

export function useAccess() {
  const ctx = useContext(AccessContext);
  if (!ctx) throw new Error("useAccess doit être utilisé dans AccessProvider");
  return ctx;
}

export function AccessProvider({ children }: { children: React.ReactNode }) {
  const [plan, setPlan] = useState<Plan>(null);
  const [essaisRestants, setEssaisRestants] = useState(6);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState<string | null>(null);
  const userRef = useRef<User | null>(null);
  const essaisRef = useRef(6);

  useEffect(() => {
    essaisRef.current = essaisRestants;
  }, [essaisRestants]);

  const loadProfile = useCallback(async (userId: string) => {
    if (!ACCESS_SYSTEM_ENABLED) return;
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("profiles")
        .select("plan, essais_restants")
        .eq("id", userId)
        .single();
      if (data) {
        setPlan((data.plan as Plan) ?? "free");
        setEssaisRestants(data.essais_restants ?? 6);
      }
    } catch (e) {
      console.error("[AccessContext] loadProfile:", e);
    }
  }, []);

  const refreshAccess = useCallback(async () => {
    if (userRef.current) {
      await loadProfile(userRef.current.id);
    }
  }, [loadProfile]);

  useEffect(() => {
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      if (session?.user) {
        userRef.current = session.user;
        setIsAuthenticated(true);
        await loadProfile(session.user.id);
      } else {
        userRef.current = null;
        setIsAuthenticated(false);
        setPlan(null);
        setEssaisRestants(6);
      }
    });
    return () => subscription.unsubscribe();
  }, [loadProfile]);

  useEffect(() => {
    if (!ACCESS_SYSTEM_ENABLED) return;
    const supabase = createClient();
    const channel = supabase
      .channel("access-profile-changes")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "profiles" }, (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
        if (!userRef.current) return;
        const newData = payload.new as Record<string, unknown>;
        if (newData.id === userRef.current.id) {
          if (newData.plan !== undefined) setPlan(newData.plan as Plan);
          if (newData.essais_restants !== undefined) setEssaisRestants(newData.essais_restants as number);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const decrementTrial = useCallback(async () => {
    if (!ACCESS_SYSTEM_ENABLED) return;
    if (!userRef.current) return;
    const currentEssais = essaisRef.current;
    if (currentEssais <= 0) return;
    const supabase = createClient();
    await supabase
      .from("profiles")
      .update({ essais_restants: currentEssais - 1 })
      .eq("id", userRef.current.id);
    setEssaisRestants(prev => Math.max(0, prev - 1));
  }, []);

  const canAccess = useCallback((feature: string): boolean => {
    if (!isAuthenticated) return false;
    if (!ACCESS_SYSTEM_ENABLED) return true;
    if (plan === "fondateur" || plan === "pro") return true;
    if (plan === "solo") return !SOLO_BLOCKED_FEATURES.includes(feature);
    return false;
  }, [isAuthenticated, plan]);

  const checkAndGate = useCallback((feature: string, onAllowed: () => void) => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    if (!ACCESS_SYSTEM_ENABLED) {
      onAllowed();
      return;
    }
    if (plan === "fondateur" || plan === "pro") {
      onAllowed();
      return;
    }
    if (plan === "solo") {
      if (SOLO_BLOCKED_FEATURES.includes(feature)) {
        setUpgradeFeature(feature);
        setShowUpgradeModal(true);
      } else {
        onAllowed();
      }
      return;
    }
    if (PRO_ONLY_FEATURES.includes(feature)) {
      setShowPricingModal(true);
      return;
    }
    if (essaisRef.current > 0) {
      decrementTrial();
      onAllowed();
    } else {
      setShowPricingModal(true);
    }
  }, [isAuthenticated, plan, decrementTrial]);

  return (
    <AccessContext.Provider value={{
      plan,
      essaisRestants,
      isAuthenticated,
      isDemoMode: !isAuthenticated,
      checkAndGate,
      canAccess,
      showAuthModal,
      showPricingModal,
      showUpgradeModal,
      upgradeFeature,
      setShowPricingModal,
      setShowAuthModal,
      setShowUpgradeModal,
      refreshAccess,
    }}>
      {children}
    </AccessContext.Provider>
  );
}
