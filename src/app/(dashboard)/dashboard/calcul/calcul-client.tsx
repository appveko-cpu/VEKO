"use client";
import { useState, useMemo } from "react";
import { useDevise } from "@/context/DeviseContext";
import { useData } from "@/context/DataContext";
import { useToast } from "@/context/ToastContext";
import { useFelicitation } from "@/context/FelicitationContext";
import { useOnboarding } from "@/context/OnboardingContext";
import TooltipGuide from "@/components/onboarding/TooltipGuide";

type CalcMode = "fournisseur" | "production";

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: React.ReactNode }) {
  return (
    <div className="calc-field">
      <label className="calc-label">
        {label}
        {hint}
      </label>
      {children}
    </div>
  );
}

function ToggleBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: string; label: string }) {
  return (
    <button className={`toggle-btn ${active ? "active" : "inactive"}`} onClick={onClick} type="button">
      <i className={icon}></i>
      {label}
    </button>
  );
}

function fmt(n: number, d: string) {
  return n.toLocaleString("fr-FR") + " " + d;
}

export default function CalcClient() {
  const { deviseActuelle } = useDevise();
  const { addVente, ventes, produits } = useData();
  const { showToast } = useToast();
  const { showFelicitation } = useFelicitation();
  const { userProfile } = useOnboarding();

  const [mode, setMode] = useState<CalcMode>("fournisseur");
  const [selectedProduct, setSelectedProduct] = useState("");

  const [prixAchat, setPrixAchat] = useState("");
  const [nbArticles, setNbArticles] = useState("");
  const [fraisTransport, setFraisTransport] = useState("");

  const [coutMatieres, setCoutMatieres] = useState("");
  const [coutMainOeuvre, setCoutMainOeuvre] = useState("");
  const [autresFrais, setAutresFrais] = useState("");
  const [nbProduits, setNbProduits] = useState("");

  const [nomClient, setNomClient] = useState("");
  const [telClient, setTelClient] = useState("");
  const [nbPieces, setNbPieces] = useState("");
  const [prixVente, setPrixVente] = useState("");
  const [hasPub, setHasPub] = useState(false);
  const [budgetPub, setBudgetPub] = useState("0");
  const [devisePub, setDevisePub] = useState("");
  const [tauxPub, setTauxPub] = useState("1");
  const [fraisLivraisonClient, setFraisLivraisonClient] = useState("0");
  const [hasCommission, setHasCommission] = useState(false);
  const [commissionParPiece, setCommissionParPiece] = useState("0");
  const [saving, setSaving] = useState(false);

  const selectedProduit = produits.find(pr => pr.nom === selectedProduct);
  const stockDisponible = selectedProduit?.nb_articles ?? 0;

  function handleProductSelect(val: string) {
    setSelectedProduct(val);
    if (val) {
      const p = produits.find(pr => pr.nom === val);
      if (p) {
        setPrixAchat(String(p.prix_revient));
        setNbArticles(p.nb_articles !== undefined && p.nb_articles > 0 ? String(p.nb_articles) : "1");
        setFraisTransport(p.frais_transport !== undefined ? String(p.frais_transport) : "0");
        setPrixVente(String(p.prix_vente));
        if (p.commission > 0) {
          setHasCommission(true);
          setCommissionParPiece(String(p.commission));
        } else {
          setHasCommission(false);
          setCommissionParPiece("0");
        }
      }
    } else {
      setPrixAchat("");
      setNbArticles("");
      setFraisTransport("");
      setHasCommission(false);
      setCommissionParPiece("0");
    }
  }

  const isProductSelected = !!selectedProduct;
  const disabledStyle = { opacity: 0.6, cursor: "not-allowed", pointerEvents: "none" as const };

  const prixRevient = useMemo(() => {
    if (mode === "fournisseur") {
      const pa = parseFloat(prixAchat) || 0;
      const na = parseFloat(nbArticles) || 1;
      const ft = parseFloat(fraisTransport) || 0;
      if (pa <= 0) return 0;
      return (pa * na + ft) / na;
    } else {
      const cm = parseFloat(coutMatieres) || 0;
      const cmo = parseFloat(coutMainOeuvre) || 0;
      const af = parseFloat(autresFrais) || 0;
      const np = parseFloat(nbProduits) || 1;
      if (cm + cmo + af <= 0) return 0;
      return (cm + cmo + af) / np;
    }
  }, [mode, prixAchat, nbArticles, fraisTransport, coutMatieres, coutMainOeuvre, autresFrais, nbProduits]);

  const coutTotal = useMemo(() => {
    if (mode === "fournisseur") {
      const pa = parseFloat(prixAchat) || 0;
      const na = parseFloat(nbArticles) || 1;
      const ft = parseFloat(fraisTransport) || 0;
      return pa * na + ft;
    } else {
      return (parseFloat(coutMatieres) || 0) + (parseFloat(coutMainOeuvre) || 0) + (parseFloat(autresFrais) || 0);
    }
  }, [mode, prixAchat, nbArticles, fraisTransport, coutMatieres, coutMainOeuvre, autresFrais]);

  const devisePubActive = devisePub.trim().toUpperCase();
  const pubEstDifferente = devisePubActive !== "" && devisePubActive !== deviseActuelle;
  const tauxPubNum = parseFloat(tauxPub) || 1;
  const budgetPubBrut = parseFloat(budgetPub) || 0;
  const budgetPubConverti = pubEstDifferente ? budgetPubBrut * tauxPubNum : budgetPubBrut;
  const pubIsProvisoire = hasPub && budgetPubBrut === 0;

  const np_ = parseFloat(nbPieces) || 0;
  const pv_ = parseFloat(prixVente) || 0;

  const results = useMemo(() => {
    const np = parseFloat(nbPieces) || 0;
    const pv = parseFloat(prixVente) || 0;
    const bp = hasPub ? budgetPubConverti : 0;
    const flc = parseFloat(fraisLivraisonClient) || 0;
    const cpp = hasCommission ? parseFloat(commissionParPiece) || 0 : 0;
    const ca = np * pv;
    const coutAcquisition = np * prixRevient;
    const commissionTotale = np * cpp;
    const depensesTotales = coutAcquisition + commissionTotale + bp + flc;
    const benefice = ca - depensesTotales;
    const marge = ca > 0 ? (benefice / ca) * 100 : 0;
    return { ca, coutAcquisition, commissionTotale, depensesTotales, benefice, marge };
  }, [nbPieces, prixVente, prixRevient, hasPub, budgetPubConverti, fraisLivraisonClient, hasCommission, commissionParPiece]);

  const hasResults = prixRevient > 0 && np_ > 0 && pv_ > 0;

  function resetForm2() {
    setNomClient("");
    setTelClient("");
    setNbPieces("");
    setHasPub(false);
    setBudgetPub("0");
    setDevisePub("");
    setTauxPub("1");
    setFraisLivraisonClient("0");
    setHasCommission(false);
    setCommissionParPiece("0");
  }

  async function handleSaveVente() {
    if (!hasResults) return;
    setSaving(true);
    const isFirstVente = ventes.filter(v => !v.retournee).length === 0;
    const id = await addVente({
      date: new Date().toISOString(),
      nom_client: nomClient.trim(),
      tel: telClient.trim(),
      produit: selectedProduct.trim() || nomClient.trim() || "Vente",
      nb_pieces: np_,
      prix_vente: pv_,
      ca: results.ca,
      depenses: results.depensesTotales,
      benefice: results.benefice,
      marge: results.marge,
      budget_pub_provisoire: pubIsProvisoire,
      retournee: false,
    });
    setSaving(false);
    if (!id) {
      showToast("Erreur lors de l'enregistrement.", "error");
      return;
    }
    showToast("Vente enregistrée !", "success");
    if (isFirstVente) {
      showFelicitation("Première vente enregistrée ! Tu es sur la bonne voie 🚀");
    }
    resetForm2();
  }

  return (
    <div className="main-content">
      <div className="container">

        {/* ===== ETAPE 1 ===== */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <i className={mode === "fournisseur" ? "fas fa-truck" : "fas fa-industry"} style={{ color: "var(--accent-blue)", fontSize: "20px" }}></i>
            <span style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)" }}>
              {mode === "fournisseur" ? "ETAPE 1 : Calcul Fournisseur" : "ETAPE 1 : Calcul Production"}
            </span>
          </div>

          <div className="calc-field">
            <div className="toggle-group">
              <ToggleBtn active={mode === "fournisseur"} onClick={() => setMode("fournisseur")} icon="fas fa-truck" label="Fournisseur" />
              <ToggleBtn active={mode === "production"} onClick={() => setMode("production")} icon="fas fa-industry" label="Production" />
            </div>
          </div>

          <Field label="SÉLECTIONNER UN PRODUIT EXISTANT (OPTIONNEL)">
            <div style={{ position: "relative" }}>
              <select
                className="form-input"
                value={selectedProduct}
                onChange={(e) => handleProductSelect(e.target.value)}
                style={{ cursor: "pointer", paddingRight: "44px" }}
              >
                <option value="">-- Saisie manuelle --</option>
                {produits.map(p => (
                  <option key={p.id} value={p.nom}>{p.nom}</option>
                ))}
              </select>
              <i className="fas fa-chevron-down" style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }}></i>
            </div>
          </Field>

          {isProductSelected && (
            <div style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
              <i className="fas fa-box" style={{ color: "#8b5cf6", fontSize: "16px" }}></i>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)" }}>
                Stock disponible : <span style={{ color: stockDisponible > 0 ? "#22c55e" : "#ef4444", fontWeight: 900 }}>{stockDisponible} pièces</span>
              </span>
              <span style={{ marginLeft: "auto", fontSize: "11px", color: "var(--text-muted)" }}>
                (Champs pré-remplis)
              </span>
            </div>
          )}

          {mode === "fournisseur" ? (
            <div style={isProductSelected ? disabledStyle : {}}>
              <TooltipGuide
                id="calcul_prixachat"
                title="C'est ici que tout commence"
                message="Entrez le vrai cout total sorti de votre poche : prix d'achat + transport + tout le reste"
                icon="fas fa-hand-pointer"
                position="bottom"
              >
                <Field label={`PRIX D'ACHAT UNITAIRE (${deviseActuelle})`}>
                  <input className="form-input" type="number" min="0" value={prixAchat} onChange={(e) => setPrixAchat(e.target.value)} onWheel={(e) => (e.target as HTMLInputElement).blur()} placeholder="2500" disabled={isProductSelected} style={isProductSelected ? { background: "var(--dark-elevated)" } : {}} />
                </Field>
              </TooltipGuide>
              <Field label="NOMBRE D'ARTICLES EN STOCK">
                <input className="form-input" type="number" min="1" value={nbArticles} onChange={(e) => setNbArticles(e.target.value)} onWheel={(e) => (e.target as HTMLInputElement).blur()} placeholder="10" disabled={isProductSelected} style={isProductSelected ? { background: "var(--dark-elevated)" } : {}} />
              </Field>
              <Field label={`FRAIS DE LIVRAISON / TRANSPORT (${deviseActuelle})`}>
                <input className="form-input" type="number" min="0" value={fraisTransport} onChange={(e) => setFraisTransport(e.target.value)} onWheel={(e) => (e.target as HTMLInputElement).blur()} placeholder="5000" disabled={isProductSelected} style={isProductSelected ? { background: "var(--dark-elevated)" } : {}} />
              </Field>
            </div>
          ) : (
            <>
              <Field label={`COÛT DES MATIÈRES (${deviseActuelle})`}>
                <input className="form-input" type="number" min="0" value={coutMatieres} onChange={(e) => setCoutMatieres(e.target.value)} onWheel={(e) => (e.target as HTMLInputElement).blur()} placeholder="10000" />
              </Field>
              <Field label={`COÛT DE LA MAIN D'ŒUVRE (${deviseActuelle})`}>
                <input className="form-input" type="number" min="0" value={coutMainOeuvre} onChange={(e) => setCoutMainOeuvre(e.target.value)} onWheel={(e) => (e.target as HTMLInputElement).blur()} placeholder="5000" />
              </Field>
              <Field label={`AUTRES FRAIS (${deviseActuelle})`}>
                <input className="form-input" type="number" min="0" value={autresFrais} onChange={(e) => setAutresFrais(e.target.value)} onWheel={(e) => (e.target as HTMLInputElement).blur()} placeholder="2000" />
              </Field>
              <Field label="NOMBRE DE PRODUITS FABRIQUÉS">
                <input className="form-input" type="number" min="1" value={nbProduits} onChange={(e) => setNbProduits(e.target.value)} onWheel={(e) => (e.target as HTMLInputElement).blur()} placeholder="10" />
              </Field>
            </>
          )}

          {prixRevient > 0 && (
            <div style={{ background: "var(--dark-elevated)", borderRadius: "12px", padding: "14px 18px", marginTop: "4px", border: "1px solid var(--diamond-border)" }}>
              {coutTotal > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "10px", marginBottom: "10px", borderBottom: "1px solid var(--diamond-border)" }}>
                  <span style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 600 }}>Coût total</span>
                  <span style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-secondary)" }}>
                    {fmt(coutTotal, deviseActuelle)}
                  </span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 600 }}>Prix de revient unitaire</span>
                <span style={{ fontSize: "20px", fontWeight: 900, color: "var(--accent-blue)" }}>
                  {fmt(prixRevient, deviseActuelle)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ===== ETAPE 2 ===== */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <i className="fas fa-cart-shopping" style={{ color: "var(--accent-blue)", fontSize: "20px" }}></i>
            <span style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)" }}>
              ETAPE 2 : Calcul par Commande
            </span>
          </div>

          {prixRevient <= 0 && (
            <div style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px", fontSize: "13px", color: "var(--text-secondary)", fontWeight: 600 }}>
              <i className="fas fa-arrow-up" style={{ marginRight: "8px", color: "var(--accent-blue)" }}></i>
              Complétez d&apos;abord l&apos;Étape 1 pour voir les résultats
            </div>
          )}

          <Field label="NOM DU CLIENT (OPTIONNEL)">
            <input className="form-input" type="text" value={nomClient} onChange={(e) => setNomClient(e.target.value)} placeholder="Ex: Jean Dupont" />
          </Field>

          <Field label="TÉLÉPHONE DU CLIENT (OPTIONNEL)">
            <input className="form-input" type="tel" value={telClient} onChange={(e) => setTelClient(e.target.value)} placeholder="Ex: 6XX XXX XXX" />
          </Field>

          <Field label="NOMBRE DE PIÈCES COMMANDÉES">
            <input className="form-input" type="number" min="1" value={nbPieces} onChange={(e) => setNbPieces(e.target.value)} onWheel={(e) => (e.target as HTMLInputElement).blur()} placeholder="2" />
          </Field>

          <Field label={`PRIX DE VENTE UNITAIRE (${deviseActuelle})`}>
            <input className="form-input" type="number" min="0" value={prixVente} onChange={(e) => setPrixVente(e.target.value)} onWheel={(e) => (e.target as HTMLInputElement).blur()} placeholder="15000" />
          </Field>

          {userProfile.pubEnabled && (
            <TooltipGuide
              id="calcul_pub"
              title="Ce champ change tout votre benefice"
              message="Entrez votre budget pub total. VEKO le divise automatiquement sur vos ventes."
              icon="fas fa-lightbulb"
              position="bottom"
              secondaryAction="Je ne fais pas de pub"
              onSecondaryClick={() => setHasPub(false)}
              condition={hasPub}
            >
              <Field label="AVEZ-VOUS PAYÉ LA PUBLICITÉ (MÉTA, TIKTOK, ETC.) POUR CETTE COMMANDE ?">
                <div className="toggle-group">
                  <ToggleBtn active={hasPub} onClick={() => setHasPub(true)} icon="fas fa-rectangle-ad" label="Oui, j'ai payé" />
                  <ToggleBtn active={!hasPub} onClick={() => setHasPub(false)} icon="fas fa-xmark" label="Non, pas de pub" />
                </div>
              </Field>
            </TooltipGuide>
          )}

          {hasPub && (
            <div style={{
              background: "var(--dark-elevated)",
              border: "1px solid var(--diamond-border)",
              borderRadius: "12px",
              padding: "14px 16px",
              marginBottom: "16px",
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
              opacity: 0.7,
            }}>
              <i className="fas fa-clock" style={{ color: "#f59e0b", fontSize: "16px", marginTop: "2px", flexShrink: 0 }}></i>
              <span style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.5 }}>
                Le calcul sur le budget publicitaire se fait à la fin de la journée, il est à 0 provisoirement. N&apos;oubliez pas de le faire en fin de journée pour un calcul réel.
              </span>
            </div>
          )}

          {userProfile.livraisonEnabled && (
            <Field label={`FRAIS DE LIVRAISON AU CLIENT (${deviseActuelle})`}>
              <input className="form-input" type="number" min="0" value={fraisLivraisonClient} onChange={(e) => setFraisLivraisonClient(e.target.value)} onWheel={(e) => (e.target as HTMLInputElement).blur()} placeholder="0" />
            </Field>
          )}

          <Field label="AVEZ-VOUS QUELQU'UN QUI GÈRE VOS COMMANDES ?">
            <div className="toggle-group">
              <ToggleBtn active={hasCommission} onClick={() => setHasCommission(true)} icon="fas fa-user" label="Oui" />
              <ToggleBtn active={!hasCommission} onClick={() => setHasCommission(false)} icon="fas fa-user" label="Non, moi-même" />
            </div>
          </Field>

          {hasCommission && (
            <Field label={`COMMISSION PAR PIÈCE (${deviseActuelle})`}>
              <input className="form-input" type="number" min="0" value={commissionParPiece} onChange={(e) => setCommissionParPiece(e.target.value)} onWheel={(e) => (e.target as HTMLInputElement).blur()} placeholder="0" />
            </Field>
          )}

          {hasResults && (
            <div style={{ background: "var(--dark-elevated)", borderRadius: "14px", padding: "16px 20px", marginBottom: "20px", border: "1px solid var(--diamond-border)" }}>
              <div className="result-row">
                <span style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 600 }}>Chiffre d&apos;Affaires</span>
                <span style={{ fontSize: "16px", fontWeight: 800, color: "var(--accent-blue)" }}>{fmt(results.ca, deviseActuelle)}</span>
              </div>
              <div className="result-row">
                <span style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 600 }}>Coût d&apos;acquisition</span>
                <span style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-secondary)" }}>{fmt(results.coutAcquisition, deviseActuelle)}</span>
              </div>
              {hasCommission && results.commissionTotale > 0 && (
                <div className="result-row">
                  <span style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 600 }}>Commission totale</span>
                  <span style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-secondary)" }}>{fmt(results.commissionTotale, deviseActuelle)}</span>
                </div>
              )}
              {hasPub && results.depensesTotales > results.coutAcquisition && (
                <div className="result-row">
                  <span style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 600 }}>
                    Pub
                    {pubIsProvisoire && <span style={{ color: "#f97316", marginLeft: "6px", fontSize: "11px" }}>(provisoire)</span>}
                    {pubEstDifferente && <span style={{ color: "#a78bfa", marginLeft: "6px", fontSize: "11px" }}>(converti)</span>}
                  </span>
                  <span style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-secondary)" }}>{fmt(budgetPubConverti, deviseActuelle)}</span>
                </div>
              )}
              <div className="result-row">
                <span style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 600 }}>Dépenses totales</span>
                <span style={{ fontSize: "16px", fontWeight: 800, color: "var(--accent-red)" }}>{fmt(results.depensesTotales, deviseActuelle)}</span>
              </div>
              <div style={{ height: "1px", background: "var(--diamond-border)", margin: "4px 0" }}></div>
              <div className="result-row" style={{ paddingTop: "10px" }}>
                <span style={{ fontSize: "14px", color: "var(--text-primary)", fontWeight: 700 }}>Bénéfice Net</span>
                <span style={{ fontSize: "22px", fontWeight: 900, color: results.benefice >= 0 ? "var(--accent-green)" : "var(--accent-red)" }}>
                  {fmt(results.benefice, deviseActuelle)}
                </span>
              </div>
              {results.ca > 0 && (
                <div style={{ textAlign: "center", marginTop: "10px", fontSize: "12px", color: "var(--text-muted)" }}>
                  Marge : <span style={{ color: results.marge >= 0 ? "var(--accent-green)" : "var(--accent-red)", fontWeight: 700 }}>{results.marge.toFixed(1)}%</span>
                  {!hasPub && <span style={{ color: "var(--accent-green)", marginLeft: "10px", fontSize: "11px" }}> (définitif)</span>}
                  {pubIsProvisoire && <span style={{ color: "#f97316", marginLeft: "10px", fontSize: "11px" }}> (provisoire)</span>}
                </div>
              )}
            </div>
          )}

          {hasResults && (
            <TooltipGuide
              id="calcul_enregistrer"
              title="Pret a enregistrer votre vente ?"
              message="Tout le dashboard se mettra a jour en temps reel."
              icon="fas fa-target"
              position="top"
              primaryAction="OK, j'ai compris"
              condition={ventes.length === 0}
            >
              <button
                className="btn btn-primary"
                onClick={handleSaveVente}
                disabled={saving}
                style={{ width: "100%" }}
              >
                <i className={`fas ${saving ? "fa-spinner fa-spin" : "fa-floppy-disk"}`}></i>
                {saving ? "Enregistrement..." : "Enregistrer la vente"}
              </button>
            </TooltipGuide>
          )}
        </div>

      </div>
    </div>
  );
}
