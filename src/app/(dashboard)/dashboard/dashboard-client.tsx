"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useDevise } from "@/context/DeviseContext";
import { useData } from "@/context/DataContext";
import OnboardingChecklist from "@/components/onboarding/OnboardingChecklist";

type Period = "jour" | "semaine" | "mois" | "tout";
type EvoFilter = "7" | "14" | "30";

const COULEURS_PRODUITS = [
  { border: "#3b82f6", bg: "rgba(59,130,246,0.15)" },
  { border: "#10b981", bg: "rgba(16,185,129,0.15)" },
  { border: "#8b5cf6", bg: "rgba(139,92,246,0.15)" },
  { border: "#f59e0b", bg: "rgba(245,158,11,0.15)" },
  { border: "#ef4444", bg: "rgba(239,68,68,0.15)" },
  { border: "#06b6d4", bg: "rgba(6,182,212,0.15)" },
  { border: "#ec4899", bg: "rgba(236,72,153,0.15)" },
  { border: "#22c55e", bg: "rgba(34,197,94,0.15)" },
];

function getLastNDays(n: number): string[] {
  const result: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    result.push(`${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return result;
}

const B_C = 2 * Math.PI * 68;
const CA_C = 2 * Math.PI * 52;
const V_C = 2 * Math.PI * 38;

function computeNiceAxis(maxVal: number): { niceMax: number; ticks: number[] } {
  if (maxVal <= 0) return { niceMax: 5000, ticks: [0, 1000, 2000, 3000, 4000, 5000] };
  const TICK_COUNT = 9;
  const roughStep = maxVal / TICK_COUNT;
  const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
  const norm = roughStep / magnitude;
  let niceStep: number;
  if (norm <= 1) niceStep = 1 * magnitude;
  else if (norm <= 2) niceStep = 2 * magnitude;
  else if (norm <= 2.5) niceStep = 2.5 * magnitude;
  else if (norm <= 5) niceStep = 5 * magnitude;
  else niceStep = 10 * magnitude;
  const niceMax = Math.ceil(maxVal / niceStep) * niceStep;
  const count = Math.round(niceMax / niceStep);
  const ticks: number[] = [];
  for (let i = 0; i <= count; i++) ticks.push(Math.round(niceStep * i));
  return { niceMax, ticks };
}

function smoothPath(points: { x: number; y: number }[], bottomY: number): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;
  const tension = 0.2;
  let d = `M${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(i - 1, 0)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(i + 2, points.length - 1)];
    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = Math.min(p1.y + (p2.y - p0.y) * tension, bottomY);
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = Math.min(p2.y - (p3.y - p1.y) * tension, bottomY);
    d += ` C${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
  }
  return d;
}

function ChartSVG({ 
  labels, 
  caData, 
  beneficeData, 
  multiProduitData,
  deviseActuelle,
  convertir
}: { 
  labels: string[]; 
  caData: number[]; 
  beneficeData: number[];
  multiProduitData?: { produit: string; color: { border: string; bg: string }; data: number[] }[] | null;
  deviseActuelle: string;
  convertir: (n: number) => number;
}) {
  const [hoveredPoint, setHoveredPoint] = useState<{ 
    idx: number; 
    x: number; 
    y: number; 
    ca: number; 
    benef: number; 
    label: string;
    produit?: string;
    isMulti?: boolean;
  } | null>(null);

  const W = 520, H = 270;
  const pL = 44, pR = 12, pT = 16, pB = 30;
  const cW = W - pL - pR;
  const cH = H - pT - pB;
  const n = labels.length;
  const xStep = n > 1 ? cW / (n - 1) : 0;
  const bottomY = pT + cH;

  const isMulti = multiProduitData && multiProduitData.length > 1;
  
  const allVals = isMulti 
    ? multiProduitData.flatMap(p => p.data).filter(v => v > 0)
    : [...caData, ...beneficeData].filter((v) => v > 0);
  const dataMax = allVals.length > 0 ? Math.max(...allVals) : 1;
  const { niceMax, ticks } = computeNiceAxis(dataMax);

  const caPoints = caData.map((v, i) => ({ x: pL + i * xStep, y: pT + cH - (v / niceMax) * cH }));
  const benPoints = beneficeData.map((v, i) => ({ x: pL + i * xStep, y: pT + cH - (v / niceMax) * cH }));

  const caSmooth = smoothPath(caPoints, bottomY);
  const benSmooth = smoothPath(benPoints, bottomY);
  const caArea = n > 1 ? `${caSmooth} L${caPoints[n - 1].x.toFixed(1)},${bottomY} L${pL.toFixed(1)},${bottomY} Z` : "";
  const benArea = n > 1 ? `${benSmooth} L${benPoints[n - 1].x.toFixed(1)},${bottomY} L${pL.toFixed(1)},${bottomY} Z` : "";

  const multiProduitPoints = isMulti 
    ? multiProduitData.map(p => ({
        ...p,
        points: p.data.map((v, i) => ({ x: pL + i * xStep, y: pT + cH - (v / niceMax) * cH }))
      }))
    : null;

  const labelFreq = n <= 14 ? 1 : n <= 31 ? 2 : Math.ceil(n / 15);

  const fmtTooltip = (v: number) => {
    return Math.round(convertir(v)).toLocaleString("fr-FR") + " " + deviseActuelle;
  };

  const fmtTickConv = (v: number) => {
    return Math.round(convertir(v)).toLocaleString("fr-FR");
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
      <defs>
        <linearGradient id="evo-ca-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="evo-ben-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.38" />
          <stop offset="100%" stopColor="#0f766e" stopOpacity="0.04" />
        </linearGradient>
        {isMulti && multiProduitData.map((p, i) => (
          <linearGradient key={`grad-${i}`} id={`evo-prod-grad-${i}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={p.color.border} stopOpacity="0.25" />
            <stop offset="100%" stopColor={p.color.border} stopOpacity="0.02" />
          </linearGradient>
        ))}
      </defs>

      {ticks.map((tick, i) => {
        const y = pT + cH - (tick / niceMax) * cH;
        return (
          <g key={i}>
            <line x1={pL} y1={y} x2={W - pR} y2={y} stroke="var(--chart-grid-color)" strokeWidth="0.7" />
            <text x={pL - 6} y={y + 4} textAnchor="end" fontSize="9" fill="var(--chart-axis-color)" fontFamily="Inter, sans-serif">
              {fmtTickConv(tick)}
            </text>
          </g>
        );
      })}

      {caPoints.map((p, i) => (
        i % labelFreq === 0 ? (
          <line key={`vl-${i}`} x1={p.x} y1={pT} x2={p.x} y2={bottomY} stroke="var(--chart-grid-color)" strokeWidth="0.5" />
        ) : null
      ))}

      {isMulti ? (
        <>
          {multiProduitPoints!.map((p, pi) => {
            const pathSmooth = smoothPath(p.points, bottomY);
            const areaPath = n > 1 ? `${pathSmooth} L${p.points[n - 1].x.toFixed(1)},${bottomY} L${pL.toFixed(1)},${bottomY} Z` : "";
            return (
              <g key={`prod-${pi}`}>
                {areaPath && <path d={areaPath} fill={`url(#evo-prod-grad-${pi})`} />}
                <path d={pathSmooth} stroke={p.color.border} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                {p.points.map((pt, i) => (
                  <g key={`pt-${pi}-${i}`}>
                    <circle 
                      cx={pt.x} cy={pt.y} r="16" fill="transparent" 
                      style={{ cursor: "pointer" }}
                      onMouseEnter={() => setHoveredPoint({
                        idx: i, x: pt.x, y: pt.y - 10,
                        ca: p.data[i], benef: 0, label: labels[i],
                        produit: p.produit, isMulti: true
                      })}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                    <circle 
                      cx={pt.x} cy={pt.y} 
                      r={hoveredPoint?.idx === i && hoveredPoint?.produit === p.produit ? 6 : 4} 
                      fill={p.color.border} 
                      stroke="var(--dark-card)" 
                      strokeWidth="1.5"
                      style={{ transition: "r 0.15s ease" }}
                    />
                  </g>
                ))}
              </g>
            );
          })}
        </>
      ) : (
        <>
          {caArea && <path d={caArea} fill="url(#evo-ca-grad)" />}
          {benArea && <path d={benArea} fill="url(#evo-ben-grad)" />}
          {caSmooth && <path d={caSmooth} stroke="#3b82f6" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />}
          {benSmooth && <path d={benSmooth} stroke="#10b981" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />}
          
          {caPoints.map((p, i) => (
            <g key={`ca-hover-${i}`}>
              <circle 
                cx={p.x} cy={p.y} r="16" fill="transparent"
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setHoveredPoint({
                  idx: i, x: p.x, y: Math.min(p.y, benPoints[i].y) - 10,
                  ca: caData[i], benef: beneficeData[i], label: labels[i]
                })}
                onMouseLeave={() => setHoveredPoint(null)}
              />
              <circle 
                cx={p.x} cy={p.y} 
                r={hoveredPoint?.idx === i ? 6 : 4} 
                fill="#3b82f6" 
                stroke="var(--dark-card)" 
                strokeWidth="1.5"
                style={{ transition: "r 0.15s ease" }}
              />
            </g>
          ))}
          {benPoints.map((p, i) => (
            <circle 
              key={`bn-${i}`} 
              cx={p.x} cy={p.y} 
              r={hoveredPoint?.idx === i ? 5 : 3.5} 
              fill="#10b981" 
              stroke="var(--dark-card)" 
              strokeWidth="1.5"
              style={{ transition: "r 0.15s ease" }}
            />
          ))}
        </>
      )}

      {labels.map((label, i) => (
        i % labelFreq === 0 ? (
          <text key={`lbl-${i}`} x={pL + i * xStep} y={H - 6} textAnchor="middle" fontSize="8.5" fill="var(--chart-axis-color)" fontFamily="Inter, sans-serif">
            {label}
          </text>
        ) : null
      ))}

      {hoveredPoint && (
        <g>
          <rect
            x={Math.max(5, Math.min(hoveredPoint.x - 65, W - 135))} 
            y={Math.max(5, hoveredPoint.y - 60)}
            width={hoveredPoint.isMulti ? 110 : 130} 
            height={hoveredPoint.isMulti ? 42 : 52} 
            rx="8"
            fill="rgba(17,24,39,0.95)"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="1"
          />
          <text 
            x={Math.max(5, Math.min(hoveredPoint.x - 65, W - 135)) + (hoveredPoint.isMulti ? 55 : 65)} 
            y={Math.max(5, hoveredPoint.y - 60) + 16} 
            textAnchor="middle" 
            fontSize="10" 
            fill="#9ca3af" 
            fontWeight="600"
            fontFamily="Inter, sans-serif"
          >
            {hoveredPoint.label}
          </text>
          {hoveredPoint.isMulti ? (
            <>
              <text 
                x={Math.max(5, Math.min(hoveredPoint.x - 65, W - 135)) + 8} 
                y={Math.max(5, hoveredPoint.y - 60) + 34} 
                fontSize="10" 
                fill="white"
                fontWeight="600"
                fontFamily="Inter, sans-serif"
              >
                {hoveredPoint.produit}: {fmtTooltip(hoveredPoint.ca)}
              </text>
            </>
          ) : (
            <>
              <text 
                x={Math.max(5, Math.min(hoveredPoint.x - 65, W - 135)) + 8} 
                y={Math.max(5, hoveredPoint.y - 60) + 32} 
                fontSize="10" 
                fill="#3b82f6"
                fontWeight="600"
                fontFamily="Inter, sans-serif"
              >
                CA: {fmtTooltip(hoveredPoint.ca)}
              </text>
              <text 
                x={Math.max(5, Math.min(hoveredPoint.x - 65, W - 135)) + 8} 
                y={Math.max(5, hoveredPoint.y - 60) + 46} 
                fontSize="10" 
                fill="#10b981"
                fontWeight="600"
                fontFamily="Inter, sans-serif"
              >
                Benef: {fmtTooltip(hoveredPoint.benef)}
              </text>
            </>
          )}
        </g>
      )}
    </svg>
  );
}

