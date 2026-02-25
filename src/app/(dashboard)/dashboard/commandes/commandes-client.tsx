"use client";
import { useState, useMemo, useEffect } from "react";
import { useDevise } from "@/context/DeviseContext";
import { useData } from "@/context/DataContext";
import { useToast } from "@/context/ToastContext";

type Periode = "today" | "week" | "month" | "all";

const PERIODE_LABELS: Record<Periode, string> = {
  today: "Aujourd'hui",
  week: "Cette Semaine",
  month: "Ce Mois",
  all: "Tout",
};

const DEVISES_PUB = [
  { code: "FCFA", label: "FCFA (Franc CFA)" },
  { code: "XOF", label: "XOF (Franc CFA BCEAO)" },
  { code: "XAF", label: "XAF (Franc CFA BEAC)" },
  { code: "EUR", label: "EUR (Euro)" },
  { code: "USD", label: "USD (Dollar US)" },
  { code: "GBP", label: "GBP (Livre Sterling)" },
  { code: "CAD", label: "CAD (Dollar Canadien)" },
  { code: "CHF", label: "CHF (Franc Suisse)" },
  { code: "HKD", label: "HKD (Dollar Hong Kong)" },
  { code: "CNY", label: "CNY (Yuan Chinois)" },
  { code: "JPY", label: "JPY (Yen Japonais)" },
  { code: "AUD", label: "AUD (Dollar Australien)" },
  { code: "NGN", label: "NGN (Naira Nigerian)" },
  { code: "GHS", label: "GHS (Cedi Ghaneen)" },
  { code: "KES", label: "KES (Shilling Kenyan)" },
  { code: "ZAR", label: "ZAR (Rand Sud-Africain)" },
  { code: "MAD", label: "MAD (Dirham Marocain)" },
  { code: "TND", label: "TND (Dinar Tunisien)" },
  { code: "DZD", label: "DZD (Dinar Algerien)" },
  { code: "EGP", label: "EGP (Livre Egyptienne)" },
  { code: "AED", label: "AED (Dirham Emirats)" },
  { code: "SAR", label: "SAR (Riyal Saoudien)" },
  { code: "INR", label: "INR (Roupie Indienne)" },
  { code: "BRL", label: "BRL (Real Bresilien)" },
  { code: "MXN", label: "MXN (Peso Mexicain)" },
];

const TAUX_BASE_FCFA: Record<string, number> = {
  FCFA: 1, XOF: 1, XAF: 1,
  EUR: 655.957, USD: 615, GBP: 780, CAD: 455, CHF: 690,
  HKD: 79, CNY: 85, JPY: 4.1, AUD: 405,
  NGN: 0.41, GHS: 51, KES: 4.8, ZAR: 33,
  MAD: 61, TND: 200, DZD: 4.6, EGP: 20,
  AED: 167, SAR: 164, INR: 7.4, BRL: 125, MXN: 36,
};

function fmt(n: number, d: string) {
  return n.toLocaleString("fr-FR") + " " + d;
}

