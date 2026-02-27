"use client";
import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

export type Vente = {
  id: string;
  user_id?: string;
  date: string;
  nom_client: string;
  tel: string;
  produit: string;
  nb_pieces: number;
  prix_vente: number;
  ca: number;
  depenses: number;
  benefice: number;
  marge: number;
  budget_pub_provisoire: boolean;
  retournee: boolean;
  created_at?: string;
};

export type Produit = {
  id: string;
  user_id?: string;
  nom: string;
  prix_revient: number;
  frais_transport?: number;
  prix_vente: number;
  commission: number;
  nb_articles?: number;
  created_at?: string;
};

export type GoalType = "revenue" | "net_profit" | "products_sold";

export type Goal = {
  id: string;
  user_id: string;
  type: GoalType;
  target_value: number;
  start_date: string;
  end_date: string;
  created_at: string;
};

export type GoalStats = {
  dailyTarget: number;
  daysRemaining: number;
  totalDays: number;
  currentProgress: number;
  progressPercent: number;
  todayProgress: number;
  todayPercent: number;
};

type DataContextType = {
  ventes: Vente[];
  produits: Produit[];
  loading: boolean;
  addVente: (v: Omit<Vente, "id" | "created_at" | "user_id">) => Promise<string | null>;
  deleteVente: (id: string) => Promise<void>;
  marquerRetournee: (id: string) => Promise<void>;
  repartirPubJour: (budgetTotal: number) => Promise<void>;
  addProduit: (p: Omit<Produit, "id" | "created_at" | "user_id">) => Promise<boolean>;
  updateProduit: (id: string, p: Partial<Omit<Produit, "id" | "user_id">>) => Promise<boolean>;
  deleteProduit: (id: string) => Promise<void>;
  activeGoal: Goal | null;
  goalStats: GoalStats | null;
  createGoal: (goal: Omit<Goal, "id" | "user_id" | "created_at">) => Promise<boolean>;
  updateGoal: (id: string, goal: Partial<Omit<Goal, "id" | "user_id" | "created_at">>) => Promise<boolean>;
  deleteGoal: (id: string) => Promise<void>;
  showObjectifModal: boolean;
  setShowObjectifModal: (show: boolean) => void;
};

const DataContext = createContext<DataContextType | null>(null);

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData doit être utilisé dans DataProvider");
  return ctx;
}

function mapVente(v: Record<string, unknown>): Vente {
  return {
    id: v.id as string,
    user_id: v.user_id as string,
    date: (v.date as string) ?? new Date().toISOString(),
    nom_client: (v.nom_client as string) ?? "",
    tel: (v.tel as string) ?? "",
    produit: (v.produit as string) ?? "",
    nb_pieces: Number(v.nb_pieces) || 0,
    prix_vente: Number(v.prix_vente) || 0,
    ca: Number(v.ca) || 0,
    depenses: Number(v.depenses) || 0,
    benefice: Number(v.benefice) || 0,
    marge: Number(v.marge) || 0,
    budget_pub_provisoire: Boolean(v.budget_pub_provisoire),
    retournee: Boolean(v.retournee),
    created_at: v.created_at as string,
  };
}

function mapProduit(p: Record<string, unknown>): Produit {
  return {
    id: p.id as string,
    user_id: p.user_id as string,
    nom: (p.nom as string) ?? "",
    prix_revient: Number(p.prix_revient) || 0,
    frais_transport: p.frais_transport !== undefined && p.frais_transport !== null ? Number(p.frais_transport) : undefined,
    prix_vente: Number(p.prix_vente) || 0,
    commission: Number(p.commission) || 0,
    nb_articles: p.nb_articles !== undefined && p.nb_articles !== null ? Number(p.nb_articles) : undefined,
    created_at: p.created_at as string,
  };
}

