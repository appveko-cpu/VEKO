"use client";
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

export type BusinessType = "boutique" | "social" | "shopify" | "manual";
export type OnboardingStep = "welcome" | "revelation" | "profile" | "profile_followup" | "config" | "complete";

export type UserProfile = {
  prenom: string | null;
  businessType: BusinessType;
  pubEnabled: boolean;
  livraisonEnabled: boolean;
  loyerEnabled: boolean;
  shopifyConnected: boolean;
  shopifyStoreUrl: string | null;
  onboardingCompletedAt: string | null;
  checklistHidden: boolean;
  firstSaleDone: boolean;
  firstProductDone: boolean;
  objectiveSet: boolean;
};

type OnboardingContextType = {
  currentStep: OnboardingStep;
  setCurrentStep: (step: OnboardingStep) => void;
  userProfile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  isOnboardingDone: boolean;
  skipOnboarding: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  isTooltipSeen: (tooltipId: string) => boolean;
  markTooltipSeen: (tooltipId: string) => void;
  showShopifyModal: boolean;
  setShowShopifyModal: (show: boolean) => void;
  loading: boolean;
};

const defaultProfile: UserProfile = {
  prenom: null,
  businessType: "social",
  pubEnabled: true,
  livraisonEnabled: true,
  loyerEnabled: false,
  shopifyConnected: false,
  shopifyStoreUrl: null,
  onboardingCompletedAt: null,
  checklistHidden: false,
  firstSaleDone: false,
  firstProductDone: false,
  objectiveSet: false,
};

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error("useOnboarding doit etre utilise dans OnboardingProvider");
  return ctx;
}

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("welcome");
  const [userProfile, setUserProfile] = useState<UserProfile>(defaultProfile);
  const [isOnboardingDone, setIsOnboardingDone] = useState(false);
  const [showShopifyModal, setShowShopifyModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      if (session && (event === "INITIAL_SESSION" || event === "SIGNED_IN")) {
        loadProfile();
      } else if (!session && event === "INITIAL_SESSION") {
        setLoading(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("prenom, full_name, business_type, pub_enabled, livraison_enabled, loyer_enabled, shopify_connected, shopify_store_url, onboarding_completed_at, checklist_hidden, first_sale_done, first_product_done, objective_set")
        .eq("id", user.id)
        .single();

      if (error) {
        console.warn("OnboardingContext: Certaines colonnes manquantes, utilisation des valeurs par defaut", error.message);
      }

      if (data) {
        setUserProfile({
          prenom: data.prenom || data.full_name || null,
          businessType: (data.business_type as BusinessType) || "social",
          pubEnabled: data.pub_enabled ?? true,
          livraisonEnabled: data.livraison_enabled ?? true,
          loyerEnabled: data.loyer_enabled ?? false,
          shopifyConnected: data.shopify_connected ?? false,
          shopifyStoreUrl: data.shopify_store_url || null,
          onboardingCompletedAt: data.onboarding_completed_at || null,
          checklistHidden: data.checklist_hidden ?? false,
          firstSaleDone: data.first_sale_done ?? false,
          firstProductDone: data.first_product_done ?? false,
          objectiveSet: data.objective_set ?? false,
        });

        if (data.onboarding_completed_at) {
          setIsOnboardingDone(true);
        }
      }
    } catch (e) {
      console.error("OnboardingContext loadProfile:", e);
    }
    setLoading(false);
  };

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    setUserProfile(prev => ({ ...prev, ...updates }));
    
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const dbUpdates: Record<string, unknown> = {};
      if (updates.businessType !== undefined) dbUpdates.business_type = updates.businessType;
      if (updates.pubEnabled !== undefined) dbUpdates.pub_enabled = updates.pubEnabled;
      if (updates.livraisonEnabled !== undefined) dbUpdates.livraison_enabled = updates.livraisonEnabled;
      if (updates.loyerEnabled !== undefined) dbUpdates.loyer_enabled = updates.loyerEnabled;
      if (updates.shopifyConnected !== undefined) dbUpdates.shopify_connected = updates.shopifyConnected;
      if (updates.shopifyStoreUrl !== undefined) dbUpdates.shopify_store_url = updates.shopifyStoreUrl;
      if (updates.onboardingCompletedAt !== undefined) dbUpdates.onboarding_completed_at = updates.onboardingCompletedAt;
      if (updates.checklistHidden !== undefined) dbUpdates.checklist_hidden = updates.checklistHidden;
      if (updates.firstSaleDone !== undefined) dbUpdates.first_sale_done = updates.firstSaleDone;
      if (updates.firstProductDone !== undefined) dbUpdates.first_product_done = updates.firstProductDone;
      if (updates.objectiveSet !== undefined) dbUpdates.objective_set = updates.objectiveSet;

      if (Object.keys(dbUpdates).length > 0) {
        await supabase.from("profiles").update(dbUpdates).eq("id", user.id);
      }
    } catch (e) {
      console.error("OnboardingContext updateProfile:", e);
    }
  }, []);

  const skipOnboarding = useCallback(async () => {
    setIsOnboardingDone(true);
    await updateProfile({ onboardingCompletedAt: new Date().toISOString() });
  }, [updateProfile]);

  const completeOnboarding = useCallback(async () => {
    setIsOnboardingDone(true);
    await updateProfile({ onboardingCompletedAt: new Date().toISOString() });
  }, [updateProfile]);

  const isTooltipSeen = useCallback((tooltipId: string): boolean => {
    return localStorage.getItem(`veko_tooltip_${tooltipId}`) !== null;
  }, []);

  const markTooltipSeen = useCallback((tooltipId: string) => {
    localStorage.setItem(`veko_tooltip_${tooltipId}`, "1");
  }, []);

  return (
    <OnboardingContext.Provider value={{
      currentStep,
      setCurrentStep,
      userProfile,
      updateProfile,
      isOnboardingDone,
      skipOnboarding,
      completeOnboarding,
      isTooltipSeen,
      markTooltipSeen,
      showShopifyModal,
      setShowShopifyModal,
      loading,
    }}>
      {children}
    </OnboardingContext.Provider>
  );
}
