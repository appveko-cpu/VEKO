"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useData } from "@/context/DataContext";

type Theme = "dark" | "light" | "auto";

type LevelInfo = {
  label: string;
  color: string;
  textColor: string;
  gradient: string;
};

function getLevel(beneficeCumul: number): LevelInfo {
  if (beneficeCumul >= 10_000_000)
    return { label: "Diamant", color: "#60a5fa", textColor: "#60a5fa", gradient: "linear-gradient(135deg,#60a5fa,#a78bfa)" };
  if (beneficeCumul >= 5_000_000)
    return { label: "Platine", color: "#e2e8f0", textColor: "#e2e8f0", gradient: "linear-gradient(135deg,#e2e8f0,#94a3b8)" };
  if (beneficeCumul >= 1_000_000)
    return { label: "Or", color: "#f59e0b", textColor: "#f59e0b", gradient: "linear-gradient(135deg,#f59e0b,#d97706)" };
  if (beneficeCumul >= 500_000)
    return { label: "Argent", color: "#94a3b8", textColor: "#94a3b8", gradient: "linear-gradient(135deg,#94a3b8,#64748b)" };
  return { label: "Bronze", color: "#cd7c2f", textColor: "#cd7c2f", gradient: "linear-gradient(135deg,#cd7c2f,#92400e)" };
}

function getProgressPoints(nbVentes: number) {
  const pts = 10 + nbVentes * 10;
  const thresholds = [20, 50, 150, 300, 500];
  const next = thresholds.find((t) => t > pts) ?? 500;
  const prev = thresholds[thresholds.indexOf(next) - 1] ?? 10;
  const fill = Math.min(((pts - prev) / (next - prev)) * 100, 100);
  return { pts, next, fill };
}

function applyTheme(theme: Theme) {
  const html = document.documentElement;
  if (theme === "light") {
    html.setAttribute("data-theme", "light");
  } else if (theme === "dark") {
    html.removeAttribute("data-theme");
  } else {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (prefersDark) html.removeAttribute("data-theme");
    else html.setAttribute("data-theme", "light");
  }
  localStorage.setItem("veko-theme", theme);
}