function mapGoal(g: Record<string, unknown>): Goal {
  return {
    id: g.id as string,
    user_id: g.user_id as string,
    type: g.type as GoalType,
    target_value: Number(g.target_value) || 0,
    start_date: g.start_date as string,
    end_date: g.end_date as string,
    created_at: g.created_at as string,
  };
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [ventes, setVentes] = useState<Vente[]>([]);
  const [produits, setProduits] = useState<Produit[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeGoal, setActiveGoal] = useState<Goal | null>(null);
  const [showObjectifModal, setShowObjectifModal] = useState(false);
  const initialLoadDone = useRef(false);

  const loadAll = useCallback(async () => {
    if (!initialLoadDone.current) setLoading(true);
    try {
      const supabase = createClient();
      const [{ data: v }, { data: p }, { data: g }] = await Promise.all([
        supabase.from("ventes").select("*").order("date", { ascending: false }),
        supabase.from("produits").select("*").order("nom"),
        supabase.from("goals").select("*").order("created_at", { ascending: false }).limit(1),
      ]);
      if (v) setVentes(v.map(mapVente));
      if (p) setProduits(p.map(mapProduit));
      if (g && g.length > 0) {
        const goal = mapGoal(g[0] as Record<string, unknown>);
        const today = new Date();
        const endDate = new Date(goal.end_date);
        if (endDate >= today) {
          setActiveGoal(goal);
        } else {
          setActiveGoal(null);
        }
      } else {
        setActiveGoal(null);
      }
    } catch (e) {
      console.error("DataContext loadAll:", e);
    }
    initialLoadDone.current = true;
    setLoading(false);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      if (session && (event === "INITIAL_SESSION" || event === "SIGNED_IN" || event === "TOKEN_REFRESHED")) {
        loadAll();
      } else if (!session && event === "INITIAL_SESSION") {
        setLoading(false);
      } else if (event === "SIGNED_OUT") {
        setVentes([]);
        setProduits([]);
        setActiveGoal(null);
        setLoading(false);
      }
    });
    return () => subscription.unsubscribe();
  }, [loadAll]);

  useEffect(() => {
    const supabase = createClient();
    const ch = supabase
      .channel("data-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "ventes" }, () => loadAll())
      .on("postgres_changes", { event: "*", schema: "public", table: "produits" }, () => loadAll())
      .on("postgres_changes", { event: "*", schema: "public", table: "goals" }, () => loadAll())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [loadAll]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") loadAll();
    };
    const onFocus = () => loadAll();
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onFocus);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onFocus);
    };
  }, [loadAll]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") loadAll();
    }, 15000);
    return () => clearInterval(interval);
  }, [loadAll]);

  const goalStats = useMemo((): GoalStats | null => {
    if (!activeGoal) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(activeGoal.start_date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(activeGoal.end_date);
    endDate.setHours(23, 59, 59, 999);

    const totalDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
    const dailyTarget = activeGoal.target_value / totalDays;

    const ventesInPeriod = ventes.filter(v => {
      if (v.retournee) return false;
      const venteDate = new Date(v.date);
      return venteDate >= startDate && venteDate <= endDate;
    });

    const ventesToday = ventes.filter(v => {
      if (v.retournee) return false;
      const venteDate = new Date(v.date);
      return venteDate.toDateString() === today.toDateString();
    });

    let currentProgress = 0;
    let todayProgress = 0;

    if (activeGoal.type === "revenue") {
      currentProgress = ventesInPeriod.reduce((s, v) => s + v.ca, 0);
      todayProgress = ventesToday.reduce((s, v) => s + v.ca, 0);
    } else if (activeGoal.type === "net_profit") {
      currentProgress = ventesInPeriod.reduce((s, v) => s + v.benefice, 0);
      todayProgress = ventesToday.reduce((s, v) => s + v.benefice, 0);
    } else if (activeGoal.type === "products_sold") {
      currentProgress = ventesInPeriod.reduce((s, v) => s + v.nb_pieces, 0);
      todayProgress = ventesToday.reduce((s, v) => s + v.nb_pieces, 0);
    }

    const progressPercent = Math.min(100, (currentProgress / activeGoal.target_value) * 100);
    const todayPercent = dailyTarget > 0 ? Math.min(100, (todayProgress / dailyTarget) * 100) : 0;

    return {
      dailyTarget,
      daysRemaining,
      totalDays,
      currentProgress,
      progressPercent,
      todayProgress,
      todayPercent,
    };
  }, [activeGoal, ventes]);

  const addVente = useCallback(async (v: Omit<Vente, "id" | "created_at" | "user_id">): Promise<string | null> => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data, error } = await supabase
        .from("ventes")
        .insert({ ...v, user_id: user.id })
        .select()
        .single();
      if (error || !data) return null;
      const nv = mapVente(data as Record<string, unknown>);
      setVentes(prev => [nv, ...prev]);
      return nv.id;
    } catch (e) {
      console.error("[DataContext] addVente erreur:", e);
      return null;
    }
  }, []);

  const deleteVente = useCallback(async (id: string) => {
    try {
      const { error } = await createClient().from("ventes").delete().eq("id", id);
      if (error) throw error;
      setVentes(prev => prev.filter(v => v.id !== id));
    } catch (e) {
      console.error("[DataContext] deleteVente erreur:", e);
    }
  }, []);

  const marquerRetournee = useCallback(async (id: string) => {
    const vente = ventes.find(v => v.id === id);
    if (!vente) return;
    const upd = { retournee: true, benefice: -Math.abs(vente.depenses), ca: 0 };
    try {
      const { error } = await createClient().from("ventes").update(upd).eq("id", id);
      if (error) throw error;
      setVentes(prev => prev.map(v => v.id === id ? { ...v, ...upd } : v));
    } catch (e) {
      console.error("[DataContext] marquerRetournee erreur:", e);
    }
  }, [ventes]);

  const repartirPubJour = useCallback(async (budgetTotal: number) => {
    const today = new Date().toDateString();
    const cibles = ventes.filter(v =>
      new Date(v.date).toDateString() === today && v.budget_pub_provisoire && !v.retournee
    );
    if (!cibles.length) return;
    const part = budgetTotal / cibles.length;
    const supabase = createClient();
    await Promise.all(cibles.map(v =>
      supabase.from("ventes").update({
        depenses: v.depenses + part,
        benefice: v.benefice - part,
        budget_pub_provisoire: false,
      }).eq("id", v.id)
    ));
    setVentes(prev => prev.map(v => {
      if (!cibles.find(c => c.id === v.id)) return v;
      return { ...v, depenses: v.depenses + part, benefice: v.benefice - part, budget_pub_provisoire: false };
    }));
  }, [ventes]);

  const addProduit = useCallback(async (p: Omit<Produit, "id" | "created_at" | "user_id">): Promise<boolean> => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      const insertData: Record<string, unknown> = {
        user_id: user.id, nom: p.nom, prix_revient: p.prix_revient,
        prix_vente: p.prix_vente, commission: p.commission,
      };
      if (p.frais_transport !== undefined) insertData.frais_transport = p.frais_transport;
      if (p.nb_articles !== undefined) insertData.nb_articles = p.nb_articles;
      const { data, error } = await supabase.from("produits").insert(insertData).select().single();
      if (error) {
        console.error("[DataContext] addProduit erreur Supabase:", error);
        return false;
      }
      if (data) {
        const np = mapProduit(data as Record<string, unknown>);
        setProduits(prev => [...prev, np].sort((a, b) => a.nom.localeCompare(b.nom)));
        return true;
      }
      return false;
    } catch (e) {
      console.error("[DataContext] addProduit erreur:", e);
      return false;
    }
  }, []);

  const updateProduit = useCallback(async (id: string, p: Partial<Omit<Produit, "id" | "user_id">>): Promise<boolean> => {
    try {
      const { error } = await createClient().from("produits").update(p).eq("id", id);
      if (error) {
        console.error("[DataContext] updateProduit erreur:", error);
        return false;
      }
      setProduits(prev => prev.map(pr => pr.id === id ? { ...pr, ...p } : pr));
      return true;
    } catch (e) {
      console.error("[DataContext] updateProduit erreur:", e);
      return false;
    }
  }, []);

  const deleteProduit = useCallback(async (id: string) => {
    try {
      const { error } = await createClient().from("produits").delete().eq("id", id);
      if (error) throw error;
      setProduits(prev => prev.filter(p => p.id !== id));
    } catch (e) {
      console.error("[DataContext] deleteProduit erreur:", e);
    }
  }, []);

  const createGoal = useCallback(async (goal: Omit<Goal, "id" | "user_id" | "created_at">): Promise<boolean> => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const existing = await supabase.from("goals").select("id").eq("user_id", user.id);
      if (existing.data && existing.data.length > 0) {
        await supabase.from("goals").delete().eq("user_id", user.id);
      }

      const { data, error } = await supabase
        .from("goals")
        .insert({ ...goal, user_id: user.id })
        .select()
        .single();

      if (error) {
        console.error("[DataContext] createGoal erreur:", error);
        return false;
      }

      if (data) {
        setActiveGoal(mapGoal(data as Record<string, unknown>));
      }
      return true;
    } catch (e) {
      console.error("[DataContext] createGoal erreur:", e);
      return false;
    }
  }, []);

  const updateGoal = useCallback(async (id: string, goal: Partial<Omit<Goal, "id" | "user_id" | "created_at">>): Promise<boolean> => {
    try {
      const { error } = await createClient().from("goals").update(goal).eq("id", id);
      if (error) {
        console.error("[DataContext] updateGoal erreur:", error);
        return false;
      }
      setActiveGoal(prev => prev ? { ...prev, ...goal } : null);
      return true;
    } catch (e) {
      console.error("[DataContext] updateGoal erreur:", e);
      return false;
    }
  }, []);

  const deleteGoal = useCallback(async (id: string) => {
    try {
      const { error } = await createClient().from("goals").delete().eq("id", id);
      if (error) throw error;
      setActiveGoal(null);
    } catch (e) {
      console.error("[DataContext] deleteGoal erreur:", e);
    }
  }, []);

  return (
    <DataContext.Provider value={{
      ventes, produits, loading,
      addVente, deleteVente, marquerRetournee, repartirPubJour,
      addProduit, updateProduit, deleteProduit,
      activeGoal, goalStats, createGoal, updateGoal, deleteGoal,
      showObjectifModal, setShowObjectifModal,
    }}>
      {children}
    </DataContext.Provider>
  );
}
