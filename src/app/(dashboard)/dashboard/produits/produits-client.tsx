"use client";
import { useState, useMemo } from "react";
import { useDevise } from "@/context/DeviseContext";
import { useData } from "@/context/DataContext";
import { useToast } from "@/context/ToastContext";
import TooltipGuide from "@/components/onboarding/TooltipGuide";

function fmt(n: number, d: string) {
  return n.toLocaleString("fr-FR") + " " + d;
}

const btnNewStyle: React.CSSProperties = {
  width: "auto",
  padding: "10px 18px",
  fontSize: "14px",
  fontWeight: 700,
  borderRadius: "10px",
  border: "none",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "6px",
  background: "linear-gradient(135deg, #10b981, #059669)",
  color: "white",
  boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)",
  flexShrink: 0,
};

export default function ProduitsClient() {
  const { deviseActuelle } = useDevise();
  const { produits, ventes, loading, addProduit, updateProduit, deleteProduit } = useData();
  const { showToast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [nom, setNom] = useState("");
  const [prixRevient, setPrixRevient] = useState("");
  const [fraisTransport, setFraisTransport] = useState("");
  const [prixVente, setPrixVente] = useState("");
  const [hasCommission, setHasCommission] = useState(false);
  const [commission, setCommission] = useState("0");
  const [nbArticles, setNbArticles] = useState("");

  const stockMap = useMemo(() => {
    const map = new Map<string, number>();
    ventes.filter(v => !v.retournee).forEach(v => {
      const key = v.produit;
      map.set(key, (map.get(key) ?? 0) + v.nb_pieces);
    });
    return map;
  }, [ventes]);

  function resetForm() {
    setNom(""); setPrixRevient(""); setFraisTransport(""); setPrixVente(""); setHasCommission(false); setCommission("0"); setNbArticles(""); setEditId(null);
  }

  function openNew() { resetForm(); setShowForm(true); }

  function openEdit(p: typeof produits[0]) {
    setNom(p.nom);
    setPrixRevient(String(p.prix_revient));
    setFraisTransport(p.frais_transport !== undefined ? String(p.frais_transport) : "");
    setPrixVente(String(p.prix_vente));
    setHasCommission(p.commission > 0);
    setCommission(String(p.commission));
    setNbArticles(p.nb_articles !== undefined ? String(p.nb_articles) : "");
    setEditId(p.id);
    setShowForm(true);
  }

  async function handleSave() {
    if (!nom.trim()) { showToast("Le nom du produit est requis.", "error"); return; }
    const pr = parseFloat(prixRevient) || 0;
    const ft = parseFloat(fraisTransport) || 0;
    const pv = parseFloat(prixVente) || 0;
    const cm = hasCommission ? (parseFloat(commission) || 0) : 0;
    const na = nbArticles.trim() !== "" ? parseInt(nbArticles, 10) : undefined;

    let success = false;
    if (editId) {
      success = await updateProduit(editId, { nom: nom.trim(), prix_revient: pr, frais_transport: ft, prix_vente: pv, commission: cm, nb_articles: na });
      if (success) {
        showToast("Produit mis à jour !", "success");
      } else {
        showToast("Erreur lors de la mise à jour. Veuillez réessayer.", "error");
        return;
      }
    } else {
      success = await addProduit({ nom: nom.trim(), prix_revient: pr, frais_transport: ft, prix_vente: pv, commission: cm, nb_articles: na });
      if (success) {
        showToast("Produit ajouté !", "success");
      } else {
        showToast("Erreur lors de l'enregistrement. Veuillez réessayer.", "error");
        return;
      }
    }
    resetForm(); setShowForm(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce produit ?")) return;
    await deleteProduit(id);
    showToast("Produit supprimé.", "success");
  }

  const marge = (pr: number, pv: number) => pv > 0 ? (((pv - pr) / pv) * 100).toFixed(1) : "0.0";

  return (
    <div className="main-content">
      <div className="container">
        <div className="card" style={{ padding: "24px", cursor: "default" }}>

          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", marginBottom: "8px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <i className="fas fa-folder-open" style={{ color: "var(--accent-blue)", fontSize: "22px" }}></i>
                <span style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>Catalogue Produits</span>
              </div>
              <p style={{ fontSize: "14px", color: "var(--text-muted)", margin: 0 }}>Enregistrez vos produits pour automatiser vos calculs.</p>
            </div>
            <TooltipGuide
              id="produits_catalogue"
              title="Votre catalogue accelere tout"
              message="Creez vos produits une fois. Ensuite dans Calcul, tout se remplit automatiquement."
              icon="fas fa-box"
              position="left"
              primaryAction="Creer mon premier produit"
              onPrimaryClick={openNew}
              condition={produits.length === 0}
            >
              <button style={btnNewStyle} onClick={openNew}>
                <i className="fas fa-plus"></i>
                Nouveau
              </button>
            </TooltipGuide>
          </div>

          <div style={{ background: "var(--dark-elevated)", borderRadius: "12px", marginTop: "20px", padding: "24px", minHeight: "280px", display: "flex", flexDirection: "column" }}>

            {showForm && (
              <div style={{ background: "var(--dark-card)", borderRadius: "14px", padding: "22px", marginBottom: "16px", border: "1px solid var(--diamond-border)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
                  <span style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
                    {editId ? "Modifier le produit" : "Nouveau produit"}
                  </span>
                  <button onClick={() => { setShowForm(false); resetForm(); }} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "20px" }}>
                    <i className="fas fa-xmark"></i>
                  </button>
                </div>

                <div className="calc-field">
                  <label className="calc-label">NOM DU PRODUIT</label>
                  <input className="form-input" type="text" value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Ex: Robe en soie" />
                </div>
                <div className="calc-field">
                  <label className="calc-label">PRIX DE REVIENT UNITAIRE ({deviseActuelle})</label>
                  <input className="form-input" type="number" min="0" value={prixRevient} onChange={(e) => setPrixRevient(e.target.value)} onWheel={(e) => (e.target as HTMLInputElement).blur()} placeholder="2500" />
                </div>
                <div className="calc-field">
                  <label className="calc-label">FRAIS DE TRANSPORT / RÉCUPÉRATION ({deviseActuelle})</label>
                  <input className="form-input" type="number" min="0" value={fraisTransport} onChange={(e) => setFraisTransport(e.target.value)} onWheel={(e) => (e.target as HTMLInputElement).blur()} placeholder="0 (optionnel)" />
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>Taxi, livraison fournisseur, etc.</div>
                </div>
                <div className="calc-field">
                  <label className="calc-label">PRIX DE VENTE UNITAIRE ({deviseActuelle})</label>
                  <input className="form-input" type="number" min="0" value={prixVente} onChange={(e) => setPrixVente(e.target.value)} onWheel={(e) => (e.target as HTMLInputElement).blur()} placeholder="5000" />
                </div>
                <div className="calc-field">
                  <label className="calc-label">STOCK INITIAL (NOMBRE D&apos;ARTICLES)</label>
                  <input className="form-input" type="number" min="0" value={nbArticles} onChange={(e) => setNbArticles(e.target.value)} onWheel={(e) => (e.target as HTMLInputElement).blur()} placeholder="0 (optionnel)" />
                </div>
                <div className="calc-field">
                  <label className="calc-label">AVEZ-VOUS QUELQU&apos;UN QUI GÈRE VOS COMMANDES ?</label>
                  <div className="toggle-group">
                    <button className={`toggle-btn ${hasCommission ? "active" : "inactive"}`} onClick={() => setHasCommission(true)} type="button">
                      <i className="fas fa-user"></i>
                      Oui
                    </button>
                    <button className={`toggle-btn ${!hasCommission ? "active" : "inactive"}`} onClick={() => setHasCommission(false)} type="button">
                      <i className="fas fa-user"></i>
                      Non, moi-même
                    </button>
                  </div>
                </div>
                {hasCommission && (
                  <div className="calc-field">
                    <label className="calc-label">COMMISSION PAR PIÈCE ({deviseActuelle})</label>
                    <input className="form-input" type="number" min="0" value={commission} onChange={(e) => setCommission(e.target.value)} onWheel={(e) => (e.target as HTMLInputElement).blur()} placeholder="0" />
                  </div>
                )}

                <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                  <button className="btn btn-primary" onClick={handleSave} style={{ flex: 1 }}>
                    <i className="fas fa-floppy-disk"></i>
                    {editId ? "Mettre à jour" : "Enregistrer"}
                  </button>
                  <button onClick={() => { setShowForm(false); resetForm(); }} style={{ flex: 1, background: "transparent", border: "1px solid var(--diamond-border)", color: "var(--text-secondary)", borderRadius: "12px", padding: "14px", cursor: "pointer", fontSize: "14px", fontWeight: 600 }}>
                    Annuler
                  </button>
                </div>
              </div>
            )}

            {loading && (
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "150px" }}>
                <i className="fas fa-spinner fa-spin" style={{ fontSize: "28px", color: "var(--accent-purple)" }}></i>
              </div>
            )}

            {!loading && produits.length === 0 && !showForm && (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "220px", textAlign: "center" }}>
                <i className="fas fa-box-open" style={{ fontSize: "68px", color: "var(--text-muted)", opacity: 0.28, display: "block", marginBottom: "20px" }}></i>
                <p style={{ fontSize: "16px", color: "var(--text-muted)", lineHeight: 1.7, margin: 0 }}>
                  Aucun produit enregistré.<br />
                  Cliquez sur &ldquo;Nouveau&rdquo; pour commencer&nbsp;!
                </p>
              </div>
            )}

            {!loading && produits.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {produits.map((p) => {
                  const m = parseFloat(marge(p.prix_revient, p.prix_vente));
                  const vendus = stockMap.get(p.nom) ?? 0;
                  const hasStock = p.nb_articles !== undefined;
                  const restant = hasStock ? (p.nb_articles! - vendus) : null;
                  const stockColor = restant === null ? "var(--text-muted)" : restant <= 0 ? "#ef4444" : restant <= 3 ? "#f97316" : "#10b981";

                  return (
                    <div key={p.id} style={{ background: "var(--dark-card)", borderRadius: "12px", padding: "14px 18px", border: `1px solid var(--diamond-border)`, borderLeft: `4px solid ${restant !== null ? stockColor : "var(--diamond-border)"}` }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>{p.nom}</div>
                          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Revient : <span style={{ color: "var(--accent-blue)", fontWeight: 700 }}>{fmt(p.prix_revient, deviseActuelle)}</span></span>
                            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Vente : <span style={{ color: "var(--accent-green)", fontWeight: 700 }}>{fmt(p.prix_vente, deviseActuelle)}</span></span>
                            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Marge : <span style={{ color: m >= 0 ? "var(--accent-green)" : "var(--accent-red)", fontWeight: 700 }}>{m}%</span></span>
                            {p.commission > 0 && <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Commission : <span style={{ color: "var(--text-secondary)", fontWeight: 700 }}>{fmt(p.commission, deviseActuelle)}</span></span>}
                          </div>
                          {hasStock && (
                            <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                              <span style={{ fontSize: "12px", fontWeight: 700, color: stockColor }}>
                                <i className={`fas ${restant! <= 0 ? "fa-circle-xmark" : restant! <= 3 ? "fa-triangle-exclamation" : "fa-circle-check"}`} style={{ marginRight: "5px" }}></i>
                                Stock : {restant} / {p.nb_articles}
                                {restant! <= 0 && " — Rupture"}
                                {restant! > 0 && restant! <= 3 && " — Faible"}
                              </span>
                              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>· {vendus} vendu(s)</span>
                            </div>
                          )}
                        </div>
                        <div style={{ display: "flex", gap: "8px", marginLeft: "12px", flexShrink: 0 }}>
                          <button onClick={() => openEdit(p)} style={{ background: "none", border: "1px solid var(--diamond-border)", color: "var(--accent-blue)", borderRadius: "8px", padding: "8px 12px", cursor: "pointer", fontSize: "13px" }}>
                            <i className="fas fa-pen"></i>
                          </button>
                          <button onClick={() => handleDelete(p.id)} style={{ background: "none", border: "1px solid var(--diamond-border)", color: "var(--accent-red)", borderRadius: "8px", padding: "8px 12px", cursor: "pointer", fontSize: "13px" }}>
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