export default function ProfileDropdown({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const { ventes } = useData();

  const [theme, setTheme] = useState<Theme>("auto");
  const [dataEco, setDataEco] = useState(false);
  const [username, setUsername] = useState("Mon Compte");
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState("Mon Compte");

  useEffect(() => {
    const userSet = localStorage.getItem("veko-theme-user-set");
    const saved = userSet
      ? ((localStorage.getItem("veko-theme") as Theme | null) ?? "auto")
      : "auto";
    setTheme(saved);
    applyTheme(saved);

    const name = localStorage.getItem("veko-username");
    if (name) { setUsername(name); setNameInput(name); }
    const eco = localStorage.getItem("veko-dataeco") === "1";
    setDataEco(eco);

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onOsChange = () => {
      const explicit = localStorage.getItem("veko-theme-user-set");
      const current = explicit
        ? ((localStorage.getItem("veko-theme") as Theme | null) ?? "auto")
        : "auto";
      if (current === "auto") applyTheme("auto");
    };
    mq.addEventListener("change", onOsChange);

    async function syncProfile() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", user.id)
          .single();
        if (data?.username) {
          setUsername(data.username);
          setNameInput(data.username);
          localStorage.setItem("veko-username", data.username);
        }
      } catch { }
    }
    syncProfile();

    return () => mq.removeEventListener("change", onOsChange);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  function handleTheme(t: Theme) {
    setTheme(t);
    applyTheme(t);
    localStorage.setItem("veko-theme-user-set", "1");
  }

  function saveName() {
    const trimmed = nameInput.trim() || "Mon Compte";
    setUsername(trimmed);
    setNameInput(trimmed);
    setEditing(false);
    localStorage.setItem("veko-username", trimmed);
    async function persist() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        await supabase
          .from("profiles")
          .update({ username: trimmed })
          .eq("id", user.id);
      } catch { }
    }
    persist();
  }

  function toggleDataEco() {
    const next = !dataEco;
    setDataEco(next);
    localStorage.setItem("veko-dataeco", next ? "1" : "0");
  }

  const beneficeCumul = useMemo(
    () => ventes.filter(v => !v.retournee).reduce((sum, v) => sum + v.benefice, 0),
    [ventes]
  );
  const nbVentesActives = useMemo(
    () => ventes.filter(v => !v.retournee).length,
    [ventes]
  );
  const level = getLevel(beneficeCumul);
  const { pts, next: ptsNext, fill: ptsFill } = getProgressPoints(nbVentesActives);

  if (!open) return null;

  return (
    <div
      ref={ref}
      style={{
        position: "fixed",
        top: "62px",
        right: "12px",
        width: "300px",
        background: "var(--dark-card)",
        border: "1px solid var(--diamond-border)",
        borderRadius: "20px",
        boxShadow: "0 24px 64px rgba(0,0,0,0.55)",
        zIndex: 9999,
        overflow: "hidden",
        animation: "dropdownFadeIn 0.18s ease",
      }}
    >
      <style>{`
        @keyframes dropdownFadeIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      {/* ── Header gradient ── */}
      <div
        style={{
          background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 60%, #9333ea 100%)",
          padding: "20px 20px 18px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "14px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.18)",
              border: "2px solid rgba(255,255,255,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "22px",
              color: "white",
              flexShrink: 0,
            }}
          >
            <i className="fas fa-user"></i>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            {editing ? (
              <input
                autoFocus
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onBlur={saveName}
                onKeyDown={(e) => e.key === "Enter" && saveName()}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  border: "1px solid rgba(255,255,255,0.4)",
                  borderRadius: "8px",
                  padding: "4px 10px",
                  color: "white",
                  fontSize: "15px",
                  fontWeight: 700,
                  width: "100%",
                  outline: "none",
                  fontFamily: "var(--font-inter), sans-serif",
                }}
              />
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span
                  style={{
                    fontSize: "16px",
                    fontWeight: 800,
                    color: "white",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {username}
                </span>
                <button
                  onClick={() => setEditing(true)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "rgba(255,255,255,0.6)",
                    padding: "2px 4px",
                    flexShrink: 0,
                  }}
                >
                  <i className="fas fa-pencil" style={{ fontSize: "11px" }}></i>
                </button>
              </div>
            )}
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.65)", marginTop: "3px" }}>
              Entrepreneur
            </div>
            <div
              style={{
                marginTop: "8px",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "rgba(255,255,255,0.15)",
                borderRadius: "20px",
                padding: "3px 10px",
              }}
            >
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: level.color,
                  flexShrink: 0,
                }}
              ></div>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "white" }}>
                Niveau {level.label}
              </span>
            </div>
          </div>
        </div>

        {/* Points VEKO */}
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "7px",
            }}
          >
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.85)", fontWeight: 700 }}>
              {pts} pts VEKO
            </span>
            <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)" }}>
              Prochain: {ptsNext} pts
            </span>
          </div>
          <div
            style={{
              height: "5px",
              borderRadius: "3px",
              background: "rgba(255,255,255,0.2)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${ptsFill}%`,
                height: "100%",
                borderRadius: "3px",
                background: "linear-gradient(90deg, #ec4899, #f97316)",
                transition: "width 0.4s ease",
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* ── Apparence ── */}
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid var(--diamond-border)",
        }}
      >
        <div
          style={{
            fontSize: "10px",
            fontWeight: 700,
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: "1.2px",
            marginBottom: "10px",
          }}
        >
          Apparence
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
          {(
            [
              { id: "light" as Theme, icon: "fa-sun", label: "Clair" },
              { id: "dark" as Theme, icon: "fa-moon", label: "Sombre" },
              { id: "auto" as Theme, icon: "fa-circle-half-stroke", label: "Auto" },
            ]
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => handleTheme(t.id)}
              style={{
                padding: "10px 6px",
                borderRadius: "10px",
                border: `1px solid ${theme === t.id ? "var(--accent-blue)" : "var(--diamond-border)"}`,
                background:
                  theme === t.id ? "rgba(59,130,246,0.15)" : "var(--dark-elevated)",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "5px",
                transition: "all 0.2s",
                fontFamily: "var(--font-inter), sans-serif",
              }}
            >
              <i
                className={`fas ${t.icon}`}
                style={{
                  fontSize: "15px",
                  color: theme === t.id ? "var(--accent-blue)" : "var(--text-muted)",
                }}
              ></i>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  color: theme === t.id ? "var(--text-primary)" : "var(--text-muted)",
                }}
              >
                {t.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Économie de données ── */}
      <div
        style={{
          padding: "14px 20px",
          borderBottom: "1px solid var(--diamond-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <i className="fas fa-wifi" style={{ color: "var(--text-muted)", fontSize: "15px" }}></i>
          <span style={{ fontSize: "14px", color: "var(--text-primary)", fontWeight: 600 }}>
            Économie de données
          </span>
        </div>
        <button
          onClick={toggleDataEco}
          style={{
            width: "44px",
            height: "24px",
            borderRadius: "12px",
            background: dataEco ? "var(--accent-green)" : "var(--dark-elevated)",
            border: `1px solid ${dataEco ? "var(--accent-green)" : "var(--diamond-border)"}`,
            cursor: "pointer",
            position: "relative",
            transition: "all 0.25s",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "3px",
              left: dataEco ? "22px" : "3px",
              width: "16px",
              height: "16px",
              borderRadius: "50%",
              background: "white",
              transition: "left 0.25s",
              boxShadow: "0 1px 4px rgba(0,0,0,0.35)",
            }}
          ></div>
        </button>
      </div>

      {/* ── Actions ── */}
      <div style={{ padding: "12px 20px 16px" }}>
        <button
          onClick={() => {
            router.push("/dashboard/parametres");
            onClose();
          }}
          style={{
            width: "100%",
            padding: "12px 16px",
            borderRadius: "12px",
            background: "var(--dark-elevated)",
            border: "1px solid var(--diamond-border)",
            color: "var(--text-primary)",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "8px",
            fontFamily: "var(--font-inter), sans-serif",
            transition: "all 0.2s",
          }}
        >
          <i className="fas fa-cog" style={{ color: "var(--text-muted)", fontSize: "15px" }}></i>
          Paramètres
        </button>
        <button
          onClick={async () => {
            await createClient().auth.signOut();
            window.location.href = "/login";
          }}
          style={{
            width: "100%",
            padding: "12px 16px",
            borderRadius: "12px",
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
            color: "#ef4444",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontFamily: "var(--font-inter), sans-serif",
            transition: "all 0.2s",
          }}
        >
          <i className="fas fa-right-from-bracket" style={{ fontSize: "15px" }}></i>
          Se déconnecter
        </button>
      </div>
    </div>
  );
}
