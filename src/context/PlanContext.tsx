"use client";
import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

type PlanContextType = {
  plan: string | null;
  essaisRestants: number;
  loading: boolean;
  consumeEssai: () => Promise<boolean>;
};

const PlanContext = createContext<PlanContextType | null>(null);

export function usePlan() {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan doit être utilisé dans PlanProvider");
  return ctx;
}

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const [plan, setPlan] = useState<string | null>(null);
  const [essaisRestants, setEssaisRestants] = useState(0);
  const [loading, setLoading] = useState(true);
  const userIdRef = useRef<string | null>(null);
  const planRef = useRef<string | null>(null);
  const essaisRef = useRef(0);

  const loadProfile = useCallback(async (userId: string) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("profiles")
        .select("plan, essais_restants")
        .eq("id", userId)
        .single();
      if (error || !data) return;
      const p = (data.plan as string) ?? "free";
      const e = Number(data.essais_restants) ?? 0;
      setPlan(p);
      setEssaisRestants(e);
      planRef.current = p;
      essaisRef.current = e;
    } catch (err) {
      console.error("[PlanContext] loadProfile:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const supabase = createClient();
    let handled = false;

    supabase.auth.getSession().then(({ data }: { data: { session: import("@supabase/supabase-js").Session | null } }) => {
      if (handled) return;
      handled = true;
      if (data.session?.user) {
        userIdRef.current = data.session.user.id;
        loadProfile(data.session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        if (event === "INITIAL_SESSION") {
          if (!handled) {
            handled = true;
            if (session?.user) {
              userIdRef.current = session.user.id;
              loadProfile(session.user.id);
            } else {
              setLoading(false);
            }
          }
        } else if (session && (event === "SIGNED_IN" || event === "TOKEN_REFRESHED")) {
          userIdRef.current = session.user.id;
          loadProfile(session.user.id);
        } else if (event === "SIGNED_OUT") {
          userIdRef.current = null;
          setPlan(null);
          setEssaisRestants(0);
          planRef.current = null;
          essaisRef.current = 0;
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  const consumeEssai = useCallback(async (): Promise<boolean> => {
    const currentPlan = planRef.current;
    if (
      currentPlan === "fondateur" ||
      currentPlan === "pro" ||
      currentPlan === "solo"
    ) {
      return true;
    }
    if (currentPlan === "free" || currentPlan === null) {
      if (essaisRef.current <= 0) {
        alert("Essais épuisés");
        return false;
      }
      const newVal = essaisRef.current - 1;
      essaisRef.current = newVal;
      setEssaisRestants(newVal);
      const uid = userIdRef.current;
      if (uid) {
        try {
          await createClient()
            .from("profiles")
            .update({ essais_restants: newVal })
            .eq("id", uid);
        } catch (err) {
          console.error("[PlanContext] consumeEssai update:", err);
        }
      }
      return true;
    }
    return true;
  }, []);

  return (
    <PlanContext.Provider value={{ plan, essaisRestants, loading, consumeEssai }}>
      {children}
    </PlanContext.Provider>
  );
}
