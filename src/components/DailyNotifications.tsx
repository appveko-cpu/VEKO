"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useData } from "@/context/DataContext";
import { useDevise } from "@/context/DeviseContext";

function fmt(n: number, d: string) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M " + d;
  if (n >= 1_000) return Math.round(n / 1_000) + "k " + d;
  return Math.round(n).toLocaleString("fr-FR") + " " + d;
}

function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function getHour() {
  return new Date().getHours();
}

function isSunday() {
  return new Date().getDay() === 0;
}

export function MorningBrief() {
  const [visible, setVisible] = useState(false);
  const { ventes } = useData();
  const { deviseActuelle } = useDevise();

  useEffect(() => {
    const h = getHour();
    if (h < 5 || h >= 11) return;
    const key = `veko_morning_brief_${getTodayKey()}`;
    if (localStorage.getItem(key)) return;
    const timer = setTimeout(() => {
      setVisible(true);
      localStorage.setItem(key, "1");
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const ventesHier = ventes.filter(v => {
    const d = new Date(v.date);
    return d.toDateString() === yesterday.toDateString() && !v.retournee;
  });
  const benefHier = ventesHier.reduce((s, v) => s + v.benefice, 0);
  const caHier = ventesHier.reduce((s, v) => s + v.ca, 0);

  if (!visible) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 10000,
      background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "flex-end",
    }}>
      <div style={{
        width: "100%", background: "var(--dark-card)",
        borderRadius: "24px 24px 0 0", padding: "28px 24px 40px",
        border: "1px solid var(--diamond-border)",
        animation: "slideUp 0.3s ease",
      }}>
        <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "linear-gradient(135deg, #f59e0b, #d97706)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>
            🌅
          </div>
          <div>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)" }}>Bonjour !</div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Votre brief matinal</div>
          </div>
        </div>

        {ventesHier.length > 0 ? (
          <div style={{ background: "var(--dark-elevated)", borderRadius: "16px", padding: "16px 20px", marginBottom: "16px" }}>
            <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "8px" }}>Résultats d&apos;hier</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 700 }}>VENTES</div>
                <div style={{ fontSize: "20px", fontWeight: 900, color: "var(--accent-purple)" }}>{ventesHier.length}</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 700 }}>CA</div>
                <div style={{ fontSize: "16px", fontWeight: 900, color: "var(--accent-blue)" }}>{fmt(caHier, deviseActuelle)}</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 700 }}>BÉNÉFICE</div>
                <div style={{ fontSize: "16px", fontWeight: 900, color: benefHier >= 0 ? "var(--accent-green)" : "var(--accent-red)" }}>{fmt(benefHier, deviseActuelle)}</div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ background: "var(--dark-elevated)", borderRadius: "16px", padding: "16px", marginBottom: "16px", fontSize: "14px", color: "var(--text-muted)", textAlign: "center" }}>
            Aucune vente hier. Bonne journée pour en créer !
          </div>
        )}

        <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "20px" }}>
          Chaque vente enregistrée vous rapproche de votre objectif. Allez-y !
        </p>

        <button onClick={() => setVisible(false)} style={{
          width: "100%", padding: "16px", borderRadius: "14px",
          background: "linear-gradient(135deg, #f59e0b, #d97706)",
          border: "none", color: "white", fontSize: "15px", fontWeight: 800,
          cursor: "pointer", fontFamily: "var(--font-inter), sans-serif",
        }}>
          C&apos;est parti ! 🚀
        </button>
      </div>
    </div>
  );
}