export default function CommandesClient() {
  const { deviseActuelle } = useDevise();
  const { ventes, loading, deleteVente, marquerRetournee, repartirPubJour } = useData();
  const { showToast } = useToast();

  const [periode, setPeriode] = useState<Periode>("today");
  const [search, setSearch] = useState("");
  const [produitFilter, setProduitFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [budgetPubRepartir, setBudgetPubRepartir] = useState("");
  const [showRepartir, setShowRepartir] = useState(false);
  const [devisePubRepartir, setDevisePubRepartir] = useState("");
  const [tauxPubRepartir, setTauxPubRepartir] = useState("1");

  useEffect(() => {
    if (devisePubRepartir && devisePubRepartir !== deviseActuelle) {
      const taux = TAUX_BASE_FCFA[devisePubRepartir.toUpperCase()] || 1;
      setTauxPubRepartir(String(taux));
    } else {
      setTauxPubRepartir("1");
    }
  }, [devisePubRepartir, deviseActuelle]);

  const ventesFiltrees = useMemo(() => {
    const n = new Date();
    return ventes
      .filter((v) => {
        const d = new Date(v.date);
        if (periode === "today") return d.toDateString() === n.toDateString();
        if (periode === "week") {
          const s = new Date(n); s.setDate(n.getDate() - n.getDay()); return d >= s;
        }
        if (periode === "month") return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
        return true;
      })
      .filter((v) => {
        if (produitFilter !== "all" && v.produit !== produitFilter) return false;
        if (search) {
          const q = search.toLowerCase();
          return v.nom_client.toLowerCase().includes(q) || v.tel.includes(q) || v.produit.toLowerCase().includes(q);
        }
        return true;
      });
  }, [ventes, periode, search, produitFilter]);

  const ventesActives = useMemo(() => ventesFiltrees.filter(v => !v.retournee), [ventesFiltrees]);

  const totalCA = ventesActives.reduce((s, v) => s + v.ca, 0);
  const totalDepenses = ventesActives.reduce((s, v) => s + v.depenses, 0);
  const totalBenefice = ventesActives.reduce((s, v) => s + v.benefice, 0);
  const margeNette = totalCA > 0 ? ((totalBenefice / totalCA) * 100).toFixed(1) : "0";
  const panierMoyen = ventesActives.length > 0 ? totalCA / ventesActives.length : 0;

  const produits = [...new Set(ventes.map((v) => v.produit).filter(Boolean))];

  const hasProvPub = useMemo(() => {
    const today = new Date().toDateString();
    return ventes.some(v => new Date(v.date).toDateString() === today && v.budget_pub_provisoire && !v.retournee);
  }, [ventes]);

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette vente définitivement ?")) return;
    await deleteVente(id);
    showToast("Vente supprimée.", "success");
    if (expandedId === id) setExpandedId(null);
  }

  async function handleRetournee(id: string) {
    if (!confirm("Marquer cette commande comme retournée ?")) return;
    await marquerRetournee(id);
    showToast("Vente marquée comme retournée.", "warning");
  }

  const devisePubActive = devisePubRepartir.trim().toUpperCase() || deviseActuelle;
  const pubEstDifferente = devisePubActive !== deviseActuelle;
  const tauxPubNum = parseFloat(tauxPubRepartir) || 1;
  const budgetPubBrut = parseFloat(budgetPubRepartir) || 0;
  const budgetPubConverti = pubEstDifferente ? budgetPubBrut * tauxPubNum : budgetPubBrut;

  async function handleRepartirPub() {
    if (!budgetPubBrut || budgetPubBrut <= 0) { showToast("Entrez un montant valide.", "error"); return; }
    await repartirPubJour(budgetPubConverti);
    showToast("Budget pub réparti sur les ventes du jour !", "success");
    setBudgetPubRepartir("");
    setDevisePubRepartir("");
    setTauxPubRepartir("1");
    setShowRepartir(false);
  }

  return (
    <div className="main-content">
      <div className="container">

        {/* Barre recherche */}
        <div className="card" style={{ marginBottom: "12px", padding: "0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px 20px" }}>
            <i className="fas fa-magnifying-glass" style={{ color: "var(--text-muted)", fontSize: "16px", flexShrink: 0 }}></i>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Recherche : nom, telephone, produit..."
              style={{ background: "transparent", border: "none", outline: "none", width: "100%", fontSize: "15px", color: "var(--text-primary)", fontFamily: "var(--font-inter), system-ui, sans-serif" }}
            />
          </div>
        </div>

        {/* Stats résumé */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "12px" }}>
          <div className="card" style={{ textAlign: "center", padding: "20px 16px", marginBottom: 0 }}>
            <div style={{ fontSize: "36px", fontWeight: 900, color: "var(--text-primary)", lineHeight: 1.1 }}>{ventesActives.length}</div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "1.5px", marginTop: "6px", textTransform: "uppercase" }}>Commandes</div>
          </div>
          <div className="card" style={{ textAlign: "center", padding: "20px 16px", marginBottom: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
              <span style={{ width: "14px", height: "14px", borderRadius: "50%", background: totalBenefice >= 0 ? "var(--accent-green)" : "var(--accent-red)", flexShrink: 0, display: "inline-block" }}></span>
              <span style={{ fontSize: "20px", fontWeight: 900, color: totalBenefice >= 0 ? "var(--accent-green)" : "var(--accent-red)", lineHeight: 1.1 }}>{fmt(totalBenefice, deviseActuelle)}</span>
            </div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "1.5px", marginTop: "6px", textTransform: "uppercase" }}>Bénéfice</div>
          </div>
          <div className="card" style={{ textAlign: "center", padding: "20px 16px", marginBottom: 0 }}>
            <div style={{ fontSize: "18px", fontWeight: 900, color: "#8b5cf6", lineHeight: 1.1 }}>{fmt(panierMoyen, deviseActuelle)}</div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "1.5px", marginTop: "6px", textTransform: "uppercase" }}>Panier Moyen</div>
          </div>
        </div>

        {/* Filtres période */}
        <div className="card" style={{ marginBottom: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <i className="fas fa-calendar" style={{ color: "var(--accent-blue)", fontSize: "18px" }}></i>
            <span style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)" }}>Période</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "12px" }}>
            {(["today", "week", "month", "all"] as Periode[]).map((p) => (
              <button key={p} onClick={() => setPeriode(p)} className={`toggle-btn ${periode === p ? "active" : "inactive"}`} type="button" style={{ fontSize: "15px", fontWeight: 700, padding: "14px" }}>
                {PERIODE_LABELS[p]}
              </button>
            ))}
          </div>
          <div style={{ position: "relative" }}>
            <select className="form-input" value={produitFilter} onChange={(e) => setProduitFilter(e.target.value)} style={{ cursor: "pointer", paddingRight: "44px" }}>
              <option value="all">Tous les produits</option>
              {produits.map((p) => (<option key={p} value={p}>{p}</option>))}
            </select>
            <i className="fas fa-chevron-down" style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }}></i>
          </div>
        </div>

        {/* Répartir pub (si pub provisoire ce jour) */}
        {periode === "today" && hasProvPub && (
          <div className="card" style={{ marginBottom: "12px", background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.3)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <i className="fas fa-rectangle-ad" style={{ color: "#f97316", fontSize: "18px" }}></i>
              <span style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>Répartir le budget pub</span>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#f97316", background: "rgba(249,115,22,0.15)", borderRadius: "6px", padding: "2px 8px" }}>PROVISOIRE</span>
            </div>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "12px" }}>
              Des ventes d&apos;aujourd&apos;hui ont un budget pub provisoire. Entrez votre dépense Meta Ads réelle pour la répartir.
            </p>
            {showRepartir ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div className="calc-field" style={{ marginBottom: 0 }}>
                  <label className="calc-label" style={{ fontSize: "11px" }}>DEVISE DU BUDGET PUB</label>
                  <div style={{ position: "relative" }}>
                    <select
                      className="form-input"
                      value={devisePubRepartir}
                      onChange={(e) => setDevisePubRepartir(e.target.value)}
                      style={{ cursor: "pointer", paddingRight: "44px" }}
                    >
                      <option value="">{deviseActuelle} (devise système)</option>
                      {DEVISES_PUB.filter(d => d.code !== deviseActuelle).map(d => (
                        <option key={d.code} value={d.code}>{d.label}</option>
                      ))}
                    </select>
                    <i className="fas fa-chevron-down" style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }}></i>
                  </div>
                </div>

                <div className="calc-field" style={{ marginBottom: 0 }}>
                  <label className="calc-label" style={{ fontSize: "11px" }}>MONTANT ({devisePubActive})</label>
                  <input
                    className="form-input"
                    type="number" min="0" value={budgetPubRepartir}
                    onChange={(e) => setBudgetPubRepartir(e.target.value)}
                    onWheel={(e) => (e.target as HTMLInputElement).blur()}
                    placeholder="0"
                  />
                </div>

                {pubEstDifferente && (
                  <div style={{ background: "rgba(102,126,234,0.1)", border: "1px solid rgba(102,126,234,0.25)", borderRadius: "12px", padding: "12px 14px" }}>
                    <div style={{ fontSize: "11px", color: "#a78bfa", fontWeight: 700, marginBottom: "10px" }}>
                      <i className="fas fa-exchange-alt" style={{ marginRight: "6px" }}></i>
                      Taux de conversion
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 700, whiteSpace: "nowrap" }}>
                        1 {devisePubActive} =
                      </span>
                      <input
                        type="number" min="0" value={tauxPubRepartir}
                        onChange={(e) => setTauxPubRepartir(e.target.value)}
                        onWheel={(e) => (e.target as HTMLInputElement).blur()}
                        placeholder="1"
                        style={{ flex: 1, padding: "7px 10px", background: "var(--input-bg)", border: "1px solid var(--diamond-border)", borderRadius: "8px", color: "var(--text-primary)", fontSize: "12px", fontWeight: 700, outline: "none" }}
                      />
                      <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 700, whiteSpace: "nowrap" }}>
                        {deviseActuelle}
                      </span>
                    </div>
                    {budgetPubBrut > 0 && tauxPubNum > 0 && (
                      <div style={{ marginTop: "8px", fontSize: "12px", color: "#10b981", fontWeight: 700 }}>
                        <i className="fas fa-check-circle" style={{ marginRight: "5px" }}></i>
                        {budgetPubBrut} {devisePubActive} = {fmt(budgetPubConverti, deviseActuelle)} à répartir
                      </div>
                    )}
                  </div>
                )}

                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={handleRepartirPub} className="btn btn-primary" style={{ flex: 1 }}>
                    <i className="fas fa-check"></i> Répartir
                  </button>
                  <button onClick={() => { setShowRepartir(false); setBudgetPubRepartir(""); setDevisePubRepartir(""); setTauxPubRepartir("1"); }} style={{ flex: 1, background: "var(--dark-elevated)", border: "1px solid var(--diamond-border)", borderRadius: "12px", color: "var(--text-muted)", cursor: "pointer", padding: "14px", fontSize: "14px", fontWeight: 600 }}>
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowRepartir(true)} className="btn btn-primary" style={{ width: "100%" }}>
                <i className="fas fa-divide"></i> Répartir maintenant
              </button>
            )}
          </div>
        )}

        {/* Résumé financier */}
        <div className="card" style={{ marginBottom: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <i className="fas fa-chart-line" style={{ color: "var(--accent-blue)", fontSize: "18px" }}></i>
            <span style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)" }}>Resume Financier</span>
          </div>
          <div style={{ background: "var(--dark-elevated)", borderRadius: "12px", overflow: "hidden" }}>
            {[
              { label: "Chiffre d'affaires", value: fmt(totalCA, deviseActuelle), color: "var(--text-primary)" },
              { label: "Total dépenses", value: fmt(totalDepenses, deviseActuelle), color: "var(--text-primary)" },
              { label: "Marge nette", value: `${margeNette}%`, color: parseFloat(margeNette) >= 0 ? "var(--accent-green)" : "var(--accent-red)" },
            ].map((row, i, arr) => (
              <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: i < arr.length - 1 ? "1px solid var(--diamond-border)" : "none" }}>
                <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>{row.label}</span>
                <span style={{ fontSize: "15px", fontWeight: 800, color: row.color }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Liste commandes */}
        <div className="card" style={{ marginBottom: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <i className="fas fa-list" style={{ color: "var(--accent-blue)", fontSize: "18px" }}></i>
            <span style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)" }}>Detail des Commandes</span>
          </div>

          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "150px" }}>
              <i className="fas fa-spinner fa-spin" style={{ fontSize: "28px", color: "var(--accent-purple)" }}></i>
            </div>
          ) : ventesFiltrees.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "150px", textAlign: "center" }}>
              <i className="fas fa-inbox" style={{ fontSize: "48px", color: "var(--text-muted)", opacity: 0.3, display: "block", marginBottom: "12px" }}></i>
              <p style={{ fontSize: "15px", color: "var(--text-muted)", margin: 0 }}>Aucune vente pour cette période</p>
            </div>
          ) : (
            <div>
              {ventesFiltrees.map((v) => {
                const isRetournee = v.retournee;
                const isPerte = v.benefice < 0;
                const isMoyen = !isRetournee && v.marge >= 15 && v.marge < 30;
                const isExcellent = !isRetournee && v.marge >= 30;
                const dotColor = isRetournee ? "#94a3b8" : isPerte ? "#ef4444" : isMoyen ? "#f97316" : isExcellent ? "#10b981" : "#f97316";
                const badge = isRetournee ? "RETOUR" : isPerte ? "PERTE" : isMoyen ? "MOYEN" : "EXCELLENT";
                const isOpen = expandedId === v.id;

                return (
                  <div key={v.id} style={{ background: "var(--dark-elevated)", borderRadius: "12px", marginBottom: "8px", border: `1px solid ${isRetournee ? "rgba(148,163,184,0.2)" : "var(--diamond-border)"}`, opacity: isRetournee ? 0.75 : 1, overflow: "hidden" }}>
                    <div
                      style={{ padding: "14px 18px", cursor: "pointer" }}
                      onClick={() => setExpandedId(isOpen ? null : v.id)}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", flexWrap: "wrap" }}>
                            <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: dotColor, flexShrink: 0, display: "inline-block" }}></span>
                            <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>{v.nom_client || "Client anonyme"}</span>
                            <span style={{ fontSize: "11px", fontWeight: 700, color: dotColor, background: `${dotColor}22`, borderRadius: "6px", padding: "2px 8px" }}>{badge}</span>
                            {v.budget_pub_provisoire && !isRetournee && (
                              <span style={{ fontSize: "11px", color: "#f97316", fontWeight: 700 }}>(pub provisoire)</span>
                            )}
                          </div>
                          <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                            {v.produit} · {v.nb_pieces} pcs · {new Date(v.date).toLocaleDateString("fr-FR")}
                          </div>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0, marginLeft: "12px" }}>
                          <div style={{ fontSize: "15px", fontWeight: 800, color: v.benefice >= 0 ? "var(--accent-green)" : "#ef4444" }}>{fmt(v.benefice, deviseActuelle)}</div>
                          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>CA: {fmt(v.ca, deviseActuelle)}</div>
                        </div>
                      </div>
                      <div style={{ textAlign: "right", marginTop: "4px" }}>
                        <i className={`fas fa-chevron-${isOpen ? "up" : "down"}`} style={{ fontSize: "11px", color: "var(--text-muted)" }}></i>
                      </div>
                    </div>

                    {isOpen && (
                      <div style={{ borderTop: "1px solid var(--diamond-border)", padding: "14px 18px", background: "var(--dark-card)" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "12px" }}>
                          {[
                            { label: "Pièces vendues", value: `${v.nb_pieces}` },
                            { label: "Prix unitaire", value: fmt(v.prix_vente, deviseActuelle) },
                            { label: "Chiffre d'affaires", value: fmt(v.ca, deviseActuelle) },
                            { label: "Dépenses totales", value: fmt(v.depenses, deviseActuelle) },
                            ...(v.tel ? [{ label: "Téléphone", value: v.tel }] : []),
                          ].map(row => (
                            <div key={row.label} style={{ background: "var(--dark-elevated)", borderRadius: "8px", padding: "8px 12px" }}>
                              <div style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 700, marginBottom: "3px" }}>{row.label}</div>
                              <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{row.value}</div>
                            </div>
                          ))}
                        </div>

                        {!isRetournee && (
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button
                              onClick={() => handleRetournee(v.id)}
                              style={{ flex: 1, padding: "10px", borderRadius: "10px", background: "rgba(249,115,22,0.12)", border: "1px solid rgba(249,115,22,0.3)", color: "#f97316", cursor: "pointer", fontSize: "13px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", fontFamily: "var(--font-inter), sans-serif" }}
                            >
                              <i className="fas fa-undo"></i> Retournée
                            </button>
                            <button
                              onClick={() => handleDelete(v.id)}
                              style={{ flex: 1, padding: "10px", borderRadius: "10px", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", cursor: "pointer", fontSize: "13px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", fontFamily: "var(--font-inter), sans-serif" }}
                            >
                              <i className="fas fa-trash"></i> Supprimer
                            </button>
                          </div>
                        )}
                        {isRetournee && (
                          <button
                            onClick={() => handleDelete(v.id)}
                            style={{ width: "100%", padding: "10px", borderRadius: "10px", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", cursor: "pointer", fontSize: "13px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", fontFamily: "var(--font-inter), sans-serif" }}
                          >
                            <i className="fas fa-trash"></i> Supprimer
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Rapport CEO */}
        <div style={{ background: "linear-gradient(135deg, #4f46e5, #8b5cf6)", borderRadius: "16px", padding: "20px", marginBottom: "12px", textAlign: "center" }}>
          <button style={{ background: "white", border: "none", borderRadius: "12px", padding: "14px 32px", fontSize: "16px", fontWeight: 800, color: "#4f46e5", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
            <i className="fas fa-file-pdf" style={{ color: "#4f46e5" }}></i>
            Generer mon Rapport CEO
          </button>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.85)", margin: 0 }}>Exportez vos statistiques en PDF professionnel</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
          <button style={{ background: "var(--dark-card)", border: "1px solid var(--diamond-border)", color: "var(--text-primary)", borderRadius: "14px", padding: "16px", fontSize: "15px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <i className="fas fa-download"></i> Exporter
          </button>
          <button style={{ background: "var(--dark-card)", border: "1px solid var(--diamond-border)", color: "var(--text-primary)", borderRadius: "14px", padding: "16px", fontSize: "15px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <i className="fas fa-upload"></i> Importer
          </button>
        </div>

      </div>
    </div>
  );
}
