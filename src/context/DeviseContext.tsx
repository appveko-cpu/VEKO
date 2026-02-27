"use client";
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

const TAUX_VERS_EUR: Record<string, number> = {
  "EUR": 1,
  "USD": 1.08,
  "FCFA": 655.957,
  "XAF": 655.957,
  "XOF": 655.957,
  "GBP": 0.86,
  "MAD": 10.8,
  "TND": 3.4,
  "DZD": 145,
  "GNF": 9200,
  "CDF": 2800,
  "NGN": 1650,
  "GHS": 15.5,
  "KES": 165,
  "ZAR": 20.5,
  "EGP": 52,
  "CHF": 0.96,
  "CAD": 1.47,
  "CNY": 7.8,
  "JPY": 162,
  "INR": 90,
  "BRL": 5.4,
  "MXN": 18.5,
  "AED": 3.97,
  "SAR": 4.05,
};

function convertirMontant(montant: number, deviseSource: string, deviseCible: string): number {
  if (deviseSource === deviseCible) return montant;
  const tauxSource = TAUX_VERS_EUR[deviseSource] || 1;
  const tauxCible = TAUX_VERS_EUR[deviseCible] || 1;
  const enEur = montant / tauxSource;
  return enEur * tauxCible;
}

type DeviseContextType = {
  deviseActuelle: string;
  deviseBase: string;
  setDevise: (d: string) => void;
  setDeviseBase: (d: string) => void;
  convertir: (montant: number) => number;
  getSymbole: () => string;
};

const SYMBOLES: Record<string, string> = {
  "EUR": "€",
  "USD": "$",
  "GBP": "£",
  "CHF": "CHF",
  "CAD": "CAD",
  "JPY": "¥",
  "CNY": "¥",
  "INR": "₹",
  "BRL": "R$",
  "MXN": "MXN",
  "AED": "AED",
  "SAR": "SAR",
};

const DeviseContext = createContext<DeviseContextType>({
  deviseActuelle: "FCFA",
  deviseBase: "FCFA",
  setDevise: () => {},
  setDeviseBase: () => {},
  convertir: (m) => m,
  getSymbole: () => "FCFA",
});

export function DeviseProvider({ children }: { children: ReactNode }) {
  const [deviseActuelle, setDeviseActuelle] = useState("FCFA");
  const [deviseBase, setDeviseBaseState] = useState("FCFA");

  const syncDevise = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("devise, devise_base")
        .eq("id", user.id)
        .single();
      if (data?.devise) setDeviseActuelle(data.devise);
      if (data?.devise_base) setDeviseBaseState(data.devise_base);
    } catch { }
  }, []);

  useEffect(() => {
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      if (session && (event === "INITIAL_SESSION" || event === "SIGNED_IN")) {
        syncDevise();
      }
    });
    return () => subscription.unsubscribe();
  }, [syncDevise]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") syncDevise();
    };
    const onFocus = () => syncDevise();
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onFocus);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onFocus);
    };
  }, [syncDevise]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") syncDevise();
    }, 30000);
    return () => clearInterval(interval);
  }, [syncDevise]);

  const setDevise = useCallback((d: string) => {
    setDeviseActuelle(d);
    async function save() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        await supabase
          .from("profiles")
          .update({ devise: d })
          .eq("id", user.id);
      } catch { }
    }
    save();
  }, []);

  const setDeviseBase = useCallback((d: string) => {
    setDeviseBaseState(d);
    async function save() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        await supabase
          .from("profiles")
          .update({ devise_base: d })
          .eq("id", user.id);
      } catch { }
    }
    save();
  }, []);

  const convertir = useCallback((montant: number): number => {
    return convertirMontant(montant, deviseBase, deviseActuelle);
  }, [deviseBase, deviseActuelle]);

  const getSymbole = useCallback((): string => {
    return SYMBOLES[deviseActuelle] || deviseActuelle;
  }, [deviseActuelle]);

  return (
    <DeviseContext.Provider value={{ 
      deviseActuelle, 
      deviseBase,
      setDevise, 
      setDeviseBase,
      convertir,
      getSymbole
    }}>
      {children}
    </DeviseContext.Provider>
  );
}

export function useDevise() {
  return useContext(DeviseContext);
}