export function EveningRecall() {
  const [visible, setVisible] = useState(false);
  const { ventes } = useData();
  const router = useRouter();

  useEffect(() => {
    const h = getHour();
    if (h < 19 || h >= 23) return;
    const today = new Date().toDateString();
    const hasProvPubToday = ventes.some(v =>
      new Date(v.date).toDateString() === today && v.budget_pub_provisoire && !v.retournee
    );
    if (!hasProvPubToday) return;
    const key = `veko_evening_recall_${getTodayKey()}`;
    if (localStorage.getItem(key)) return;
    const timer = setTimeout(() => {
      setVisible(true);
      localStorage.setItem(key, "1");
    }, 2000);
    return () => clearTimeout(timer);
  }, [ventes]);

  if (!visible) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 10000,
      background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "flex-end",
    }}>
      <div style={{
        width: "100%", background: "var(--dark-card)",
        borderRadius: "24px 24px 0 0", padding: "28px 24px 40px",
        border: "1px solid var(--diamond-border)",
        animation: "slideUp 0.3s ease",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "linear-gradient(135deg, #f97316, #ef4444)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>
            📢
          </div>
          <div>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)" }}>Rappel pub !</div>
            <div style={{ fontSize: "12px", color: "#f97316" }}>Budget provisoire en attente</div>
          </div>
        </div>

        <div style={{ background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.3)", borderRadius: "14px", padding: "16px", marginBottom: "20px" }}>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
            Vous avez des ventes aujourd&apos;hui avec un budget pub <strong style={{ color: "#f97316" }}>provisoire</strong>.
            Rendez-vous dans l&apos;onglet Commandes pour renseigner votre vrai budget Meta Ads.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={() => setVisible(false)} style={{
            flex: 1, padding: "14px", borderRadius: "12px",
            background: "transparent", border: "1px solid var(--diamond-border)",
            color: "var(--text-muted)", fontSize: "14px", fontWeight: 700,
            cursor: "pointer", fontFamily: "var(--font-inter), sans-serif",
          }}>
            Plus tard
          </button>
          <button onClick={() => { setVisible(false); router.push("/dashboard/commandes"); }} style={{
            flex: 2, padding: "14px", borderRadius: "12px",
            background: "linear-gradient(135deg, #f97316, #ef4444)",
            border: "none", color: "white", fontSize: "14px", fontWeight: 800,
            cursor: "pointer", fontFamily: "var(--font-inter), sans-serif",
          }}>
            Voir les commandes
          </button>
        </div>
      </div>
    </div>
  );
}

export function DailyDigest() {
  const [visible, setVisible] = useState(false);
  const { ventes } = useData();
  const { deviseActuelle } = useDevise();

  useEffect(() => {
    const key = `veko_daily_digest_${getTodayKey()}`;
    if (localStorage.getItem(key)) return;
    if (ventes.length === 0) return;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const ventesHier = ventes.filter(v => new Date(v.date).toDateString() === yesterday.toDateString() && !v.retournee);
    if (ventesHier.length === 0) return;
    const timer = setTimeout(() => {
      setVisible(true);
      localStorage.setItem(key, "1");
    }, 3000);
    return () => clearTimeout(timer);
  }, [ventes]);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const ventesHier = ventes.filter(v => new Date(v.date).toDateString() === yesterday.toDateString() && !v.retournee);
  const benefHier = ventesHier.reduce((s, v) => s + v.benefice, 0);

  if (!visible) return null;

  return (
    <div style={{
      position: "fixed", top: "80px", left: "50%", transform: "translateX(-50%)",
      zIndex: 9998, width: "calc(100% - 32px)", maxWidth: "400px",
      background: benefHier >= 0 ? "linear-gradient(135deg, #10b981, #059669)" : "linear-gradient(135deg, #ef4444, #b91c1c)",
      borderRadius: "16px", padding: "14px 20px",
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: "14px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
      animation: "slideDown 0.3s ease",
    }}>
      <style>{`@keyframes slideDown { from { opacity:0; transform:translateX(-50%) translateY(-20px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }`}</style>
      <div>
        <div style={{ fontSize: "13px", fontWeight: 800, color: "white" }}>
          Hier : {fmt(benefHier, deviseActuelle)} {benefHier >= 0 ? "🎉" : "😔"}
        </div>
        <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.8)" }}>
          {ventesHier.length} vente(s) — {benefHier >= 0 ? "Belle journée !" : "Améliorez ça aujourd'hui"}
        </div>
      </div>
      <button onClick={() => setVisible(false)} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "8px", color: "white", cursor: "pointer", padding: "6px 10px", fontSize: "13px" }}>
        <i className="fas fa-xmark"></i>
      </button>
    </div>
  );
}

