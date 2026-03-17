"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

type Charge = {
  id: string;
  mois: string;
  nom: string;
  icone: string;
  categorie: "urgent" | "important";
  montant_total: number;
  montant_couvert: number;
  jour_echeance: number;
  est_paye: boolean;
  paye_le?: string | null;
  en_pause: boolean;
};

type UrgenceLevel = "urgent" | "important" | "ok" | "paye" | "pause";

const CATALOGUE: { categorie: "urgent" | "important"; icone: string; nom: string }[] = [
  { categorie: "urgent", icone: "🏠", nom: "Loyer boutique/maison" },
  { categorie: "urgent", icone: "⚡", nom: "Électricité" },
  { categorie: "urgent", icone: "💧", nom: "Eau" },
  { categorie: "urgent", icone: "💰", nom: "Remboursement crédit/tontine" },
  { categorie: "important", icone: "🛍️", nom: "Shopify" },
  { categorie: "important", icone: "🎨", nom: "Canva Pro" },
  { categorie: "important", icone: "🎬", nom: "CapCut Pro" },
  { categorie: "important", icone: "👤", nom: "Salaire employé" },
];

function getCurrentMois(): string {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}`;
}

function getPreviousMois(): string {
  const n = new Date();
  const prev = new Date(n.getFullYear(), n.getMonth() - 1, 1);
  return `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}`;
}

function getUrgence(charge: Charge): UrgenceLevel {
  if (charge.est_paye) return "paye";
  if (charge.en_pause) return "pause";
  const today = new Date().getDate();
  const diff = charge.jour_echeance - today;
  if (diff <= 7) return "urgent";
  if (diff <= 15) return "important";
  return "ok";
}

function formatDate(jour: number, mois: string): string {
  const [year, month] = mois.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1, jour);
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
}

function parseNum(s: string): number {
  const cleaned = s.replace(/\s/g, "").replace(",", ".");
  const v = parseFloat(cleaned);
  return isNaN(v) ? 0 : v;
}

const URGENCE_COLORS: Record<UrgenceLevel, { border: string; badge: string; bar: string; text: string }> = {
  urgent:    { border: "#ef4444", badge: "#ef4444", bar: "#ef4444", text: "#fca5a5" },
  important: { border: "#f97316", badge: "#f97316", bar: "#f97316", text: "#fdba74" },
  ok:        { border: "#3b82f6", badge: "#3b82f6", bar: "#3b82f6", text: "#93c5fd" },
  paye:      { border: "#10b981", badge: "#10b981", bar: "#10b981", text: "#6ee7b7" },
  pause:     { border: "#6b7280", badge: "#6b7280", bar: "#6b7280", text: "#9ca3af" },
};

export default function ChargesSection({
  deviseActuelle,
  convertir,
  beneficeMoisCourant,
}: {
  deviseActuelle: string;
  convertir: (n: number) => number;
  beneficeMoisCourant: number;
}) {
  const [charges, setCharges] = useState<Charge[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editCharge, setEditCharge] = useState<Charge | null>(null);
  const [slotIndex, setSlotIndex] = useState<number>(0);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [addFondsId, setAddFondsId] = useState<string | null>(null);
  const [addFondsVal, setAddFondsVal] = useState("");
  const [saving, setSaving] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const fmt = useCallback((n: number) =>
    Math.round(convertir(n)).toLocaleString("fr-FR") + " " + deviseActuelle,
  [convertir, deviseActuelle]);

  const loadCharges = useCallback(async (uid: string) => {
    const supabase = createClient();
    const { data } = await supabase
      .from("charges_mensuelles")
      .select("*")
      .eq("user_id", uid)
      .eq("mois", getCurrentMois())
      .order("created_at", { ascending: true })
      .limit(3);
    setCharges((data as Charge[]) ?? []);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then((res: { data: { user: { id: string } | null } }) => {
      if (!res.data.user) { setLoadingData(false); return; }
      setUserId(res.data.user.id);
      loadCharges(res.data.user.id).finally(() => setLoadingData(false));
    });
  }, [loadCharges]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function reconduireChargesmoisPrecedent() {
    if (!userId) return;
    const supabase = createClient();
    const prevMois = getPreviousMois();
    const { data: prev } = await supabase
      .from("charges_mensuelles")
      .select("*")
      .eq("user_id", userId)
      .eq("mois", prevMois)
      .order("created_at", { ascending: true })
      .limit(3);
    if (!prev || prev.length === 0) return;
    const currentMois = getCurrentMois();
    const existingCount = charges.length;
    const toCreate = (prev as Charge[]).slice(0, 3 - existingCount).map((c) => ({
      user_id: userId,
      mois: currentMois,
      nom: c.nom,
      icone: c.icone,
      categorie: c.categorie,
      montant_total: c.montant_total,
      montant_couvert: 0,
      jour_echeance: c.jour_echeance,
      est_paye: false,
      en_pause: false,
    }));
    if (toCreate.length === 0) return;
    await supabase.from("charges_mensuelles").insert(toCreate);
    await loadCharges(userId);
  }

  async function handleSaveCharge(data: {
    nom: string; icone: string; categorie: "urgent" | "important";
    montant_total: number; jour_echeance: number; montant_couvert: number;
  }) {
    if (!userId) return;
    setSaving(true);
    const supabase = createClient();
    if (editCharge) {
      await supabase.from("charges_mensuelles").update({
        nom: data.nom, icone: data.icone, categorie: data.categorie,
        montant_total: data.montant_total, jour_echeance: data.jour_echeance,
        montant_couvert: data.montant_couvert,
      }).eq("id", editCharge.id);
    } else {
      await supabase.from("charges_mensuelles").insert({
        user_id: userId, mois: getCurrentMois(),
        nom: data.nom, icone: data.icone, categorie: data.categorie,
        montant_total: data.montant_total, jour_echeance: data.jour_echeance,
        montant_couvert: data.montant_couvert, est_paye: false, en_pause: false,
      });
    }
    await loadCharges(userId);
    setSaving(false);
    setModalOpen(false);
    setEditCharge(null);
  }

  async function handleMarquerPaye(id: string) {
    if (!userId) return;
    const supabase = createClient();
    await supabase.from("charges_mensuelles").update({
      est_paye: true, paye_le: new Date().toISOString(),
    }).eq("id", id);
    await loadCharges(userId);
    setOpenMenuId(null);
  }

  async function handlePause(id: string, enPause: boolean) {
    if (!userId) return;
    const supabase = createClient();
    await supabase.from("charges_mensuelles").update({ en_pause: enPause }).eq("id", id);
    await loadCharges(userId);
    setOpenMenuId(null);
  }

  async function handleSupprimer(id: string) {
    if (!userId) return;
    const supabase = createClient();
    await supabase.from("charges_mensuelles").delete().eq("id", id);
    await loadCharges(userId);
    setOpenMenuId(null);
  }

  async function handleAjouterFonds(id: string) {
    if (!userId) return;
    const montant = parseNum(addFondsVal);
    if (montant <= 0) { setAddFondsId(null); setAddFondsVal(""); return; }
    const charge = charges.find((c) => c.id === id);
    if (!charge) return;
    const supabase = createClient();
    const newVal = Math.min(charge.montant_couvert + montant, charge.montant_total);
    const updates: Record<string, unknown> = { montant_couvert: newVal };
    if (newVal >= charge.montant_total) {
      updates.est_paye = true;
      updates.paye_le = new Date().toISOString();
    }
    await supabase.from("charges_mensuelles").update(updates).eq("id", id);
    await loadCharges(userId);
    setAddFondsId(null);
    setAddFondsVal("");
  }

  const activeCharges = charges.filter((c) => !c.en_pause);
  const montantCouvertTotal = activeCharges.reduce((s, c) => s + c.montant_couvert, 0);
  const montantTotal = activeCharges.reduce((s, c) => s + c.montant_total, 0);
  const pctTotal = montantTotal > 0 ? Math.round((montantCouvertTotal / montantTotal) * 100) : 0;
  const resteTotal = montantTotal - montantCouvertTotal;

  const joursEcoules = new Date().getDate();
  const moyenneBenef = joursEcoules > 0 ? beneficeMoisCourant / joursEcoules : 0;
  const hasPrediction = moyenneBenef > 0 && resteTotal > 0;
  const joursNecessaires = hasPrediction ? Math.ceil(resteTotal / convertir(1) > 0 ? resteTotal / moyenneBenef : 0) : 0;
  const datePrediction = hasPrediction && joursNecessaires > 0
    ? new Date(Date.now() + joursNecessaires * 86400000).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })
    : null;

  const slots = Array.from({ length: 3 }, (_, i) => charges[i] ?? null);

  if (loadingData) {
    return (
      <div className="card" style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)" }}>
        Chargement des charges…
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: "18px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <div className="section-title" style={{ margin: 0 }}>
          <span style={{ fontSize: "16px" }}>🌡️</span>
          Mes charges à couvrir ce mois
        </div>
        {charges.length < 3 && charges.length > 0 && (
          <button
            onClick={reconduireChargesmoisPrecedent}
            style={{
              fontSize: "11px", color: "var(--text-muted)", background: "transparent",
              border: "1px solid var(--border-color)", borderRadius: "6px",
              padding: "4px 8px", cursor: "pointer",
            }}
          >
            ↩ Reconduire mois préc.
          </button>
        )}
      </div>

      <div ref={menuRef} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {slots.map((charge, idx) => {
          if (!charge) {
            return (
              <EmptySlot
                key={`empty-${idx}`}
                index={idx}
                onAdd={() => { setEditCharge(null); setSlotIndex(idx); setModalOpen(true); }}
              />
            );
          }
          const urgence = getUrgence(charge);
          const colors = URGENCE_COLORS[urgence];
          const pct = charge.montant_total > 0
            ? Math.min(100, Math.round((charge.montant_couvert / charge.montant_total) * 100))
            : 0;
          const joursRestants = charge.jour_echeance - new Date().getDate();

          return (
            <div
              key={charge.id}
              style={{
                background: "var(--dark-elevated)",
                borderRadius: "12px",
                padding: "14px",
                border: `1.5px solid ${urgence === "urgent" ? colors.border + "88" : colors.border + "44"}`,
                position: "relative",
                opacity: urgence === "pause" ? 0.6 : 1,
              }}
            >
              {urgence === "urgent" && (
                <span style={{
                  position: "absolute", top: "-8px", left: "12px",
                  background: colors.badge, color: "white",
                  fontSize: "10px", fontWeight: 700, padding: "2px 8px",
                  borderRadius: "999px", letterSpacing: "0.3px",
                  animation: "pulse 2s infinite",
                }}>
                  🚨 URGENT — {joursRestants <= 0 ? "Échéance dépassée" : `${joursRestants}j restants`}
                </span>
              )}
              {urgence === "important" && (
                <span style={{
                  position: "absolute", top: "-8px", left: "12px",
                  background: colors.badge, color: "white",
                  fontSize: "10px", fontWeight: 700, padding: "2px 8px",
                  borderRadius: "999px",
                }}>
                  ⚠️ IMPORTANT — {joursRestants}j restants
                </span>
              )}
              {urgence === "paye" && (
                <span style={{
                  position: "absolute", top: "-8px", left: "12px",
                  background: colors.badge, color: "white",
                  fontSize: "10px", fontWeight: 700, padding: "2px 8px",
                  borderRadius: "999px",
                }}>
                  ✅ PAYÉ
                </span>
              )}

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px", marginTop: urgence !== "ok" ? "6px" : "0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "18px" }}>{charge.icone}</span>
                  <span style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-primary)" }}>{charge.nom}</span>
                </div>
                <div style={{ position: "relative" }}>
                  <button
                    onClick={() => setOpenMenuId(openMenuId === charge.id ? null : charge.id)}
                    style={{
                      background: "transparent", border: "none", cursor: "pointer",
                      color: "var(--text-muted)", fontSize: "18px", padding: "0 4px",
                      lineHeight: 1,
                    }}
                  >
                    ⋮
                  </button>
                  {openMenuId === charge.id && (
                    <div style={{
                      position: "absolute", right: 0, top: "24px", zIndex: 50,
                      background: "var(--dark-card)", border: "1px solid var(--border-color)",
                      borderRadius: "10px", minWidth: "170px", overflow: "hidden",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                    }}>
                      {[
                        { icon: "✏️", label: "Modifier", action: () => { setEditCharge(charge); setModalOpen(true); setOpenMenuId(null); } },
                        { icon: "➕", label: "Ajouter des fonds", action: () => { setAddFondsId(charge.id); setOpenMenuId(null); } },
                        ...(!charge.est_paye ? [{ icon: "✅", label: "Marquer comme payé", action: () => handleMarquerPaye(charge.id) }] : []),
                        ...(!charge.en_pause ? [{ icon: "⏸️", label: "Mettre en pause", action: () => handlePause(charge.id, true) }] : [{ icon: "▶️", label: "Reprendre", action: () => handlePause(charge.id, false) }]),
                        { icon: "🗑️", label: "Supprimer", action: () => handleSupprimer(charge.id) },
                      ].map((item) => (
                        <button
                          key={item.label}
                          onClick={item.action}
                          style={{
                            display: "flex", alignItems: "center", gap: "10px",
                            width: "100%", padding: "10px 14px", background: "transparent",
                            border: "none", cursor: "pointer", textAlign: "left",
                            color: item.label === "Supprimer" ? "#ef4444" : "var(--text-primary)",
                            fontSize: "13px", fontWeight: 500,
                            borderBottom: "1px solid var(--border-color)",
                          }}
                        >
                          <span>{item.icon}</span> {item.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {addFondsId === charge.id && (
                <div style={{ display: "flex", gap: "8px", marginBottom: "10px", alignItems: "center" }}>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="Montant à ajouter"
                    value={addFondsVal}
                    onChange={(e) => setAddFondsVal(e.target.value)}
                    autoFocus
                    style={{
                      flex: 1, background: "var(--dark-card)", border: "1px solid var(--border-color)",
                      borderRadius: "8px", padding: "8px 10px", color: "var(--text-primary)",
                      fontSize: "13px",
                    }}
                  />
                  <button
                    onClick={() => handleAjouterFonds(charge.id)}
                    style={{
                      background: "#3b82f6", color: "white", border: "none",
                      borderRadius: "8px", padding: "8px 12px", cursor: "pointer",
                      fontSize: "13px", fontWeight: 600,
                    }}
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => { setAddFondsId(null); setAddFondsVal(""); }}
                    style={{
                      background: "transparent", color: "var(--text-muted)", border: "1px solid var(--border-color)",
                      borderRadius: "8px", padding: "8px 10px", cursor: "pointer", fontSize: "13px",
                    }}
                  >
                    ✕
                  </button>
                </div>
              )}

              <div style={{ position: "relative", height: "8px", background: "var(--dark-card)", borderRadius: "999px", overflow: "hidden", marginBottom: "8px" }}>
                <div style={{
                  position: "absolute", left: 0, top: 0, bottom: 0,
                  width: `${pct}%`, borderRadius: "999px",
                  background: urgence === "paye" ? colors.bar : `linear-gradient(90deg, ${colors.bar}cc, ${colors.bar})`,
                  transition: "width 0.6s ease",
                }} />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px" }}>
                <span style={{ color: colors.text, fontWeight: 700 }}>
                  {pct}% ({fmt(charge.montant_couvert)} / {fmt(charge.montant_total)})
                </span>
                {urgence === "paye" ? (
                  <span style={{ color: "#6ee7b7", fontSize: "11px" }}>
                    Complété le {charge.paye_le
                      ? new Date(charge.paye_le).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
                      : "—"}
                  </span>
                ) : urgence !== "pause" ? (
                  <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>
                    {pct < 100 ? `Encore ${fmt(charge.montant_total - charge.montant_couvert)}` : "Prêt"} • Éch. {formatDate(charge.jour_echeance, getCurrentMois())}
                  </span>
                ) : (
                  <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>En pause ce mois</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {charges.length === 0 && (
        <div style={{ textAlign: "center", marginTop: "8px", padding: "8px 0" }}>
          <button
            onClick={reconduireChargesmoisPrecedent}
            style={{
              fontSize: "12px", color: "var(--accent-blue)", background: "transparent",
              border: "1px dashed var(--accent-blue)", borderRadius: "8px",
              padding: "6px 14px", cursor: "pointer",
            }}
          >
            ↩ Reconduire les charges du mois dernier
          </button>
        </div>
      )}

      {montantTotal > 0 && (
        <div style={{
          marginTop: "14px", padding: "12px 14px",
          background: "var(--dark-elevated)", borderRadius: "10px",
          borderTop: "2px solid var(--border-color)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>Total couvert</span>
            <span style={{ fontSize: "13px", fontWeight: 800, color: pctTotal >= 100 ? "#10b981" : "var(--text-primary)" }}>
              {fmt(montantCouvertTotal)} / {fmt(montantTotal)} ({pctTotal}%)
            </span>
          </div>
          <div style={{ position: "relative", height: "6px", background: "var(--dark-card)", borderRadius: "999px", overflow: "hidden", marginBottom: "8px" }}>
            <div style={{
              position: "absolute", left: 0, top: 0, bottom: 0,
              width: `${pctTotal}%`, borderRadius: "999px",
              background: pctTotal >= 100 ? "#10b981" : "#3b82f6",
              transition: "width 0.6s ease",
            }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
            <span style={{ color: "var(--text-muted)" }}>
              Reste à faire : <strong style={{ color: resteTotal > 0 ? "#f97316" : "#10b981" }}>{fmt(resteTotal)}</strong>
            </span>
            {datePrediction && (
              <span style={{ color: "#9ca3af", fontStyle: "italic" }}>
                💡 Préd. : {datePrediction}
              </span>
            )}
          </div>
        </div>
      )}

      {modalOpen && (
        <ChargeConfigModal
          editCharge={editCharge}
          onClose={() => { setModalOpen(false); setEditCharge(null); }}
          onSave={handleSaveCharge}
          saving={saving}
        />
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}

function EmptySlot({ index, onAdd }: { index: number; onAdd: () => void }) {
  return (
    <div
      onClick={onAdd}
      style={{
        background: "var(--dark-elevated)",
        borderRadius: "12px",
        padding: "18px 14px",
        border: "1.5px dashed var(--border-color)",
        cursor: "pointer",
        textAlign: "center",
        transition: "border-color 0.2s, background 0.2s",
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "#3b82f6"; (e.currentTarget as HTMLDivElement).style.background = "rgba(59,130,246,0.05)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border-color)"; (e.currentTarget as HTMLDivElement).style.background = "var(--dark-elevated)"; }}
    >
      <div style={{ fontSize: "22px", marginBottom: "6px" }}>📝</div>
      <div style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 600, marginBottom: "4px" }}>
        {index === 0 ? "Configurez votre 1ère charge" : `Emplacement ${index + 1} disponible`}
      </div>
      {index === 0 && (
        <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "10px" }}>
          Suivez un loyer, une facture, un abonnement…
        </div>
      )}
      <span style={{
        display: "inline-block", fontSize: "12px", fontWeight: 700,
        color: "var(--accent-blue)", background: "rgba(59,130,246,0.12)",
        borderRadius: "8px", padding: "5px 14px",
      }}>
        + Ajouter une charge
      </span>
    </div>
  );
}

function ChargeConfigModal({
  editCharge,
  onClose,
  onSave,
  saving,
}: {
  editCharge: Charge | null;
  onClose: () => void;
  onSave: (data: { nom: string; icone: string; categorie: "urgent" | "important"; montant_total: number; jour_echeance: number; montant_couvert: number }) => void;
  saving: boolean;
}) {
  const [step, setStep] = useState<"select" | "config">(editCharge ? "config" : "select");
  const [tabCat, setTabCat] = useState<"urgent" | "important">("urgent");
  const [selected, setSelected] = useState<{ nom: string; icone: string; categorie: "urgent" | "important" } | null>(
    editCharge ? { nom: editCharge.nom, icone: editCharge.icone, categorie: editCharge.categorie } : null
  );
  const [montantTotal, setMontantTotal] = useState(editCharge ? String(editCharge.montant_total) : "");
  const [jourEcheance, setJourEcheance] = useState(editCharge ? editCharge.jour_echeance : 1);
  const [montantCouvert, setMontantCouvert] = useState(editCharge ? String(editCharge.montant_couvert) : "0");

  function handleSave() {
    if (!selected) return;
    onSave({
      nom: selected.nom,
      icone: selected.icone,
      categorie: selected.categorie,
      montant_total: parseNum(montantTotal),
      jour_echeance: jourEcheance,
      montant_couvert: parseNum(montantCouvert),
    });
  }

  const urgentList = CATALOGUE.filter((c) => c.categorie === "urgent");
  const importantList = CATALOGUE.filter((c) => c.categorie === "important");

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "16px",
    }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: "var(--dark-card)", borderRadius: "16px",
        width: "100%", maxWidth: "420px",
        border: "1px solid var(--border-color)",
        overflow: "hidden",
        boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
      }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-color)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontWeight: 800, fontSize: "15px", color: "var(--text-primary)" }}>
            {step === "select" ? "⚙️ Configurer une charge" : `${selected?.icone ?? "📝"} ${selected?.nom ?? "Configuration"}`}
          </span>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "var(--text-muted)", fontSize: "18px", cursor: "pointer" }}>✕</button>
        </div>

        <div style={{ padding: "20px" }}>
          {step === "select" ? (
            <>
              <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                {(["urgent", "important"] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setTabCat(cat)}
                    style={{
                      flex: 1, padding: "8px", borderRadius: "8px", cursor: "pointer",
                      fontWeight: 700, fontSize: "13px",
                      background: tabCat === cat ? (cat === "urgent" ? "#ef4444" : "#f97316") : "var(--dark-elevated)",
                      color: tabCat === cat ? "white" : "var(--text-muted)",
                      border: "1px solid " + (tabCat === cat ? "transparent" : "var(--border-color)"),
                    }}
                  >
                    {cat === "urgent" ? "🚨 URGENT" : "⚠️ IMPORTANT"}
                  </button>
                ))}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {(tabCat === "urgent" ? urgentList : importantList).map((item) => (
                  <button
                    key={item.nom}
                    onClick={() => { setSelected(item); setStep("config"); }}
                    style={{
                      display: "flex", alignItems: "center", gap: "12px",
                      padding: "12px 14px", borderRadius: "10px",
                      background: "var(--dark-elevated)",
                      border: "1px solid var(--border-color)",
                      cursor: "pointer", textAlign: "left",
                      color: "var(--text-primary)", fontSize: "14px", fontWeight: 600,
                    }}
                  >
                    <span style={{ fontSize: "20px" }}>{item.icone}</span>
                    {item.nom}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              {!editCharge && (
                <button
                  onClick={() => setStep("select")}
                  style={{ background: "transparent", border: "none", color: "var(--accent-blue)", cursor: "pointer", fontSize: "13px", marginBottom: "14px", padding: 0 }}
                >
                  ← Changer de charge
                </button>
              )}

              {[
                { label: "Montant mensuel", value: montantTotal, onChange: setMontantTotal, placeholder: "ex : 100000" },
                { label: "Montant déjà épargné (optionnel)", value: montantCouvert, onChange: setMontantCouvert, placeholder: "0" },
              ].map((field) => (
                <div key={field.label} style={{ marginBottom: "14px" }}>
                  <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", fontWeight: 700, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    {field.label}
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder={field.placeholder}
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    style={{
                      width: "100%", background: "var(--dark-elevated)",
                      border: "1px solid var(--border-color)", borderRadius: "8px",
                      padding: "10px 12px", color: "var(--text-primary)", fontSize: "14px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              ))}

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", fontWeight: 700, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Jour d&apos;échéance
                </label>
                <select
                  value={jourEcheance}
                  onChange={(e) => setJourEcheance(parseInt(e.target.value))}
                  style={{
                    width: "100%", background: "var(--dark-elevated)",
                    border: "1px solid var(--border-color)", borderRadius: "8px",
                    padding: "10px 12px", color: "var(--text-primary)", fontSize: "14px",
                  }}
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((j) => (
                    <option key={j} value={j}>Le {j} du mois</option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={onClose}
                  style={{
                    flex: 1, padding: "11px", borderRadius: "10px",
                    background: "var(--dark-elevated)", border: "1px solid var(--border-color)",
                    color: "var(--text-muted)", cursor: "pointer", fontWeight: 600, fontSize: "13px",
                  }}
                >
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || parseNum(montantTotal) <= 0}
                  style={{
                    flex: 2, padding: "11px", borderRadius: "10px",
                    background: saving || parseNum(montantTotal) <= 0 ? "#374151" : "#3b82f6",
                    border: "none", color: "white", cursor: saving || parseNum(montantTotal) <= 0 ? "not-allowed" : "pointer",
                    fontWeight: 700, fontSize: "13px",
                  }}
                >
                  {saving ? "Enregistrement…" : "✓ Enregistrer"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