type TopProduit = { nom: string; ca: number; benefice: number; count: number };

export default function DashboardClient() {
  const router = useRouter();
  const { deviseActuelle, convertir } = useDevise();
  const { ventes, loading, activeGoal, goalStats, setShowObjectifModal } = useData();
  const [period, setPeriod] = useState<Period>("mois");
  const [evoFilter, setEvoFilter] = useState<EvoFilter>("7");
  const [produitFilter, setProduitFilter] = useState<string>("");

  const fmtConv = (n: number) => Math.round(convertir(n)).toLocaleString("fr-FR") + " " + deviseActuelle;

  const activeVentes = useMemo(() => ventes.filter((v) => !v.retournee), [ventes]);

  const uniqueProduits = useMemo(() => {
    const set = new Set(activeVentes.map(v => v.produit).filter(p => p && p.trim()));
    return Array.from(set).sort();
  }, [activeVentes]);

  const filtered = useMemo(() => {
    const n = new Date();
    return activeVentes.filter((v) => {
      const d = new Date(v.date);
      if (period === "jour") return d.toDateString() === n.toDateString();
      if (period === "semaine") { const diff = (n.getTime() - d.getTime()) / (1000 * 60 * 60 * 24); return diff <= 7; }
      if (period === "mois") return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
      return true;
    });
  }, [activeVentes, period]);

  const kpis = useMemo(() => {
    if (activeVentes.length === 0) {
      return { ca: 127500, benefice: 38200, marge: 30, nb: 12, isExample: true };
    }
    const ca = filtered.reduce((s, v) => s + v.ca, 0);
    const benefice = filtered.reduce((s, v) => s + v.benefice, 0);
    const marge = ca > 0 ? (benefice / ca) * 100 : 0;
    return { ca, benefice, marge, nb: filtered.length, isExample: false };
  }, [filtered, activeVentes.length]);

  const totals = useMemo(() => {
    if (activeVentes.length === 0) {
      return { ca: 425000, benefice: 127500, isExample: true };
    }
    const ca = activeVentes.reduce((s, v) => s + v.ca, 0);
    const benefice = activeVentes.reduce((s, v) => s + v.benefice, 0);
    return { ca, benefice, isExample: false };
  }, [activeVentes]);

  const recents = useMemo(() => ventes.slice(0, 5), [ventes]);

  const topProduit = useMemo((): TopProduit | null => {
    const map = new Map<string, { ca: number; benefice: number; count: number }>();
    activeVentes.forEach((v) => {
      const nom = v.produit?.trim() || "Sans nom";
      const ex = map.get(nom);
      if (ex) { ex.ca += v.ca; ex.benefice += v.benefice; ex.count += 1; }
      else map.set(nom, { ca: v.ca, benefice: v.benefice, count: 1 });
    });
    let best: TopProduit | null = null;
    map.forEach((val, nom) => { if (!best || val.benefice > best.benefice) best = { nom, ...val }; });
    return best;
  }, [activeVentes]);

  const retourStats = useMemo(() => {
    const retours = ventes.filter((v) => v.retournee).length;
    const total = ventes.length;
    return { retours, total, taux: total > 0 ? (retours / total) * 100 : 0 };
  }, [ventes]);

  const chartLabels = useMemo(() => {
    return getLastNDays(parseInt(evoFilter));
  }, [evoFilter]);

  const chartData = useMemo(() => {
    return chartLabels.map((label) => {
      const [dd, mm] = label.split("/");
      const day = activeVentes.filter((v) => {
        const d = new Date(v.date);
        const matchDate = String(d.getDate()).padStart(2, "0") === dd && String(d.getMonth() + 1).padStart(2, "0") === mm;
        const matchProduit = !produitFilter || v.produit === produitFilter;
        return matchDate && matchProduit;
      });
      return { label, ca: day.reduce((s, v) => s + v.ca, 0), benefice: day.reduce((s, v) => s + v.benefice, 0) };
    });
  }, [activeVentes, chartLabels, produitFilter]);

  const chartDataByProduit = useMemo(() => {
    if (produitFilter || uniqueProduits.length <= 1) return null;
    return uniqueProduits.map((produit, idx) => ({
      produit,
      color: COULEURS_PRODUITS[idx % COULEURS_PRODUITS.length],
      data: chartLabels.map(label => {
        const [dd, mm] = label.split("/");
        const day = activeVentes.filter(v => {
          const d = new Date(v.date);
          return v.produit === produit
            && String(d.getDate()).padStart(2, "0") === dd
            && String(d.getMonth() + 1).padStart(2, "0") === mm;
        });
        return day.reduce((s, v) => s + v.ca, 0);
      })
    }));
  }, [produitFilter, uniqueProduits, chartLabels, activeVentes]);

  const evoTotals = useMemo(() => {
    const totalCa = chartData.reduce((s, d) => s + d.ca, 0);
    const totalBenef = chartData.reduce((s, d) => s + d.benefice, 0);
    const days = chartData.length || 1;
    return { totalCa, totalBenef, moyCa: totalCa / days, moyBenef: totalBenef / days };
  }, [chartData]);

  const rings = useMemo(() => {
    const benefRing = totals.benefice > 0 ? Math.min((kpis.benefice / totals.benefice) * 100, 100) : 0;
    const caRing = totals.ca > 0 ? Math.min((kpis.ca / totals.ca) * 100, 100) : 0;
    const venteRing = activeVentes.length > 0 ? Math.min((kpis.nb / activeVentes.length) * 100, 100) : 0;
    return { benefRing, caRing, venteRing, avg: (benefRing + caRing + venteRing) / 3 };
  }, [kpis, totals, activeVentes]);

  const profilePct = useMemo(() => {
    let score = 20;
    if (ventes.length > 0) score += 30;
    if (ventes.length >= 5) score += 20;
    if (topProduit && topProduit.nom !== "Sans nom") score += 15;
    if (totals.ca > 0) score += 15;
    return Math.min(score, 100);
  }, [ventes, topProduit, totals]);

  function fmtDate(dateStr: string) {
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  }

  return (
    <div className="main-content">
      <div className="container">

        {/* CHECKLIST DE DEMARRAGE */}
        <OnboardingChecklist />

        {/* BANDEAU EXEMPLE SI PAS DE VENTES */}
        {!loading && ventes.length === 0 && (
          <div style={{
            background: "linear-gradient(135deg, rgba(245,158,11,0.15), rgba(217,119,6,0.1))",
            border: "1px solid rgba(245,158,11,0.3)",
            borderRadius: "16px",
            padding: "16px",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            flexWrap: "wrap",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "rgba(245,158,11,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <i className="fas fa-lightbulb" style={{ color: "#f59e0b", fontSize: "16px" }}></i>
              </div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
                  Ces chiffres sont des exemples
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  Enregistrez votre premiere vente pour voir vos vrais resultats.
                </div>
              </div>
            </div>
            <button
              onClick={() => router.push("/dashboard/calcul")}
              style={{
                padding: "10px 16px",
                borderRadius: "10px",
                border: "none",
                background: "linear-gradient(135deg, #f59e0b, #d97706)",
                color: "white",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "var(--font-inter), sans-serif",
                whiteSpace: "nowrap",
              }}
            >
              <i className="fas fa-plus" style={{ marginRight: "8px" }}></i>
              Enregistrer ma premiere vente
            </button>
          </div>
        )}

        {/* 1. RECAPITULATIF */}
        <div className="card">
          <div className="section-title" style={{ marginBottom: "18px" }}>
            <i className="fas fa-chart-bar"></i>
            Récapitulatif (tout temps)
            {totals.isExample && (
              <span style={{
                marginLeft: "auto",
                fontSize: "10px",
                fontWeight: 700,
                color: "#f59e0b",
                background: "rgba(245,158,11,0.15)",
                padding: "4px 8px",
                borderRadius: "6px",
                textTransform: "uppercase",
              }}>
                Exemple
              </span>
            )}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
            <div style={{ textAlign: "center", padding: "8px" }}>
              <div style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", fontWeight: 600, marginBottom: "10px" }}>Chiffre d&apos;Affaires</div>
              <div style={{ fontSize: "24px", fontWeight: 900, color: "var(--accent-blue)" }}>{loading ? "…" : fmtConv(totals.ca)}</div>
            </div>
            <div style={{ textAlign: "center", padding: "8px", borderLeft: "1px solid var(--diamond-border)" }}>
              <div style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", fontWeight: 600, marginBottom: "10px" }}>Bénéfice Net</div>
              <div style={{ fontSize: "24px", fontWeight: 900, color: totals.benefice >= 0 ? "var(--accent-green)" : "var(--accent-red)" }}>{loading ? "…" : fmtConv(totals.benefice)}</div>
            </div>
          </div>
        </div>

        {/* OBJECTIF DU JOUR */}
        {activeGoal && goalStats && (
          <div className="card" style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.1), rgba(59,130,246,0.05))", border: "1px solid rgba(139,92,246,0.2)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <i className="fas fa-bullseye" style={{ fontSize: "16px", color: "white" }}></i>
                </div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>Objectif du Jour</div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    {goalStats.daysRemaining} jour{goalStats.daysRemaining > 1 ? "s" : ""} restant{goalStats.daysRemaining > 1 ? "s" : ""}
                  </div>
                </div>
              </div>
              <div style={{ 
                fontSize: "20px", 
                fontWeight: 900, 
                color: goalStats.todayPercent >= 100 ? "#10b981" : goalStats.todayPercent >= 50 ? "#f59e0b" : "#8b5cf6" 
              }}>
                {goalStats.todayPercent.toFixed(0)}%
              </div>
            </div>
            
            <div style={{ 
              height: "10px", 
              background: "rgba(139,92,246,0.15)", 
              borderRadius: "5px", 
              overflow: "hidden",
              marginBottom: "12px",
            }}>
              <div style={{
                height: "100%",
                width: `${Math.min(100, goalStats.todayPercent)}%`,
                background: goalStats.todayPercent >= 100 
                  ? "linear-gradient(90deg, #10b981, #34d399)" 
                  : "linear-gradient(90deg, #8b5cf6, #a78bfa)",
                borderRadius: "5px",
                transition: "width 0.5s ease",
              }} />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                {activeGoal.type === "products_sold" 
                  ? `${goalStats.todayProgress} / ${Math.ceil(goalStats.dailyTarget)} ventes`
                  : `${Math.round(goalStats.todayProgress).toLocaleString("fr-FR")} / ${Math.round(goalStats.dailyTarget).toLocaleString("fr-FR")} ${deviseActuelle}`
                }
              </span>
              {goalStats.todayPercent >= 100 && (
                <span style={{ fontSize: "12px", color: "#10b981", fontWeight: 700 }}>
                  <i className="fas fa-check-circle" style={{ marginRight: "4px" }}></i>
                  Atteint !
                </span>
              )}
            </div>
          </div>
        )}

        {/* 2. PERIOD SELECTOR */}
        <div className="period-selector">
          {([
            { id: "jour", label: "Aujourd'hui" },
            { id: "semaine", label: "7 jours" },
            { id: "mois", label: "Ce mois" },
            { id: "tout", label: "Tout" },
          ] as { id: Period; label: string }[]).map((p) => (
            <button key={p.id} className={`period-btn${period === p.id ? " active" : ""}`} onClick={() => setPeriod(p.id)}>{p.label}</button>
          ))}
        </div>

        {/* 3. BENTO GRID KPIs */}
        <div className="bento-grid">
          <div className="bento-item">
            <div className="bento-item-icon" style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.3), rgba(37,99,235,0.2))" }}>
              <i className="fas fa-chart-line" style={{ color: "#60a5fa" }}></i>
            </div>
            <div className="bento-item-title">Chiffre d&apos;Affaires</div>
            <div className="bento-item-value" style={{ color: "var(--accent-blue)" }}>{loading ? "…" : fmtConv(kpis.ca)}</div>
          </div>
          <div className="bento-item">
            <div className="bento-item-icon" style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.3), rgba(5,150,105,0.2))" }}>
              <i className="fas fa-coins" style={{ color: "#34d399" }}></i>
            </div>
            <div className="bento-item-title">Bénéfice Net</div>
            <div className="bento-item-value" style={{ color: kpis.benefice >= 0 ? "var(--accent-green)" : "var(--accent-red)" }}>{loading ? "…" : fmtConv(kpis.benefice)}</div>
          </div>
          <div className="bento-item">
            <div className="bento-item-icon" style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.3), rgba(217,119,6,0.2))" }}>
              <i className="fas fa-percent" style={{ color: "#fbbf24" }}></i>
            </div>
            <div className="bento-item-title">Marge Moyenne</div>
            <div className="bento-item-value" style={{ color: kpis.marge >= 20 ? "var(--accent-green)" : kpis.marge > 0 ? "#f59e0b" : "var(--accent-red)" }}>{loading ? "…" : kpis.marge.toFixed(1) + "%"}</div>
          </div>
          <div className="bento-item">
            <div className="bento-item-icon" style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.3), rgba(109,40,217,0.2))" }}>
              <i className="fas fa-shopping-bag" style={{ color: "#a78bfa" }}></i>
            </div>
            <div className="bento-item-title">Ventes</div>
            <div className="bento-item-value" style={{ color: "var(--accent-purple)" }}>{loading ? "…" : kpis.nb}</div>
          </div>
        </div>

        {/* 4. JAUGES PERFORMANCE */}
        <div className="card">
          <div className="section-title" style={{ marginBottom: "18px" }}>
            <i className="fas fa-bullseye"></i>
            Performance sur la période
          </div>
          <div className="activity-ring-container">
            <svg className="activity-ring" width="160" height="160" viewBox="0 0 160 160">
              <circle className="activity-ring-bg" cx="80" cy="80" r="68" strokeWidth="10" fill="none" />
              <circle className="activity-ring-progress ring-benefice" cx="80" cy="80" r="68" strokeWidth="10" fill="none" strokeDasharray={B_C} strokeDashoffset={B_C - (B_C * rings.benefRing / 100)} transform="rotate(-90 80 80)" style={{ transition: "stroke-dashoffset 1s ease" }} />
            </svg>
            <svg className="activity-ring" width="130" height="130" viewBox="0 0 130 130">
              <circle className="activity-ring-bg" cx="65" cy="65" r="52" strokeWidth="10" fill="none" />
              <circle className="activity-ring-progress ring-ca" cx="65" cy="65" r="52" strokeWidth="10" fill="none" strokeDasharray={CA_C} strokeDashoffset={CA_C - (CA_C * rings.caRing / 100)} transform="rotate(-90 65 65)" style={{ transition: "stroke-dashoffset 1s ease" }} />
            </svg>
            <svg className="activity-ring" width="100" height="100" viewBox="0 0 100 100">
              <circle className="activity-ring-bg" cx="50" cy="50" r="38" strokeWidth="10" fill="none" />
              <circle className="activity-ring-progress ring-ventes" cx="50" cy="50" r="38" strokeWidth="10" fill="none" strokeDasharray={V_C} strokeDashoffset={V_C - (V_C * rings.venteRing / 100)} transform="rotate(-90 50 50)" style={{ transition: "stroke-dashoffset 1s ease" }} />
            </svg>
            <div className="activity-ring-center">
              <div className="activity-ring-value">{rings.avg.toFixed(0)}%</div>
              <div className="activity-ring-label">PÉRIODE</div>
            </div>
          </div>
          <div className="activity-legend">
            <div className="legend-item"><div className="legend-dot" style={{ background: "var(--accent-green)" }}></div><span>Bénéfice</span></div>
            <div className="legend-item"><div className="legend-dot" style={{ background: "var(--accent-blue)" }}></div><span>CA</span></div>
            <div className="legend-item"><div className="legend-dot" style={{ background: "var(--accent-purple)" }}></div><span>Ventes</span></div>
          </div>
        </div>

        {/* 5. VENTES RECENTES */}
        <div className="section-title" style={{ justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <i className="fas fa-clock-rotate-left"></i>
            Ventes Récentes
          </div>
          <span style={{ fontSize: "13px", color: "var(--accent-blue)", cursor: "pointer", fontWeight: 600 }} onClick={() => router.push("/dashboard/commandes")}>
            Voir tout
          </span>
        </div>
        <div className="card">
          {loading ? (
            <div style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)" }}>Chargement…</div>
          ) : recents.length === 0 ? (
            <div>
              <div style={{ textAlign: "center", padding: "20px 0 16px" }}>
                <i className="fas fa-cart-shopping" style={{ fontSize: "44px", color: "var(--text-muted)", opacity: 0.3, display: "block", marginBottom: "14px" }}></i>
                <div style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "4px" }}>Aucune vente enregistrée.</div>
                <div style={{ fontSize: "13px", color: "var(--text-muted)", opacity: 0.7, marginBottom: "22px" }}>Commencez par ajouter votre première vente !</div>
              </div>
              <button className="btn btn-primary" onClick={() => router.push("/dashboard/calcul")}><i className="fas fa-plus"></i>Ajouter une vente</button>
            </div>
          ) : (
            <div>
              {recents.map((v) => (
                <div key={v.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid var(--diamond-border)" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {v.nom_client || "Client anonyme"}{v.produit ? ` — ${v.produit}` : ""}
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "3px" }}>
                      {fmtDate(v.date)} · {v.nb_pieces} pièce(s){v.retournee ? " · Retournée" : ""}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0, marginLeft: "12px" }}>
                    <div style={{ fontSize: "14px", fontWeight: 800, color: v.benefice >= 0 ? "var(--accent-green)" : "var(--accent-red)" }}>{v.benefice >= 0 ? "+" : ""}{fmtConv(v.benefice)}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>CA : {fmtConv(v.ca)}</div>
                  </div>
                </div>
              ))}
              {ventes.length >= 5 && (
                <button onClick={() => router.push("/dashboard/commandes")} style={{ width: "100%", marginTop: "12px", padding: "10px", background: "var(--dark-elevated)", border: "1px solid var(--diamond-border)", borderRadius: "10px", color: "var(--accent-blue)", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-inter), sans-serif" }}>
                  Voir toutes les commandes
                </button>
              )}
            </div>
          )}
        </div>

        {/* OBJECTIF GENERAL */}
        {activeGoal && goalStats && (
          <div className="card" style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.08), rgba(16,185,129,0.03))", border: "1px solid rgba(16,185,129,0.2)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <i className="fas fa-chart-pie" style={{ fontSize: "18px", color: "white" }}></i>
                </div>
                <div>
                  <div style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>Objectif General</div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    {activeGoal.type === "net_profit" ? "Benefice Net" : activeGoal.type === "revenue" ? "Chiffre d'Affaires" : "Nombre de Ventes"}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowObjectifModal(true)}
                style={{
                  background: "none",
                  border: "1px solid var(--diamond-border)",
                  borderRadius: "8px",
                  padding: "6px 10px",
                  color: "var(--text-muted)",
                  fontSize: "12px",
                  cursor: "pointer",
                  fontFamily: "var(--font-inter), sans-serif",
                }}
              >
                <i className="fas fa-pen" style={{ marginRight: "4px" }}></i>
                Modifier
              </button>
            </div>

            <div style={{ textAlign: "center", marginBottom: "16px" }}>
              <div style={{ 
                fontSize: "32px", 
                fontWeight: 900, 
                color: goalStats.progressPercent >= 100 ? "#10b981" : goalStats.progressPercent >= 70 ? "#f59e0b" : "#ef4444",
                marginBottom: "4px",
              }}>
                {goalStats.progressPercent.toFixed(0)}%
              </div>
              <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                {activeGoal.type === "products_sold"
                  ? `${Math.round(goalStats.currentProgress)} / ${activeGoal.target_value} ventes`
                  : `${Math.round(goalStats.currentProgress).toLocaleString("fr-FR")} / ${activeGoal.target_value.toLocaleString("fr-FR")} ${deviseActuelle}`
                }
              </div>
            </div>

            <div style={{ 
              height: "14px", 
              background: "rgba(16,185,129,0.15)", 
              borderRadius: "7px", 
              overflow: "hidden",
              marginBottom: "14px",
            }}>
              <div style={{
                height: "100%",
                width: `${Math.min(100, goalStats.progressPercent)}%`,
                background: goalStats.progressPercent >= 100 
                  ? "linear-gradient(90deg, #10b981, #34d399)" 
                  : goalStats.progressPercent >= 70 
                    ? "linear-gradient(90deg, #f59e0b, #fbbf24)"
                    : "linear-gradient(90deg, #ef4444, #f87171)",
                borderRadius: "7px",
                transition: "width 0.5s ease",
              }} />
            </div>

            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              fontSize: "12px",
              color: "var(--text-muted)",
              background: "rgba(0,0,0,0.2)",
              borderRadius: "8px",
              padding: "10px 12px",
            }}>
              <span>
                <i className="fas fa-calendar" style={{ marginRight: "6px", opacity: 0.7 }}></i>
                Du {new Date(activeGoal.start_date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })} au {new Date(activeGoal.end_date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
              </span>
              <span style={{ fontWeight: 700, color: goalStats.daysRemaining <= 3 ? "#ef4444" : "var(--text-secondary)" }}>
                {goalStats.daysRemaining} jour{goalStats.daysRemaining > 1 ? "s" : ""} restant{goalStats.daysRemaining > 1 ? "s" : ""}
              </span>
            </div>

            {goalStats.progressPercent >= 100 && (
              <div style={{
                marginTop: "12px",
                textAlign: "center",
                padding: "10px",
                background: "rgba(16,185,129,0.15)",
                borderRadius: "10px",
                border: "1px solid rgba(16,185,129,0.3)",
              }}>
                <i className="fas fa-trophy" style={{ color: "#f59e0b", marginRight: "8px" }}></i>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#10b981" }}>
                  Objectif atteint ! Felicitations !
                </span>
              </div>
            )}
          </div>
        )}

        {/* 6. PRODUIT LE PLUS RENTABLE */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "14px" }}>
            <i className="fas fa-trophy" style={{ fontSize: "22px", color: "#f59e0b" }}></i>
            <span style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>Produit le Plus Rentable</span>
          </div>
          {topProduit ? (
            <div>
              <div style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "12px" }}>{topProduit.nom}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                <div style={{ background: "var(--dark-elevated)", borderRadius: "10px", padding: "10px", textAlign: "center" }}>
                  <div style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 600, marginBottom: "4px" }}>VENTES</div>
                  <div style={{ fontSize: "16px", fontWeight: 800, color: "var(--accent-purple)" }}>{topProduit.count}</div>
                </div>
                <div style={{ background: "var(--dark-elevated)", borderRadius: "10px", padding: "10px", textAlign: "center" }}>
                  <div style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 600, marginBottom: "4px" }}>CA</div>
                  <div style={{ fontSize: "16px", fontWeight: 800, color: "var(--accent-blue)" }}>{fmtConv(topProduit.ca)}</div>
                </div>
                <div style={{ background: "var(--dark-elevated)", borderRadius: "10px", padding: "10px", textAlign: "center" }}>
                  <div style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 600, marginBottom: "4px" }}>BÉNÉF.</div>
                  <div style={{ fontSize: "16px", fontWeight: 800, color: "var(--accent-green)" }}>{fmtConv(topProduit.benefice)}</div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>Enregistrez des ventes pour voir votre produit star</div>
          )}
        </div>

        {/* 7. TAUX DE RETOUR */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "14px" }}>
            <i className="fas fa-box" style={{ fontSize: "20px", color: "var(--accent-purple)" }}></i>
            <span style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>Taux de Retour</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>{retourStats.retours} retour(s) sur {retourStats.total} vente(s)</span>
            <span style={{ fontSize: "22px", fontWeight: 900, color: retourStats.taux === 0 ? "var(--accent-green)" : retourStats.taux < 10 ? "#f59e0b" : "var(--accent-red)" }}>
              {retourStats.taux.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* 8. EVOLUTION */}
        <div className="card" style={{ overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <i className="fas fa-chart-line" style={{ color: "var(--accent-blue)", fontSize: "18px" }}></i>
              <span style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)" }}>Evolution</span>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <div style={{ 
                display: "flex", 
                background: "var(--dark-elevated)", 
                borderRadius: "12px", 
                padding: "4px",
                gap: "2px"
              }}>
                {(["7", "14", "30"] as EvoFilter[]).map((val) => (
                  <button
                    key={val}
                    onClick={() => setEvoFilter(val)}
                    style={{
                      padding: "8px 14px",
                      borderRadius: "8px",
                      border: "none",
                      background: evoFilter === val ? "var(--dark-card)" : "transparent",
                      color: evoFilter === val ? "var(--text-primary)" : "var(--text-muted)",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "var(--font-inter), sans-serif",
                      transition: "all 0.2s",
                    }}
                  >
                    {val} jours
                  </button>
                ))}
              </div>
              <div style={{ 
                display: "flex", 
                background: "var(--dark-elevated)", 
                borderRadius: "12px", 
                padding: "4px",
                gap: "2px"
              }}>
                <button
                  onClick={() => setProduitFilter("")}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "8px",
                    border: "none",
                    background: produitFilter === "" ? "var(--dark-card)" : "transparent",
                    color: produitFilter === "" ? "var(--text-primary)" : "var(--text-muted)",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "var(--font-inter), sans-serif",
                    transition: "all 0.2s",
                  }}
                >
                  Tous
                </button>
                {uniqueProduits.length > 0 && uniqueProduits.map((p) => (
                  <button
                    key={p}
                    onClick={() => setProduitFilter(p)}
                    style={{
                      padding: "8px 14px",
                      borderRadius: "8px",
                      border: "none",
                      background: produitFilter === p ? "var(--dark-card)" : "transparent",
                      color: produitFilter === p ? "var(--text-primary)" : "var(--text-muted)",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "var(--font-inter), sans-serif",
                      transition: "all 0.2s",
                      maxWidth: "100px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{
            background: "var(--dark-elevated)",
            borderRadius: "14px",
            padding: "14px 16px",
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "8px",
            marginBottom: "20px",
          }}>
            {[
              { label: "TOTAL CA", value: fmtConv(evoTotals.totalCa), color: "var(--accent-blue)" },
              { label: "TOTAL BENEF", value: fmtConv(evoTotals.totalBenef), color: "var(--accent-green)" },
              { label: "MOY CA/J", value: fmtConv(evoTotals.moyCa), color: "var(--accent-blue)" },
              { label: "MOY BENEF/J", value: fmtConv(evoTotals.moyBenef), color: "var(--accent-green)" },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "9px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.6px", fontWeight: 700, marginBottom: "7px" }}>{s.label}</div>
                <div style={{ fontSize: "14px", fontWeight: 900, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          <div style={{ margin: "0 -4px" }}>
            <ChartSVG
              labels={chartData.map((d) => d.label)}
              caData={chartData.map((d) => d.ca)}
              beneficeData={chartData.map((d) => d.benefice)}
              multiProduitData={chartDataByProduit}
              deviseActuelle={deviseActuelle}
              convertir={convertir}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: "18px", marginTop: "16px", flexWrap: "wrap" }}>
            {chartDataByProduit && chartDataByProduit.length > 1 ? (
              chartDataByProduit.map((p, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "var(--text-secondary)" }}>
                  <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: p.color.border, flexShrink: 0 }}></div>
                  {p.produit}
                </div>
              ))
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "var(--text-secondary)" }}>
                  <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#3b82f6", flexShrink: 0 }}></div>
                  CA (Chiffre d&apos;Affaires)
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "var(--text-secondary)" }}>
                  <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#10b981", flexShrink: 0 }}></div>
                  Benefice Net
                </div>
              </>
            )}
          </div>
        </div>

        {/* 9. ACTIVITE PROFIL */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
            <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "linear-gradient(135deg, #f59e0b, #d97706)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "22px", color: "white" }}>
              <i className="fas fa-user-pen"></i>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "4px" }}>Activité à {profilePct}%</div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "16px" }}>
                {profilePct < 50 ? "Ajoutez des ventes pour débloquer vos statistiques" : profilePct < 80 ? "Continuez à enregistrer vos ventes !" : "Excellent ! Vos statistiques sont bien remplies."}
              </div>
              <div style={{ background: "var(--dark-elevated)", borderRadius: "20px", height: "6px", overflow: "hidden" }}>
                <div style={{ width: `${profilePct}%`, height: "100%", background: "linear-gradient(90deg, #f59e0b, #d97706)", borderRadius: "20px", transition: "width 0.8s ease" }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* 10. QUICK ACTIONS */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
          <button className="btn" style={{ flex: 1, background: "linear-gradient(135deg, #4f46e5, #7c3aed, #9333ea)", color: "white", boxShadow: "0 4px 15px rgba(99,102,241,0.4)" }} onClick={() => router.push("/dashboard/calcul")}>
            <i className="fas fa-plus"></i>
            Nouvelle Vente
          </button>
          <button className="btn btn-success" style={{ flex: 1 }} onClick={() => router.push("/dashboard/commandes")}>
            <i className="fas fa-receipt"></i>
            Commandes
          </button>
        </div>

      </div>
    </div>
  );
}