export function SundayStrategy() {
  const [visible, setVisible] = useState(false);
  const { ventes } = useData();
  const { deviseActuelle } = useDevise();

  useEffect(() => {
    if (!isSunday()) return;
    const key = `veko_sunday_strategy_${getTodayKey()}`;
    if (localStorage.getItem(key)) return;
    if (ventes.length === 0) return;
    const timer = setTimeout(() => {
      setVisible(true);
      localStorage.setItem(key, "1");
    }, 4000);
    return () => clearTimeout(timer);
  }, [ventes]);

  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - 7);
  const ventesSemaine = ventes.filter(v => {
    const d = new Date(v.date);
    return d >= startOfWeek && !v.retournee;
  });
  const benefSemaine = ventesSemaine.reduce((s, v) => s + v.benefice, 0);
  const caSemaine = ventesSemaine.reduce((s, v) => s + v.ca, 0);

  if (!visible) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 10000,
      background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "20px",
    }}>
      <div style={{
        width: "100%", maxWidth: "400px",
        background: "var(--dark-card)", borderRadius: "24px",
        padding: "28px 24px",
        border: "1px solid var(--diamond-border)",
        animation: "popIn 0.3s ease",
      }}>
        <style>{`@keyframes popIn { from { opacity:0; transform:scale(0.9); } to { opacity:1; transform:scale(1); } }`}</style>
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <div style={{ fontSize: "40px", marginBottom: "10px" }}>📊</div>
          <div style={{ fontSize: "20px", fontWeight: 900, color: "var(--text-primary)", marginBottom: "6px" }}>Bilan hebdomadaire</div>
          <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>Conseil stratégique du dimanche</div>
        </div>

        <div style={{ background: "var(--dark-elevated)", borderRadius: "16px", padding: "16px 20px", marginBottom: "20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", textAlign: "center" }}>
            <div>
              <div style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 700, marginBottom: "4px" }}>VENTES</div>
              <div style={{ fontSize: "22px", fontWeight: 900, color: "var(--accent-purple)" }}>{ventesSemaine.length}</div>
            </div>
            <div>
              <div style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 700, marginBottom: "4px" }}>CA</div>
              <div style={{ fontSize: "16px", fontWeight: 900, color: "var(--accent-blue)" }}>{fmt(caSemaine, deviseActuelle)}</div>
            </div>
            <div>
              <div style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 700, marginBottom: "4px" }}>BÉNÉFICE</div>
              <div style={{ fontSize: "16px", fontWeight: 900, color: benefSemaine >= 0 ? "var(--accent-green)" : "var(--accent-red)" }}>{fmt(benefSemaine, deviseActuelle)}</div>
            </div>
          </div>
        </div>

        <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "20px", textAlign: "center" }}>
          {ventesSemaine.length >= 7
            ? "🔥 Excellent rythme cette semaine ! Continuez à la même cadence."
            : ventesSemaine.length >= 3
            ? "💪 Bonne semaine. Essayez d'augmenter votre volume de ventes."
            : "📈 Planifiez vos ventes à l'avance pour améliorer vos résultats."}
        </p>

        <button onClick={() => setVisible(false)} style={{
          width: "100%", padding: "16px", borderRadius: "14px",
          background: "linear-gradient(135deg, #4f46e5, #8b5cf6)",
          border: "none", color: "white", fontSize: "15px", fontWeight: 800,
          cursor: "pointer", fontFamily: "var(--font-inter), sans-serif",
        }}>
          Compris, bonne semaine ! 💪
        </button>
      </div>
    </div>
  );
}
