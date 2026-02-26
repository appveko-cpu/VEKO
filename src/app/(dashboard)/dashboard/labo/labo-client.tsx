"use client";
import { useState, useMemo, useEffect } from "react";
import { useDevise } from "@/context/DeviseContext";
import TooltipGuide from "@/components/onboarding/TooltipGuide";

type SourceType = "local" | "import" | "production";
type SourceTypeNullable = SourceType | null;
type StaffMode = "seul" | "salaire" | "commission";

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

interface LabHistory {
  id: string;
  date: string;
  nomProduit: string;
  prixSouhaite: number;
  coutRevient: number;
  benefice: number;
  marge: number;
  calc?: CalcResult;
  conseil?: string;
  budgetPubJour?: number;
  devisePub?: string;
  deviseSysteme?: string;
  joursEpuisement?: number;
  tauxConversion?: number;
  hasPub?: boolean;
}

interface CalcResult {
  coutRevient: number;
  coutBase: number;
  transport: number;
  loyerParArticle: number;
  pubParArticle: number;
  comm: number;
  autres: number;
  chargesFixes: number;
  breakEven: number;
  securite: number;
  conseille: number;
  premium: number;
  benefice: number;
  marge: number;
  seuilRentab: number;
  ps: number;
  ob: number;
  pc: number;
  ok: boolean;
}

function fmt(n: number, d: string) {
  return n.toLocaleString("fr-FR") + " " + d;
}

function fmtRounded(n: number, d: string) {
  const rounded = Math.round(n);
  const exact = Math.round(n * 100) / 100;
  if (rounded === exact) {
    return rounded.toLocaleString("fr-FR") + " " + d;
  }
  return rounded.toLocaleString("fr-FR") + " " + d + " (" + exact.toLocaleString("fr-FR") + ")";
}

function genConseil(calc: CalcResult, devise: string): string {
  const parts: string[] = [];
  
  if (calc.marge >= 40) {
    parts.push(`EXCELLENT ! Avec une marge de ${Math.round(calc.marge)}% a ${fmt(Math.round(calc.ps), devise)}, votre strategie de prix est tres solide. Vous avez une marge de securite confortable pour absorber les imprevus (retours, casse, promotions) tout en degageant un bon benefice.`);
  } else if (calc.marge >= 30) {
    parts.push(`BONNE STRATEGIE ! A ${fmt(Math.round(calc.ps), devise)} avec ${Math.round(calc.marge)}% de marge, vous etes dans une zone de confort. Votre prix permet de couvrir vos frais avec une reserve pour les aleas du commerce.`);
  } else if (calc.marge >= 20) {
    parts.push(`STRATEGIE CORRECTE mais attention. Votre marge de ${Math.round(calc.marge)}% a ${fmt(Math.round(calc.ps), devise)} vous permet de fonctionner, mais elle reste fragile. Une promotion de 15% ou quelques retours pourraient vous mettre dans le rouge.`);
  } else if (calc.marge >= 10) {
    parts.push(`ATTENTION - MARGE SERREE ! Avec seulement ${Math.round(calc.marge)}% de marge, vous travaillez sur une corde raide. Le moindre imprévu (augmentation fournisseur, retour client, remise commerciale) vous fera perdre de l'argent.`);
  } else if (calc.marge > 0) {
    parts.push(`ALERTE ROUGE ! Votre marge de ${Math.round(calc.marge)}% est dangereusement basse. A ce niveau, vous ne gagnez presque rien et le moindre probleme vous coute de l'argent. Revoyez votre prix de vente ou negociez vos couts.`);
  } else {
    parts.push(`STOP - VOUS PERDEZ DE L'ARGENT ! A ${fmt(Math.round(calc.ps), devise)}, chaque vente vous coute ${fmt(Math.abs(Math.round(calc.benefice)), devise)}. C'est mathematiquement impossible de faire du profit ainsi. Augmentez votre prix ou reduisez vos couts immediatement.`);
  }

  if (calc.pc > 0) {
    const diff = ((calc.ps - calc.pc) / calc.pc) * 100;
    const diffAbs = Math.abs(diff);
    if (diff > 20) {
      parts.push(`\n\nCOMPARATIF CONCURRENCE : Votre prix est ${Math.round(diffAbs)}% plus cher que la concurrence (${fmt(Math.round(calc.pc), devise)}). A ce niveau d'ecart, vous devez imperativement justifier cette difference : qualite superieure, SAV exceptionnel, livraison plus rapide, packaging premium, ou marque reconnue. Sans argument fort, les clients iront voir ailleurs.`);
    } else if (diff > 10) {
      parts.push(`\n\nCOMPARATIF CONCURRENCE : Vous etes ${Math.round(diffAbs)}% au-dessus du marche (${fmt(Math.round(calc.pc), devise)}). C'est tenable si vous avez un avantage : meilleur service, garantie, ou valeur ajoutee percue. Sinon, ajustez pour rester competitif.`);
    } else if (diff > 0) {
      parts.push(`\n\nCOMPARATIF CONCURRENCE : Votre prix est legerement superieur (+${Math.round(diffAbs)}%) a la concurrence (${fmt(Math.round(calc.pc), devise)}). C'est acceptable, un bon argument commercial suffit.`);
    } else if (diff > -10) {
      parts.push(`\n\nCOMPARATIF CONCURRENCE : Bon positionnement ! Vous etes ${Math.round(diffAbs)}% moins cher que la concurrence (${fmt(Math.round(calc.pc), devise)}). Cet avantage prix peut favoriser le volume de ventes.`);
    } else {
      parts.push(`\n\nCOMPARATIF CONCURRENCE : Vous etes ${Math.round(diffAbs)}% moins cher que le marche (${fmt(Math.round(calc.pc), devise)}). Verifiez que vous ne bradez pas votre produit. Si votre marge reste correcte, c'est une strategie aggressive mais viable.`);
    }
  }

  if (calc.seuilRentab > 0) {
    parts.push(`\n\nOBJECTIF MINIMUM : Pour couvrir vos charges fixes et commencer a faire du profit, vous devez vendre au moins ${calc.seuilRentab} article${calc.seuilRentab > 1 ? 's' : ''} par mois. En dessous de ce seuil, vous perdez de l'argent meme si chaque vente semble rentable individuellement.`);
  }

  const verdictPositif = calc.marge >= 25 && (calc.pc === 0 || calc.ps <= calc.pc * 1.15);
  const verdictNegatif = calc.marge < 15 || (calc.pc > 0 && calc.ps > calc.pc * 1.25);
  
  if (verdictPositif) {
    parts.push(`\n\nVERDICT VEKO : Ce prix est VIABLE. Vous pouvez lancer votre produit avec confiance.`);
  } else if (verdictNegatif) {
    parts.push(`\n\nVERDICT VEKO : Ce prix presente des RISQUES. Nous vous conseillons de revoir votre strategie avant de lancer.`);
  } else {
    parts.push(`\n\nVERDICT VEKO : Ce prix est ACCEPTABLE mais surveillez de pres vos marges et ajustez si necessaire.`);
  }

  return parts.join("");
}

function Report({ calc, nomProduit, onBack, devise, budgetPubJour, devisePub, joursEpuisement, tauxConversion, hasPub }: { 
  calc: CalcResult; 
  nomProduit: string; 
  onBack: () => void; 
  devise: string;
  budgetPubJour?: number;
  devisePub?: string;
  joursEpuisement?: number;
  tauxConversion?: number;
  hasPub?: boolean;
}) {
  const ps_poche = calc.coutRevient + calc.ob;
  const marge_poche = ps_poche > 0 ? (calc.ob / ps_poche) * 100 : 0;
  const ps_equilibre = calc.coutRevient > 0 ? calc.coutRevient / 0.80 : 0;
  const benef_equilibre = ps_equilibre * 0.20;
  const poches_vs_concurrent = calc.pc > 0 && ps_poche > calc.pc;
  const isMargeBonne = calc.marge >= 25;
  const isMargeCorrecte = calc.marge >= 15 && calc.marge < 25;
  const conseil = genConseil(calc, devise);

  const scannerLines = [
    { label: "Prix acquisition / fabrication", val: calc.coutBase },
    { label: "Transport / article", val: calc.transport },
    { label: "Loyer / article", val: calc.loyerParArticle },
    { label: "Pub / article", val: calc.pubParArticle },
    { label: "Commission staff / vente", val: calc.comm },
    { label: "Autres frais", val: calc.autres },
  ].filter(l => l.val > 0);

  const gridQties = [5, 10, 20, 50, 100];

  const rowStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 20px",
    borderBottom: "1px solid var(--diamond-border)",
  };

  return (
    <div className="main-content">
      <div className="container">

        {/* ── HEADER ── */}
        <div style={{ marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" }}>
            <div style={{
              width: "52px", height: "52px", borderRadius: "16px",
              background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "24px", color: "white", flexShrink: 0,
            }}>
              <i className="fas fa-crosshairs"></i>
            </div>
            <div>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "2px" }}>OUTIL</div>
              <div style={{ fontSize: "22px", fontWeight: 900, color: "var(--text-primary)" }}>Fixateur de Prix</div>
            </div>
          </div>

          {/* Step bar — all done */}
          <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
            {[1, 2, 3].map((s, i) => (
              <div key={s} style={{ display: "flex", alignItems: "center", flex: i < 2 ? 1 : "none" }}>
                <div style={{
                  width: "40px", height: "40px", borderRadius: "50%", flexShrink: 0,
                  background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 800, fontSize: "14px", color: "white",
                  boxShadow: "0 4px 12px rgba(139,92,246,0.4)",
                }}>{s}</div>
                {i < 2 && (
                  <div style={{
                    flex: 1, height: "3px", margin: "0 6px",
                    background: "linear-gradient(90deg, #8b5cf6, #ec4899)",
                    borderRadius: "2px",
                  }}></div>
                )}
              </div>
            ))}
          </div>

          {/* Rapport title */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <i className="fas fa-chart-pie" style={{ color: "#8b5cf6", fontSize: "18px" }}></i>
            <span style={{ fontSize: "18px", fontWeight: 900, color: "var(--text-primary)" }}>Rapport Strategique</span>
          </div>
          <div style={{ fontSize: "13px", color: "var(--text-muted)", marginLeft: "28px" }}>
            Analyse complète pour <strong style={{ color: "var(--text-primary)" }}>{nomProduit}</strong>
          </div>
        </div>

        {/* ── 4 KPI CARDS ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
          <div style={{ background: "var(--dark-elevated)", borderRadius: "16px", padding: "18px" }}>
            <div style={{ fontSize: "9px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "8px" }}>COÛT DE REVIENT RÉEL</div>
            <div style={{ fontSize: "22px", fontWeight: 900, color: "#f97316", marginBottom: "6px" }}>{fmt(Math.round(calc.coutRevient), devise)}</div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Ce que le produit vous coûte vraiment</div>
          </div>
          <div style={{ background: "var(--dark-elevated)", borderRadius: "16px", padding: "18px" }}>
            <div style={{ fontSize: "9px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "8px" }}>PRIX SOUHAITE</div>
            <div style={{ fontSize: "22px", fontWeight: 900, color: "#3b82f6", marginBottom: "6px" }}>{fmt(Math.round(calc.ps), devise)}</div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Vous gagnez {fmt(Math.round(calc.benefice), devise)} par vente</div>
          </div>
          <div style={{ background: "var(--dark-elevated)", borderRadius: "16px", padding: "18px" }}>
            <div style={{ fontSize: "9px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "8px" }}>BÉNÉFICE / VENTE</div>
            <div style={{ fontSize: "22px", fontWeight: 900, color: calc.benefice >= 0 ? "#10b981" : "#ef4444", marginBottom: "6px" }}>{fmt(Math.round(calc.benefice), devise)}</div>
            <div style={{ fontSize: "11px", color: calc.benefice >= 0 ? "#10b981" : "#ef4444", fontWeight: 600 }}>Marge : {Math.round(calc.marge)}%</div>
          </div>
          <div style={{ background: "var(--dark-elevated)", borderRadius: "16px", padding: "18px" }}>
            <div style={{ fontSize: "9px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "8px" }}>PRIX CONCURRENT</div>
            {calc.pc > 0 ? (
              <>
                <div style={{ fontSize: "22px", fontWeight: 900, color: "#f59e0b", marginBottom: "6px" }}>{fmt(Math.round(calc.pc), devise)}</div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                  Marge possible : {fmt(Math.round(calc.pc - calc.coutRevient), devise)}
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-muted)", marginBottom: "6px" }}>Non renseigné</div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Pas de comparaison possible</div>
              </>
            )}
          </div>
        </div>

        {/* ── PRIX RÉALISTE BANNER ── */}
        {isMargeBonne && (
          <div style={{
            background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)",
            borderRadius: "14px", padding: "14px 18px", marginBottom: "16px",
            display: "flex", alignItems: "flex-start", gap: "10px",
          }}>
            <i className="fas fa-check-circle" style={{ color: "#10b981", fontSize: "16px", marginTop: "1px", flexShrink: 0 }}></i>
            <div>
              <div style={{ fontSize: "13px", fontWeight: 800, color: "#10b981", marginBottom: "4px" }}>Prix realiste</div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                Votre prix de {fmt(Math.round(calc.ps), devise)} vous laisse une bonne marge de {Math.round(calc.marge)}%. C&apos;est viable.
              </div>
            </div>
          </div>
        )}
        {isMargeCorrecte && (
          <div style={{
            background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)",
            borderRadius: "14px", padding: "14px 18px", marginBottom: "16px",
            display: "flex", alignItems: "flex-start", gap: "10px",
          }}>
            <i className="fas fa-exclamation-circle" style={{ color: "#f59e0b", fontSize: "16px", marginTop: "1px", flexShrink: 0 }}></i>
            <div>
              <div style={{ fontSize: "13px", fontWeight: 800, color: "#f59e0b", marginBottom: "4px" }}>Prix serré</div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                Votre prix de {fmt(Math.round(calc.ps), devise)} vous laisse une marge de {Math.round(calc.marge)}%. Viable mais fragile face aux imprévus.
              </div>
            </div>
          </div>
        )}
        {calc.marge < 15 && calc.ps > 0 && (
          <div style={{
            background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: "14px", padding: "14px 18px", marginBottom: "16px",
            display: "flex", alignItems: "flex-start", gap: "10px",
          }}>
            <i className="fas fa-times-circle" style={{ color: "#ef4444", fontSize: "16px", marginTop: "1px", flexShrink: 0 }}></i>
            <div>
              <div style={{ fontSize: "13px", fontWeight: 800, color: "#ef4444", marginBottom: "4px" }}>Prix insuffisant</div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                Votre prix de {fmt(Math.round(calc.ps), devise)} ne couvre pas vos frais correctement. Marge : {Math.round(calc.marge)}%.
              </div>
            </div>
          </div>
        )}

        {/* ── SCANNER DE COÛTS ── */}
        <div style={{ background: "var(--dark-elevated)", borderRadius: "16px", overflow: "hidden", marginBottom: "16px" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--diamond-border)", display: "flex", alignItems: "center", gap: "8px" }}>
            <i className="fas fa-search-dollar" style={{ color: "#8b5cf6", fontSize: "16px" }}></i>
            <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>Scanner de Coûts</span>
          </div>
          {scannerLines.map((line) => (
            <div key={line.label} style={rowStyle}>
              <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{line.label}</span>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{fmt(Math.round(line.val), devise)}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px" }}>
            <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>TOTAL (Cout reel)</span>
            <span style={{ fontSize: "16px", fontWeight: 900, color: "#ef4444" }}>{fmt(Math.round(calc.coutRevient), devise)}</span>
          </div>
        </div>

        {/* ── PROJECTION BUDGET PUBLICITAIRE ── */}
        {hasPub && budgetPubJour && budgetPubJour > 0 && (
          <div style={{ background: "var(--dark-elevated)", borderRadius: "16px", overflow: "hidden", marginBottom: "16px" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--diamond-border)", display: "flex", alignItems: "center", gap: "8px" }}>
              <i className="fas fa-bullhorn" style={{ color: "#ec4899", fontSize: "16px" }}></i>
              <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>Projection Budget Publicitaire</span>
            </div>
            <div style={{ padding: "16px 20px" }}>
              <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "14px", lineHeight: 1.6 }}>
                Voici le budget total a prevoir selon la duree de votre campagne publicitaire, avec un budget quotidien de <strong style={{ color: "#ec4899" }}>{budgetPubJour.toLocaleString("fr-FR")} {devisePub || devise}/jour</strong>.
              </div>
              {(() => {
                const periodes = [
                  { label: "1 semaine (7 jours)", jours: 7, isChosen: joursEpuisement === 7 },
                  { label: "2 semaines (14 jours)", jours: 14, isChosen: joursEpuisement === 14 },
                  { label: "1 mois (30 jours)", jours: 30, isChosen: joursEpuisement === 30 },
                ];
                if (joursEpuisement && joursEpuisement !== 7 && joursEpuisement !== 14 && joursEpuisement !== 30) {
                  periodes.unshift({ label: `Votre periode (${joursEpuisement} jours)`, jours: joursEpuisement, isChosen: true });
                }
                const sortedPeriodes = periodes.sort((a, b) => (b.isChosen ? 1 : 0) - (a.isChosen ? 1 : 0));
                return sortedPeriodes.map((period, i) => {
                  const totalDevise = budgetPubJour * period.jours;
                  const totalConverti = tauxConversion ? totalDevise * tauxConversion : totalDevise;
                  const showConversion = tauxConversion && tauxConversion !== 1 && devisePub !== devise;
                  const roundedTotal = Math.round(totalDevise);
                  const roundedConverti = Math.round(totalConverti);
                  return (
                    <div key={period.label} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                      padding: "14px 16px",
                      marginBottom: i < sortedPeriodes.length - 1 ? "8px" : "0",
                      background: period.isChosen ? "rgba(236,72,153,0.1)" : "var(--dark-card)",
                      border: period.isChosen ? "2px solid #ec4899" : "1px solid var(--diamond-border)",
                      borderRadius: "12px",
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "13px", fontWeight: period.isChosen ? 800 : 600, color: period.isChosen ? "#ec4899" : "var(--text-secondary)", marginBottom: "4px" }}>
                          {period.isChosen && <i className="fas fa-check-circle" style={{ marginRight: "6px" }}></i>}
                          {period.label}
                        </div>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.5 }}>
                          Si vous faites tourner votre pub pendant {period.jours} jours, prevoyez :
                        </div>
                      </div>
                      <div style={{ textAlign: "right", marginLeft: "12px" }}>
                        <div style={{ fontSize: "16px", fontWeight: 800, color: period.isChosen ? "#ec4899" : "var(--text-primary)" }}>
                          {roundedTotal.toLocaleString("fr-FR")} {devisePub || devise}
                          {roundedTotal !== totalDevise && <span style={{ fontSize: "11px", color: "var(--text-muted)" }}> ({totalDevise.toLocaleString("fr-FR")})</span>}
                        </div>
                        {showConversion && (
                          <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                            = {roundedConverti.toLocaleString("fr-FR")} {devise}
                            {roundedConverti !== totalConverti && <span> ({totalConverti.toLocaleString("fr-FR", { maximumFractionDigits: 0 })})</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        )}

        {/* ── GRILLE TARIFAIRE ── */}
        <div style={{ marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <i className="fas fa-tags" style={{ color: "#8b5cf6", fontSize: "16px" }}></i>
            <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>Grille Tarifaire</span>
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "14px", lineHeight: 1.5 }}>
            Voici les differents niveaux de prix possibles selon la marge que vous souhaitez atteindre :
          </div>
          {[
            { label: "Minimale (Seuil)", sub: "Prix = Cout de revient. Aucun benefice, juste pour ne pas perdre.", price: calc.breakEven, color: "#ef4444", marge: 0 },
            { label: "Prix Securite", sub: "Marge ~15%. Couvre les imprevus mineurs (quelques retours, petites remises).", price: calc.securite, color: "#f59e0b", marge: 15 },
            { label: "Prix Conseille", sub: "Marge ~35%. Equilibre ideal entre competitivite et rentabilite.", price: calc.conseille, color: "#10b981", marge: 35 },
            { label: "Prix Premium", sub: "Marge ~60%. Pour produits haut de gamme ou marques etablies.", price: calc.premium, color: "#8b5cf6", marge: 60 },
          ].map((tier) => {
            const rounded = Math.round(tier.price);
            const exact = Math.round(tier.price * 100) / 100;
            const showExact = rounded !== exact && tier.price > 0;
            return (
              <div key={tier.label} style={{
                background: "var(--dark-elevated)",
                borderLeft: `4px solid ${tier.color}`,
                borderRadius: "0 12px 12px 0",
                padding: "16px 20px",
                marginBottom: "8px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "13px", fontWeight: 800, color: tier.color, marginBottom: "3px" }}>{tier.label}</div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.4 }}>{tier.sub}</div>
                </div>
                <div style={{ textAlign: "right", marginLeft: "16px" }}>
                  <div style={{ fontSize: "20px", fontWeight: 900, color: tier.color, whiteSpace: "nowrap" }}>
                    {rounded.toLocaleString("fr-FR")} {devise}
                  </div>
                  {showExact && (
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                      ({exact.toLocaleString("fr-FR")})
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── POINT MORT ── */}
        {calc.seuilRentab > 0 && (
          <div style={{
            background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)",
            borderRadius: "16px", padding: "18px 20px", marginBottom: "16px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <i className="fas fa-crosshairs" style={{ color: "#3b82f6", fontSize: "15px" }}></i>
              <span style={{ fontSize: "14px", fontWeight: 800, color: "#3b82f6" }}>Point Mort (Seuil de Rentabilite)</span>
            </div>
            
            <div style={{ background: "rgba(59,130,246,0.1)", borderRadius: "12px", padding: "14px", marginBottom: "14px", textAlign: "center" }}>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "1px" }}>Objectif minimum mensuel</div>
              <div style={{ fontSize: "32px", fontWeight: 900, color: "#3b82f6" }}>{calc.seuilRentab}</div>
              <div style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 600 }}>article{calc.seuilRentab > 1 ? "s" : ""} a vendre</div>
            </div>

            <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "12px" }}>
              <strong style={{ color: "#3b82f6" }}>Qu&apos;est-ce que ca veut dire ?</strong><br />
              Vous avez des charges fixes mensuelles de <strong style={{ color: "var(--text-primary)" }}>{fmt(Math.round(calc.chargesFixes), devise)}</strong> (loyer, pub, etc.).
              Pour les couvrir avec un prix de vente de <strong style={{ color: "var(--text-primary)" }}>{fmt(Math.round(calc.ps), devise)}</strong>, 
              vous devez realiser <strong style={{ color: "#3b82f6" }}>{calc.seuilRentab} vente{calc.seuilRentab > 1 ? "s" : ""}</strong> par mois.
            </div>

            <div style={{ background: "var(--dark-elevated)", borderRadius: "10px", padding: "12px 14px", fontSize: "12px", lineHeight: 1.6 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "8px" }}>
                <i className="fas fa-arrow-down" style={{ color: "#ef4444", marginTop: "2px", flexShrink: 0 }}></i>
                <span style={{ color: "var(--text-secondary)" }}>
                  <strong style={{ color: "#ef4444" }}>En dessous de {calc.seuilRentab} ventes :</strong> Vous perdez de l&apos;argent car vos frais fixes ne sont pas couverts.
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                <i className="fas fa-arrow-up" style={{ color: "#10b981", marginTop: "2px", flexShrink: 0 }}></i>
                <span style={{ color: "var(--text-secondary)" }}>
                  <strong style={{ color: "#10b981" }}>Au-dela de {calc.seuilRentab} ventes :</strong> Chaque vente supplementaire genere un profit net de {fmt(Math.round(calc.benefice), devise)}.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── GRILLE DE BÉNÉFICES ── */}
        <div style={{ background: "var(--dark-elevated)", borderRadius: "16px", overflow: "hidden", marginBottom: "16px" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--diamond-border)", display: "flex", alignItems: "center", gap: "8px" }}>
            <i className="fas fa-table-cells" style={{ color: "#8b5cf6", fontSize: "15px" }}></i>
            <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>Grille de Bénéfices</span>
          </div>
          {gridQties.map((q, i) => {
            const benef = q * calc.benefice;
            const rentable = benef >= 0;
            return (
              <div key={q} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "14px 20px",
                borderBottom: i < gridQties.length - 1 ? "1px solid var(--diamond-border)" : "none",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                    Si vous vendez <strong style={{ color: "var(--text-primary)" }}>{q}</strong> articles
                  </span>
                  <span style={{
                    fontSize: "9px", fontWeight: 800, padding: "2px 8px", borderRadius: "4px",
                    background: rentable ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
                    color: rentable ? "#10b981" : "#ef4444",
                    border: `1px solid ${rentable ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
                    textTransform: "uppercase" as const,
                    letterSpacing: "0.5px",
                  }}>
                    {rentable ? "RENTABLE" : "EN PERTE"}
                  </span>
                </div>
                <span style={{ fontSize: "16px", fontWeight: 900, color: rentable ? "#10b981" : "#ef4444", whiteSpace: "nowrap" }}>
                  {fmt(Math.round(benef), devise)}
                </span>
              </div>
            );
          })}
        </div>

        {/* ── CONSEIL VEKO ── */}
        <div style={{
          background: "var(--dark-elevated)", borderRadius: "16px", padding: "20px", marginBottom: "16px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
            <div style={{
              width: "40px", height: "40px", borderRadius: "12px",
              background: "linear-gradient(135deg, #ec4899, #8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "18px", color: "white", flexShrink: 0,
            }}>
              <i className="fas fa-robot"></i>
            </div>
            <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>Conseil VEKO</span>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.7, margin: 0 }}>
            {conseil}
          </p>
        </div>

        {/* ── SCÉNARIOS DE VIE ── */}
        <div style={{ marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <i className="fas fa-lightbulb" style={{ color: "#8b5cf6", fontSize: "15px" }}></i>
            <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>Scénarios de Vie</span>
          </div>

          {/* Scénario ALIGNÉ */}
          {calc.pc > 0 && (
            <div style={{
              borderLeft: "4px solid #f59e0b", borderRadius: "0 12px 12px 0",
              background: "var(--dark-elevated)", padding: "16px 20px", marginBottom: "10px",
            }}>
              <div style={{ fontSize: "13px", fontWeight: 800, color: "#f59e0b", marginBottom: "8px" }}>
                Scénario ALIGNÉ (prix concurrent)
              </div>
              <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                En vous alignant a{" "}
                <strong style={{ color: "var(--text-primary)" }}>{fmt(Math.round(calc.pc), devise)}</strong>
                , votre benefice net serait de{" "}
                <strong style={{ color: calc.pc - calc.coutRevient >= 0 ? "#10b981" : "#ef4444" }}>
                  {fmt(Math.round(calc.pc - calc.coutRevient), devise)}
                </strong>
                {" "}par vente (marge {calc.pc > 0 ? Math.round(((calc.pc - calc.coutRevient) / calc.pc) * 100) : 0}%).
              </div>
            </div>
          )}

          {/* Scénario POCHE */}
          {calc.ob > 0 && (
            <div style={{
              borderLeft: "4px solid #10b981", borderRadius: "0 12px 12px 0",
              background: "var(--dark-elevated)", padding: "16px 20px", marginBottom: "10px",
            }}>
              <div style={{ fontSize: "13px", fontWeight: 800, color: "#10b981", marginBottom: "8px" }}>
                Scénario POCHE (votre objectif net)
              </div>
              <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                Pour garder{" "}
                <strong style={{ color: "var(--text-primary)" }}>{fmt(Math.round(calc.ob), devise)} net</strong>
                {" "}dans votre poche, vous devez vendre a{" "}
                <strong style={{ fontSize: "16px", color: "#10b981" }}>{fmt(Math.round(ps_poche), devise)}</strong>
                {" "}(marge {Math.round(marge_poche)}%).
              </div>
              {poches_vs_concurrent && (
                <div style={{ marginTop: "10px", fontSize: "11px", color: "#f59e0b", display: "flex", alignItems: "flex-start", gap: "6px" }}>
                  <i className="fas fa-exclamation-circle" style={{ marginTop: "1px", flexShrink: 0 }}></i>
                  <span>
                    Ce prix est au-dessus du concurrent ({fmt(Math.round(calc.pc), devise)}). Consultez les conseils de justification ci-dessous.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Scénario ÉQUILIBRE */}
          <div style={{
            borderLeft: "4px solid #3b82f6", borderRadius: "0 12px 12px 0",
            background: "var(--dark-elevated)", padding: "16px 20px",
          }}>
            <div style={{ fontSize: "13px", fontWeight: 800, color: "#3b82f6", marginBottom: "8px" }}>
              Scénario ÉQUILIBRE (+20% sécurité)
            </div>
            <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
              Pour couvrir tous vos frais avec{" "}
              <strong style={{ color: "var(--text-primary)" }}>20% de marge de securite</strong>
              {" "}pour les imprevus (retours, casse, remises), vendez a minimum{" "}
              <strong style={{ fontSize: "16px", color: "#3b82f6" }}>{fmt(Math.round(ps_equilibre), devise)}</strong>
              . Benefice net: {fmt(Math.round(benef_equilibre), devise)}/vente.
            </div>
          </div>
        </div>

        {/* ── COMMENT JUSTIFIER UN PRIX PLUS HAUT ── */}
        <div style={{ background: "var(--dark-elevated)", borderRadius: "16px", padding: "20px", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <span style={{ fontSize: "18px" }}>💗</span>
            <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>Comment justifier un prix plus haut ?</span>
          </div>
          {[
            { emoji: "🚚", text: "Offrez la livraison gratuite pour justifier le prix et eliminer une friction d'achat." },
            { emoji: "🎁", text: "Ameliorez le packaging : un emballage premium augmente la valeur percue de 20 a 40%." },
            { emoji: "🎧", text: "Misez sur le SAV : un suivi client exceptionnel (WhatsApp, echange rapide) fidélise et justifie un prix plus eleve." },
            { emoji: "🎀", text: "Ajoutez un bonus ou cadeau : un petit extra surprise cree un effet \"wow\" qui desactive la comparaison de prix." },
            { emoji: "🌸", text: "Creez une marque / identite forte : les clients paient plus cher pour une marque en qui ils ont confiance." },
            { emoji: "🕐", text: "Proposez une livraison express : la rapidite est un argument de vente puissant que vos concurrents n'ont peut-etre pas." },
          ].map((item, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "flex-start", gap: "12px",
              padding: "10px 0",
              borderBottom: i < 5 ? "1px solid var(--diamond-border)" : "none",
            }}>
              <span style={{ fontSize: "20px", flexShrink: 0, lineHeight: 1.4 }}>{item.emoji}</span>
              <span style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>{item.text}</span>
            </div>
          ))}
        </div>

        {/* ── NOUVELLE ANALYSE BUTTON ── */}
        <button
          onClick={onBack}
          style={{
            width: "100%",
            padding: "18px",
            background: "var(--dark-elevated)",
            border: "1px solid var(--diamond-border)",
            borderRadius: "16px",
            color: "var(--text-primary)",
            fontSize: "16px",
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            marginBottom: "80px",
            fontFamily: "var(--font-inter), sans-serif",
          }}
        >
          <i className="fas fa-rotate-right"></i>
          Nouvelle analyse
        </button>
      </div>
    </div>
  );
}

export default function LaboClient() {
  const { deviseActuelle } = useDevise();

  const [step, setStep] = useState(1);
  const [showReport, setShowReport] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedHistoryEntry, setSelectedHistoryEntry] = useState<LabHistory | null>(null);
  const [history, setHistory] = useState<LabHistory[]>([]);

  const [nomProduit, setNomProduit] = useState("");
  const [prixSouhaite, setPrixSouhaite] = useState("");
  const [objectifBenefice, setObjectifBenefice] = useState("");
  const [prixConcurrent, setPrixConcurrent] = useState("");
  const [neSaitPas, setNeSaitPas] = useState(false);

  const [source, setSource] = useState<SourceTypeNullable>(null);
  const [prixAchatLocal, setPrixAchatLocal] = useState("");
  const [transportMode, setTransportMode] = useState<"gratuit" | "paye">("gratuit");
  const [localTransportMontant, setLocalTransportMontant] = useState("");
  const [localTransportNb, setLocalTransportNb] = useState("");
  const [importMode, setImportMode] = useState<"global" | "detail" | null>(null);
  const [importCoutGlobal, setImportCoutGlobal] = useState("");
  const [importNbGlobal, setImportNbGlobal] = useState("");
  const [importPrixUnit, setImportPrixUnit] = useState("");
  const [importFraisLog, setImportFraisLog] = useState("");
  const [importNbDetail, setImportNbDetail] = useState("");
  const [prodCoutMateriaux, setProdCoutMateriaux] = useState("");
  const [facturerTemps, setFacturerTemps] = useState(false);
  const [prodHeures, setProdHeures] = useState("");
  const [prodPrixHeure, setProdPrixHeure] = useState("");

  const [canalPhysique, setCanalPhysique] = useState(false);
  const [canalEnLigne, setCanalEnLigne] = useState(true);
  const [hasLoyer, setHasLoyer] = useState(false);
  const [loyerMensuel, setLoyerMensuel] = useState("");
  const [seulProduit, setSeulProduit] = useState<boolean | null>(null);
  const [nbArticlesMois, setNbArticlesMois] = useState("");
  const [neSaitPasVolumeBoutique, setNeSaitPasVolumeBoutique] = useState(false);
  const [palierLoyer, setPalierLoyer] = useState("");
  const [pctLoyer, setPctLoyer] = useState("");
  const [pubMode, setPubMode] = useState<"pub" | "organique" | null>(null);
  const [budgetPub, setBudgetPub] = useState("");
  const [neSaitPasBudget, setNeSaitPasBudget] = useState(false);
  const [budgetPubJour, setBudgetPubJour] = useState("");
  const [devisePubLabo, setDevisePubLabo] = useState("");
  const [dureeEpuisement, setDureeEpuisement] = useState<"1sem" | "1mois" | "2mois" | "perso" | null>(null);
  const [dureePerso, setDureePerso] = useState("");
  const [staffMode, setStaffMode] = useState<StaffMode>("seul");
  const [salaireMensuel, setSalaireMensuel] = useState("");
  const [commission, setCommission] = useState("");
  const [autresFrais, setAutresFrais] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("veko_labo_history");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  function resetAllFields() {
    setNomProduit(""); setPrixSouhaite(""); setObjectifBenefice(""); setPrixConcurrent(""); setNeSaitPas(false);
    setSource(null); setPrixAchatLocal(""); setTransportMode("gratuit"); setLocalTransportMontant(""); setLocalTransportNb("");
    setImportMode(null); setImportCoutGlobal(""); setImportNbGlobal(""); setImportPrixUnit(""); setImportFraisLog(""); setImportNbDetail("");
    setProdCoutMateriaux(""); setFacturerTemps(false); setProdHeures(""); setProdPrixHeure("");
    setCanalPhysique(false); setCanalEnLigne(true); setHasLoyer(false); setLoyerMensuel("");
    setSeulProduit(null); setNbArticlesMois(""); setNeSaitPasVolumeBoutique(false); setPalierLoyer(""); setPctLoyer("");
    setPubMode(null); setBudgetPub(""); setNeSaitPasBudget(false); setBudgetPubJour(""); setDevisePubLabo("");
    setDureeEpuisement(null); setDureePerso(""); setStaffMode("seul"); setSalaireMensuel(""); setCommission(""); setAutresFrais("");
  }

  const devisePubLaboActive = devisePubLabo.trim().toUpperCase() || deviseActuelle;
  const pubEstDifferenteLabo = devisePubLabo.trim() !== "" && devisePubLabo.trim().toUpperCase() !== deviseActuelle;
  const tauxPubLaboNum = TAUX_BASE_FCFA[devisePubLaboActive] || 1;
  const tauxSysteme = TAUX_BASE_FCFA[deviseActuelle] || 1;
  const tauxConversion = tauxSysteme > 0 ? tauxPubLaboNum / tauxSysteme : tauxPubLaboNum;
  
  const joursEpuisementCalc = dureeEpuisement === "1sem" ? 7 
    : dureeEpuisement === "1mois" ? 30 
    : dureeEpuisement === "2mois" ? 60 
    : parseFloat(dureePerso) || 30;
  
  const budgetPubJourNum = parseFloat(budgetPubJour) || 0;
  const budgetPubTotalNum = parseFloat(budgetPub) || 0;
  const budgetPubBrutLabo = neSaitPasBudget ? budgetPubJourNum * joursEpuisementCalc : budgetPubTotalNum;
  const budgetPubConvertiLabo = pubEstDifferenteLabo ? budgetPubBrutLabo * tauxConversion : budgetPubBrutLabo;

  function saveToHistory(calcResult: CalcResult) {
    const conseil = genConseil(calcResult, deviseActuelle);
    const hasPub = pubMode === "pub";
    const entry: LabHistory = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      nomProduit,
      prixSouhaite: calcResult.ps,
      coutRevient: calcResult.coutRevient,
      benefice: calcResult.benefice,
      marge: calcResult.marge,
      calc: calcResult,
      conseil,
      hasPub,
      budgetPubJour: hasPub ? (neSaitPasBudget ? budgetPubJourNum : budgetPubTotalNum / joursEpuisementCalc) : undefined,
      devisePub: hasPub ? devisePubLaboActive : undefined,
      deviseSysteme: deviseActuelle,
      joursEpuisement: hasPub ? joursEpuisementCalc : undefined,
      tauxConversion: hasPub && pubEstDifferenteLabo ? tauxConversion : undefined,
    };
    const updated = [entry, ...history].slice(0, 20);
    setHistory(updated);
    localStorage.setItem("veko_labo_history", JSON.stringify(updated));
  }


  const calc = useMemo<CalcResult>(() => {
    const ps = parseFloat(prixSouhaite) || 0;
    const ob = parseFloat(objectifBenefice) || 0;
    const pc = parseFloat(prixConcurrent) || 0;

    let coutBase = 0;
    let transport = 0;

    if (source === "local") {
      coutBase = parseFloat(prixAchatLocal) || 0;
      if (transportMode === "paye") {
        const montant = parseFloat(localTransportMontant) || 0;
        const nb = parseFloat(localTransportNb) || 1;
        transport = montant / nb;
      }
    } else if (source === "import") {
      if (importMode === "global") {
        const cout = parseFloat(importCoutGlobal) || 0;
        const nb = parseFloat(importNbGlobal) || 1;
        coutBase = cout / nb;
      } else if (importMode === "detail") {
        const prixUnit = parseFloat(importPrixUnit) || 0;
        const fraisLog = parseFloat(importFraisLog) || 0;
        const nb = parseFloat(importNbDetail) || 1;
        coutBase = prixUnit + fraisLog / nb;
      }
    } else if (source === "production") {
      const mat = parseFloat(prodCoutMateriaux) || 0;
      const temps = facturerTemps ? (parseFloat(prodHeures) || 0) * (parseFloat(prodPrixHeure) || 0) : 0;
      coutBase = mat + temps;
    }

    const loyer = parseFloat(loyerMensuel) || 0;
    const loyerParArticle = (() => {
      if (!canalPhysique || !hasLoyer || loyer === 0) return 0;
      if (seulProduit === true) {
        if (neSaitPasVolumeBoutique) return 0;
        const nb = parseFloat(nbArticlesMois) || 50;
        return loyer / nb;
      } else if (seulProduit === false) {
        if (palierLoyer && palierLoyer !== "sait-pas") {
          return loyer / (parseInt(palierLoyer) || 20);
        } else if (palierLoyer === "sait-pas" && pctLoyer) {
          return loyer * (parseFloat(pctLoyer) / 100);
        }
      }
      return 0;
    })();

    const hasPubActive = pubMode === "pub";
    const joursEpuisement = dureeEpuisement === "1sem" ? 7 
      : dureeEpuisement === "1mois" ? 30 
      : dureeEpuisement === "2mois" ? 60 
      : parseFloat(dureePerso) || 30;
    const nbArtEstime = Math.ceil(joursEpuisement * 1.5);
    const pubMois = hasPubActive ? budgetPubConvertiLabo : 0;
    const pubParArticle = hasPubActive ? pubMois / Math.max(nbArtEstime, 1) : 0;

    const staffSalaire = (() => {
      if (staffMode !== "salaire") return 0;
      const sal = parseFloat(salaireMensuel) || 0;
      const vol = canalEnLigne ? nbArtEstime : (parseFloat(nbArticlesMois) || 50);
      return sal / vol;
    })();
    const staffComm = staffMode === "commission" ? (parseFloat(commission) || 0) : 0;
    const comm = staffComm + staffSalaire;
    const autres = parseFloat(autresFrais) || 0;

    const coutRevient = coutBase + transport + loyerParArticle + pubParArticle + comm + autres;
    const loyerFixe = (canalPhysique && hasLoyer && loyer > 0 && (neSaitPasVolumeBoutique || palierLoyer === "sait-pas"))
      ? loyer * (palierLoyer === "sait-pas" && pctLoyer ? parseFloat(pctLoyer) / 100 : 1)
      : 0;
    const chargesFixes = loyerFixe + pubMois;

    const breakEven = coutRevient;
    const securite = coutRevient > 0 ? coutRevient / 0.85 : 0;
    const conseille = coutRevient > 0 ? coutRevient / 0.65 : 0;
    const premium = coutRevient > 0 ? coutRevient / 0.40 : 0;

    const benefice = ps - coutRevient;
    const marge = ps > 0 ? (benefice / ps) * 100 : 0;

    const benefSansFixe = ps - (coutBase + transport + comm + autres);
    const seuilRentab = chargesFixes > 0 && benefSansFixe > 0 ? Math.ceil(chargesFixes / benefSansFixe) : 0;

    return {
      coutRevient, coutBase, transport, loyerParArticle, pubParArticle, comm, autres,
      chargesFixes, breakEven, securite, conseille, premium,
      benefice, marge, seuilRentab, ps, ob, pc,
      ok: coutRevient > 0 && ps > 0,
    };
  }, [
    prixSouhaite, objectifBenefice, prixConcurrent,
    source, prixAchatLocal, transportMode, localTransportMontant, localTransportNb,
    importMode, importCoutGlobal, importNbGlobal, importPrixUnit, importFraisLog, importNbDetail,
    prodCoutMateriaux, facturerTemps, prodHeures, prodPrixHeure,
    canalPhysique, canalEnLigne, hasLoyer, loyerMensuel, seulProduit,
    nbArticlesMois, neSaitPasVolumeBoutique, palierLoyer, pctLoyer,
    pubMode, budgetPubConvertiLabo, dureeEpuisement, dureePerso,
    staffMode, salaireMensuel, commission, autresFrais,
  ]);

  const canProceed1 = nomProduit.trim() !== "" && prixSouhaite !== "" && objectifBenefice !== "";
  const canProceed2 = source === "local"
    ? prixAchatLocal !== "" && (transportMode === "gratuit" || (localTransportMontant !== "" && localTransportNb !== ""))
    : source === "import"
    ? importMode === "global"
      ? importCoutGlobal !== "" && importNbGlobal !== ""
      : importMode === "detail"
      ? importPrixUnit !== "" && importNbDetail !== ""
      : false
    : source === "production"
    ? prodCoutMateriaux !== "" && (!facturerTemps || (prodHeures !== "" && prodPrixHeure !== ""))
    : false;

  if (showReport) {
    const hasPubReport = pubMode === "pub";
    const budgetPubJourReport = hasPubReport ? (neSaitPasBudget ? budgetPubJourNum : budgetPubTotalNum / joursEpuisementCalc) : undefined;
    return (
      <Report 
        calc={calc} 
        nomProduit={nomProduit} 
        onBack={() => { saveToHistory(calc); resetAllFields(); setShowReport(false); setStep(1); }} 
        devise={deviseActuelle}
        hasPub={hasPubReport}
        budgetPubJour={budgetPubJourReport}
        devisePub={hasPubReport ? devisePubLaboActive : undefined}
        joursEpuisement={hasPubReport ? joursEpuisementCalc : undefined}
        tauxConversion={hasPubReport && pubEstDifferenteLabo ? tauxConversion : undefined}
      />
    );
  }

  return (
    <div className="main-content">
      <div className="container">
        {/* ── HERO ── */}
        <div style={{
          background: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
          borderRadius: "20px", padding: "24px", marginBottom: "24px", position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: "-20px", right: "-20px", fontSize: "80px", opacity: 0.1 }}>
            <i className="fas fa-flask"></i>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "14px", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{
                width: "50px", height: "50px", borderRadius: "14px",
                background: "rgba(255,255,255,0.2)", display: "flex",
                alignItems: "center", justifyContent: "center", fontSize: "24px", color: "white",
              }}>
                <i className="fas fa-flask"></i>
              </div>
              <div>
                <TooltipGuide
                  id="labo_intro"
                  title="Le Laboratoire des Prix"
                  message="Simulez votre produit en 3 étapes : vision, acquisition, charges. Obtenez le prix optimal et le seuil de rentabilité avant de vendre."
                  icon="fas fa-flask"
                  position="bottom"
                >
                  <div style={{ fontSize: "20px", fontWeight: 900, color: "white" }}>Laboratoire des Prix</div>
                </TooltipGuide>
                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", marginTop: "2px" }}>
                  Calcule le prix optimal de ton produit
                </div>
              </div>
            </div>
            <button onClick={() => setShowHistory(true)} style={{ background: "white", border: "none", borderRadius: "12px", padding: "12px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", color: "#8b5cf6", fontSize: "13px", fontWeight: 800, boxShadow: "0 4px 15px rgba(0,0,0,0.2)" }}>
              <i className="fas fa-clock-rotate-left"></i>
              Historique
            </button>
          </div>
        </div>

        {/* ── RAPPORT DEPUIS HISTORIQUE (PLEIN ECRAN) ── */}
        {selectedHistoryEntry && selectedHistoryEntry.calc && (
          <div style={{ 
            position: "fixed", 
            inset: 0, 
            zIndex: 10001, 
            background: "var(--dark-bg, #0a0a0f)", 
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
          }}>
            <div style={{ 
              position: "sticky",
              top: 0,
              zIndex: 10,
              background: "var(--dark-card)",
              borderBottom: "1px solid var(--diamond-border)",
              padding: "12px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <i className="fas fa-clock-rotate-left" style={{ color: "#8b5cf6", fontSize: "16px" }}></i>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
                  {selectedHistoryEntry.nomProduit}
                </span>
                <span style={{ fontSize: "11px", color: "var(--text-muted)", background: "var(--dark-elevated)", padding: "4px 8px", borderRadius: "6px" }}>
                  {new Date(selectedHistoryEntry.date).toLocaleDateString("fr-FR")}
                </span>
              </div>
              <button 
                onClick={() => setSelectedHistoryEntry(null)} 
                style={{ 
                  background: "var(--dark-elevated)", 
                  border: "1px solid var(--diamond-border)", 
                  borderRadius: "10px", 
                  padding: "8px 14px", 
                  cursor: "pointer", 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "6px",
                  color: "var(--text-secondary)",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                <i className="fas fa-xmark"></i>
                Fermer
              </button>
            </div>
            <div style={{ flex: 1 }}>
              <Report
                calc={selectedHistoryEntry.calc}
                nomProduit={selectedHistoryEntry.nomProduit}
                onBack={() => setSelectedHistoryEntry(null)}
                devise={selectedHistoryEntry.deviseSysteme || deviseActuelle}
                hasPub={selectedHistoryEntry.hasPub}
                budgetPubJour={selectedHistoryEntry.budgetPubJour}
                devisePub={selectedHistoryEntry.devisePub}
                joursEpuisement={selectedHistoryEntry.joursEpuisement}
                tauxConversion={selectedHistoryEntry.tauxConversion}
              />
            </div>
          </div>
        )}

        {/* ── MODAL HISTORIQUE ── */}
        {showHistory && !selectedHistoryEntry && (
          <div style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
            <div style={{ width: "100%", maxWidth: "420px", background: "var(--dark-card)", borderRadius: "20px", padding: "24px", border: "1px solid var(--diamond-border)", maxHeight: "80vh", overflow: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)" }}>
                  <i className="fas fa-clock-rotate-left" style={{ marginRight: "8px", color: "#8b5cf6" }}></i>
                  Historique des analyses
                </div>
                <button onClick={() => setShowHistory(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", color: "var(--text-muted)" }}>
                  <i className="fas fa-xmark"></i>
                </button>
              </div>
              {history.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)" }}>
                  <i className="fas fa-flask" style={{ fontSize: "40px", opacity: 0.3, marginBottom: "12px", display: "block" }}></i>
                  Aucune analyse enregistree
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {history.map(h => (
                    <div key={h.id} style={{ background: "var(--dark-elevated)", borderRadius: "14px", padding: "16px", borderLeft: `4px solid ${h.marge >= 25 ? "#10b981" : h.marge >= 15 ? "#f59e0b" : "#ef4444"}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                        <span style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "15px" }}>{h.nomProduit}</span>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)", background: "var(--dark-card)", padding: "4px 8px", borderRadius: "6px" }}>{new Date(h.date).toLocaleDateString("fr-FR")}</span>
                      </div>
                      <div style={{ display: "flex", gap: "16px", fontSize: "12px", marginBottom: "12px" }}>
                        <span style={{ color: "var(--text-muted)" }}>Prix: <span style={{ color: "#3b82f6", fontWeight: 700 }}>{fmt(h.prixSouhaite, deviseActuelle)}</span></span>
                        <span style={{ color: "var(--text-muted)" }}>Benef: <span style={{ color: h.benefice >= 0 ? "#10b981" : "#ef4444", fontWeight: 700 }}>{fmt(h.benefice, deviseActuelle)}</span></span>
                        <span style={{ color: "var(--text-muted)" }}>Marge: <span style={{ color: h.marge >= 25 ? "#10b981" : h.marge >= 15 ? "#f59e0b" : "#ef4444", fontWeight: 700 }}>{Math.round(h.marge)}%</span></span>
                      </div>
                      {h.calc && (
                        <button
                          onClick={() => { setSelectedHistoryEntry(h); setShowHistory(false); }}
                          style={{ width: "100%", padding: "10px", background: "linear-gradient(135deg, #8b5cf6, #ec4899)", border: "none", borderRadius: "10px", cursor: "pointer", color: "white", fontSize: "12px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                        >
                          <i className="fas fa-file-lines"></i>
                          Revoir le rapport complet
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── STEP BAR ── */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: "8px", padding: "0 8px" }}>
          {[1, 2, 3].map((s, i) => (
            <div key={s} style={{ display: "flex", alignItems: "center", flex: i < 2 ? 1 : "none" }}>
              <div style={{
                width: "40px", height: "40px", borderRadius: "50%", flexShrink: 0,
                background: step >= s ? "linear-gradient(135deg, #8b5cf6, #ec4899)" : "var(--dark-elevated)",
                border: step >= s ? "none" : "2px solid var(--diamond-border)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 800, fontSize: "14px",
                color: step >= s ? "white" : "var(--text-muted)",
                transition: "all 0.3s",
                boxShadow: step >= s ? "0 4px 15px rgba(139,92,246,0.4)" : "none",
              }}>
                {step > s ? <i className="fas fa-check" style={{ fontSize: "12px" }}></i> : s}
              </div>
              {i < 2 && (
                <div style={{
                  flex: 1, height: "3px", margin: "0 6px",
                  background: step > s ? "linear-gradient(90deg, #8b5cf6, #ec4899)" : "var(--dark-elevated)",
                  borderRadius: "2px", transition: "all 0.3s",
                }}></div>
              )}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px" }}>
          {[
            { label: "La Vision", sub: "Prix & objectifs" },
            { label: "Acquisition", sub: "Source produit" },
            { label: "Les Charges", sub: "Coûts fixes" },
          ].map((item, i) => (
            <div key={i} style={{ textAlign: i === 1 ? "center" : i === 2 ? "right" : "left", flex: 1 }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: step === i + 1 ? "white" : "var(--text-muted)", transition: "all 0.3s" }}>
                {item.label}
              </div>
              <div style={{ fontSize: "9px", color: "var(--text-muted)" }}>{item.sub}</div>
            </div>
          ))}
        </div>

        {/* ── STEP 1 ── */}
        {step === 1 && (
          <div className="glass-card">
            <StepHeader icon="fa-eye" gradient="linear-gradient(135deg,#8b5cf6,#ec4899)" title="La Vision" sub="Définis ton objectif commercial" />

            <Field label="Nom du produit *">
              <input className="form-input" placeholder="Ex: Sac à main cuir marron" value={nomProduit} onChange={e => setNomProduit(e.target.value)} />
            </Field>

            <Field label={`Prix de vente souhaité (${deviseActuelle}) *`}>
              <input className="form-input" type="number" placeholder="Ex: 14500" value={prixSouhaite} onChange={e => setPrixSouhaite(e.target.value)} />
            </Field>

            <Field label={`Objectif bénéfice net par pièce (${deviseActuelle}) *`}>
              <input className="form-input" type="number" placeholder="Ex: 5000" value={objectifBenefice} onChange={e => setObjectifBenefice(e.target.value)} />
            </Field>

            <div className="calc-field">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <label className="calc-label" style={{ margin: 0 }}>Prix concurrent ({deviseActuelle})</label>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                  <input type="checkbox" checked={neSaitPas} onChange={e => setNeSaitPas(e.target.checked)} style={{ accentColor: "#8b5cf6" }} />
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Je ne sais pas</span>
                </label>
              </div>
              <input
                className="form-input" type="number" placeholder="Prix vendu par tes concurrents"
                value={prixConcurrent} onChange={e => setPrixConcurrent(e.target.value)}
                disabled={neSaitPas} style={{ opacity: neSaitPas ? 0.4 : 1 }}
              />
              {!neSaitPas && prixConcurrent && calc.ps > 0 && (
                <div style={{
                  marginTop: "8px", padding: "8px 12px", borderRadius: "8px",
                  background: calc.ps <= calc.pc ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                  border: `1px solid ${calc.ps <= calc.pc ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`,
                  fontSize: "11px", color: calc.ps <= calc.pc ? "#10b981" : "#ef4444",
                }}>
                  <i className={`fas fa-${calc.ps <= calc.pc ? "check" : "exclamation"}-circle`} style={{ marginRight: "6px" }}></i>
                  {calc.ps <= calc.pc
                    ? `Compétitif — ${fmt(Math.round(calc.pc - calc.ps), deviseActuelle)} moins cher que la concurrence`
                    : `Attention — ${fmt(Math.round(calc.ps - calc.pc), deviseActuelle)} plus cher que la concurrence`}
                </div>
              )}
            </div>

            <button
              className="btn btn-primary"
              style={{ background: "linear-gradient(135deg,#8b5cf6,#ec4899)", marginTop: "8px" }}
              onClick={() => setStep(2)} disabled={!canProceed1}
            >
              Suivant — Source d&apos;Acquisition <i className="fas fa-arrow-right"></i>
            </button>
          </div>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <div className="glass-card">
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "4px" }}>
                <i className="fas fa-boxes" style={{ color: "#8b5cf6", marginRight: "6px" }}></i>Étape 2 : La Source d&apos;Acquisition
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                Comment vous procurez-vous <strong style={{ color: "var(--text-primary)" }}>{nomProduit}</strong> ?
              </div>
            </div>

            {/* Radio options */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
              {([
                { id: "local" as SourceType, icon: "fa-store", iconColor: "var(--accent-blue, #3b82f6)", label: "Achat Local", sub: "Revendeur local, marché, boutique" },
                { id: "import" as SourceType, icon: "fa-plane", iconColor: "var(--accent-orange, #f59e0b)", label: "Importation", sub: "International, Chine, Turquie, Dubai..." },
                { id: "production" as SourceType, icon: "fa-hammer", iconColor: "var(--accent-purple, #8b5cf6)", label: "Production / Fabrication", sub: "Fait main, atelier, confection" },
              ]).map(opt => {
                const active = source === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSource(opt.id)}
                    style={{
                      display: "flex", alignItems: "center", gap: "12px",
                      padding: "14px 16px",
                      background: active ? "linear-gradient(135deg, rgba(139,92,246,0.15), rgba(236,72,153,0.15))" : "var(--glass-bg, var(--dark-elevated))",
                      border: `2px solid ${active ? "#8b5cf6" : "var(--diamond-border)"}`,
                      borderRadius: "12px", cursor: "pointer", transition: "all 0.3s",
                      textAlign: "left", width: "100%", fontFamily: "inherit",
                    }}
                  >
                    <div style={{
                      width: "20px", height: "20px", borderRadius: "50%",
                      border: `2px solid ${active ? "#8b5cf6" : "var(--diamond-border)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      {active && <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#8b5cf6" }}></div>}
                    </div>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
                        <i className={`fas ${opt.icon}`} style={{ color: opt.iconColor, marginRight: "6px" }}></i>
                        {opt.label}
                      </div>
                      <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>{opt.sub}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* ZONE LOCAL */}
            {source === "local" && (
              <>
                <div className="calc-field">
                  <label className="calc-label">Prix d&apos;achat unitaire ({deviseActuelle})</label>
                  <input className="form-input" type="number" placeholder="2500" value={prixAchatLocal} onChange={e => setPrixAchatLocal(e.target.value)} />
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label className="calc-label" style={{ marginBottom: "10px", display: "block" }}>
                    Frais de transport / récupération pour ce stock ?
                  </label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {([
                      { id: "gratuit" as const, label: "0F (Sur place / Inclus)" },
                      { id: "paye" as const, label: "J'ai payé la livraison / le taxi" },
                    ]).map(opt => {
                      const active = transportMode === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setTransportMode(opt.id)}
                          style={{
                            display: "flex", alignItems: "center", gap: "10px",
                            padding: "12px 14px",
                            background: active ? "linear-gradient(135deg, rgba(139,92,246,0.15), rgba(236,72,153,0.15))" : "var(--glass-bg, var(--dark-elevated))",
                            border: `2px solid ${active ? "#8b5cf6" : "var(--diamond-border)"}`,
                            borderRadius: "10px", cursor: "pointer", transition: "all 0.3s",
                            textAlign: "left", width: "100%", fontFamily: "inherit",
                          }}
                        >
                          <div style={{
                            width: "16px", height: "16px", borderRadius: "50%", flexShrink: 0,
                            border: `2px solid ${active ? "#8b5cf6" : "var(--diamond-border)"}`,
                            background: active ? "#8b5cf6" : "transparent",
                          }}></div>
                          <span style={{ fontSize: "12px", color: "var(--text-primary)", fontWeight: 600 }}>{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {transportMode === "paye" && (
                  <>
                    <div className="calc-field">
                      <label className="calc-label">Montant total payé ({deviseActuelle})</label>
                      <input className="form-input" type="number" placeholder="3000" value={localTransportMontant} onChange={e => setLocalTransportMontant(e.target.value)} />
                    </div>
                    <div className="calc-field">
                      <label className="calc-label">Combien d&apos;articles transportés ?</label>
                      <input className="form-input" type="number" placeholder="10" value={localTransportNb} onChange={e => setLocalTransportNb(e.target.value)} />
                    </div>
                  </>
                )}
              </>
            )}

            {/* ZONE IMPORT */}
            {source === "import" && (
              <>
                <div style={{ marginBottom: "16px" }}>
                  <label className="calc-label" style={{ marginBottom: "10px", display: "block" }}>
                    Connaissez-vous le coût global ou le détail ?
                  </label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      type="button"
                      onClick={() => setImportMode("global")}
                      style={{
                        flex: 1, padding: "12px", fontSize: "12px", fontWeight: 700,
                        borderRadius: "10px", cursor: "pointer", fontFamily: "inherit",
                        border: `2px solid ${importMode === "global" ? "#8b5cf6" : "var(--diamond-border)"}`,
                        background: importMode === "global" ? "linear-gradient(135deg, rgba(139,92,246,0.15), rgba(236,72,153,0.15))" : "var(--dark-elevated)",
                        color: importMode === "global" ? "var(--text-primary)" : "var(--text-muted)",
                      }}
                    >
                      <i className="fas fa-box" style={{ marginRight: "6px" }}></i>Coût Global
                    </button>
                    <button
                      type="button"
                      onClick={() => setImportMode("detail")}
                      style={{
                        flex: 1, padding: "12px", fontSize: "12px", fontWeight: 700,
                        borderRadius: "10px", cursor: "pointer", fontFamily: "inherit",
                        border: `2px solid ${importMode === "detail" ? "#8b5cf6" : "var(--diamond-border)"}`,
                        background: importMode === "detail" ? "linear-gradient(135deg, rgba(139,92,246,0.15), rgba(236,72,153,0.15))" : "var(--dark-elevated)",
                        color: importMode === "detail" ? "var(--text-primary)" : "var(--text-muted)",
                      }}
                    >
                      <i className="fas fa-list" style={{ marginRight: "6px" }}></i>Détail
                    </button>
                  </div>
                </div>

                {importMode === "global" && (
                  <>
                    <div className="calc-field">
                      <label className="calc-label">Coût total du colis (Achat + Transport + Douane) ({deviseActuelle})</label>
                      <input className="form-input" type="number" placeholder="150000" value={importCoutGlobal} onChange={e => setImportCoutGlobal(e.target.value)} />
                    </div>
                    <div className="calc-field">
                      <label className="calc-label">Nombre d&apos;articles dans le colis</label>
                      <input className="form-input" type="number" placeholder="20" value={importNbGlobal} onChange={e => setImportNbGlobal(e.target.value)} />
                    </div>
                  </>
                )}

                {importMode === "detail" && (
                  <>
                    <div className="calc-field">
                      <label className="calc-label">Prix d&apos;achat unitaire ({deviseActuelle})</label>
                      <input className="form-input" type="number" placeholder="3000" value={importPrixUnit} onChange={e => setImportPrixUnit(e.target.value)} />
                    </div>
                    <div className="calc-field">
                      <label className="calc-label">Frais logistiques globaux (transport + douane) ({deviseActuelle})</label>
                      <input className="form-input" type="number" placeholder="50000" value={importFraisLog} onChange={e => setImportFraisLog(e.target.value)} />
                    </div>
                    <div className="calc-field">
                      <label className="calc-label">Nombre d&apos;articles</label>
                      <input className="form-input" type="number" placeholder="20" value={importNbDetail} onChange={e => setImportNbDetail(e.target.value)} />
                    </div>
                  </>
                )}
              </>
            )}

            {/* ZONE PRODUCTION */}
            {source === "production" && (
              <>
                <div className="calc-field">
                  <label className="calc-label">Coût des matériaux ({deviseActuelle})</label>
                  <input className="form-input" type="number" placeholder="8000" value={prodCoutMateriaux} onChange={e => setProdCoutMateriaux(e.target.value)} />
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={facturerTemps}
                      onChange={e => setFacturerTemps(e.target.checked)}
                      style={{ accentColor: "#8b5cf6", width: "18px", height: "18px" }}
                    />
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>Facturer mon temps ?</span>
                  </label>
                </div>

                {facturerTemps && (
                  <>
                    <div className="calc-field">
                      <label className="calc-label">Temps passé (heures)</label>
                      <input className="form-input" type="number" placeholder="3" step="0.5" value={prodHeures} onChange={e => setProdHeures(e.target.value)} />
                    </div>
                    <div className="calc-field">
                      <label className="calc-label">Prix de votre heure ({deviseActuelle})</label>
                      <input className="form-input" type="number" placeholder="2000" value={prodPrixHeure} onChange={e => setProdPrixHeure(e.target.value)} />
                    </div>
                  </>
                )}
              </>
            )}

            <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
              <button className="btn btn-secondary" style={{ padding: "14px 20px", fontSize: "13px" }} onClick={() => setStep(1)}>
                <i className="fas fa-arrow-left"></i>
              </button>
              <button
                className="btn"
                style={{ flex: 1, padding: "14px", background: "linear-gradient(135deg,#8b5cf6,#ec4899)", color: "white", fontSize: "14px", fontWeight: 700 }}
                onClick={() => setStep(3)} disabled={!canProceed2}
              >
                Continuer <i className="fas fa-arrow-right" style={{ marginLeft: "8px" }}></i>
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3 ── */}
        {step === 3 && (
          <div className="glass-card">
            <StepHeader icon="fa-receipt" gradient="linear-gradient(135deg,#10b981,#3b82f6)" title="La Réalité des Charges" sub="Toutes les dépenses à intégrer" />

            {/* ── CANAL SELECTION ── */}
            <div className="calc-field">
              <label className="calc-label">Où vendez-vous ce produit ?</label>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "10px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px", background: canalPhysique ? "rgba(245,158,11,0.1)" : "var(--dark-elevated)", border: `2px solid ${canalPhysique ? "#f59e0b" : "var(--diamond-border)"}`, borderRadius: "12px", cursor: "pointer" }}>
                  <input type="checkbox" checked={canalPhysique} onChange={e => setCanalPhysique(e.target.checked)} style={{ accentColor: "#f59e0b", width: "18px", height: "18px", flexShrink: 0 }} />
                  <i className="fas fa-store" style={{ color: canalPhysique ? "#f59e0b" : "var(--text-muted)", fontSize: "16px", flexShrink: 0 }}></i>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: canalPhysique ? "var(--text-primary)" : "var(--text-muted)" }}>Boutique Physique</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px", background: canalEnLigne ? "rgba(59,130,246,0.1)" : "var(--dark-elevated)", border: `2px solid ${canalEnLigne ? "#3b82f6" : "var(--diamond-border)"}`, borderRadius: "12px", cursor: "pointer" }}>
                  <input type="checkbox" checked={canalEnLigne} onChange={e => setCanalEnLigne(e.target.checked)} style={{ accentColor: "#3b82f6", width: "18px", height: "18px", flexShrink: 0 }} />
                  <i className="fas fa-globe" style={{ color: canalEnLigne ? "#3b82f6" : "var(--text-muted)", fontSize: "16px", flexShrink: 0 }}></i>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: canalEnLigne ? "var(--text-primary)" : "var(--text-muted)" }}>Vente en Ligne</span>
                </label>
              </div>
              <button type="button" onClick={() => { setCanalPhysique(true); setCanalEnLigne(true); }} style={{ width: "100%", padding: "10px", borderRadius: "10px", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", border: `2px solid ${canalPhysique && canalEnLigne ? "#8b5cf6" : "var(--diamond-border)"}`, background: canalPhysique && canalEnLigne ? "rgba(139,92,246,0.15)" : "var(--dark-elevated)", color: canalPhysique && canalEnLigne ? "#a78bfa" : "var(--text-muted)" }}>
                <i className="fas fa-infinity" style={{ marginRight: "6px" }}></i>Les deux
              </button>
            </div>

            {/* ── BOUTIQUE PHYSIQUE ── */}
            {canalPhysique && (
              <div style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: "16px", padding: "16px", marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                  <i className="fas fa-store" style={{ color: "#f59e0b", fontSize: "16px" }}></i>
                  <span style={{ fontSize: "14px", fontWeight: 800, color: "#f59e0b" }}>Boutique Physique</span>
                </div>

                <div style={{ marginBottom: "14px" }}>
                  <label className="calc-label">Payez-vous un loyer ?</label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {([
                      { val: true, label: "Je paye un loyer", icon: "fa-building" },
                      { val: false, label: "Je ne paye rien", icon: "fa-home" },
                    ] as { val: boolean; label: string; icon: string }[]).map(opt => (
                      <button key={String(opt.val)} type="button" onClick={() => setHasLoyer(opt.val)} style={{ flex: 1, padding: "10px 8px", borderRadius: "10px", fontSize: "11px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", textAlign: "center", border: `2px solid ${hasLoyer === opt.val ? "#f59e0b" : "var(--diamond-border)"}`, background: hasLoyer === opt.val ? "rgba(245,158,11,0.15)" : "var(--dark-elevated)", color: hasLoyer === opt.val ? "#f59e0b" : "var(--text-muted)" }}>
                        <i className={`fas ${opt.icon}`} style={{ display: "block", fontSize: "16px", marginBottom: "4px" }}></i>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {hasLoyer && (
                  <>
                    <div className="calc-field">
                      <label className="calc-label">Montant mensuel ({deviseActuelle})</label>
                      <input className="form-input" type="number" placeholder="Ex: 80 000" value={loyerMensuel} onChange={e => setLoyerMensuel(e.target.value)} />
                    </div>

                    {loyerMensuel && (
                      <div style={{ marginBottom: "14px" }}>
                        <label className="calc-label">Ce produit est-il le seul vendu dans la boutique ?</label>
                        <div style={{ display: "flex", gap: "8px" }}>
                          {([
                            { val: true, label: "Oui, le seul" },
                            { val: false, label: "Non, d'autres aussi" },
                          ] as { val: boolean; label: string }[]).map(opt => (
                            <button key={String(opt.val)} type="button" onClick={() => setSeulProduit(opt.val)} style={{ flex: 1, padding: "10px", borderRadius: "10px", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", border: `2px solid ${seulProduit === opt.val ? "#f59e0b" : "var(--diamond-border)"}`, background: seulProduit === opt.val ? "rgba(245,158,11,0.15)" : "var(--dark-elevated)", color: seulProduit === opt.val ? "#f59e0b" : "var(--text-muted)" }}>
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {seulProduit === true && (
                      <div className="calc-field">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                          <label className="calc-label" style={{ margin: 0 }}>Combien comptez-vous en vendre ce mois-ci ?</label>
                          <button type="button" onClick={() => setNeSaitPasVolumeBoutique(v => !v)} style={{ fontSize: "11px", color: neSaitPasVolumeBoutique ? "#f59e0b" : "var(--text-muted)", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", textDecoration: "underline" }}>
                            Je ne sais pas
                          </button>
                        </div>
                        {!neSaitPasVolumeBoutique
                          ? <input className="form-input" type="number" placeholder="Ex: 30" value={nbArticlesMois} onChange={e => setNbArticlesMois(e.target.value)} />
                          : (
                            <div style={{ padding: "10px 12px", background: "rgba(245,158,11,0.08)", borderRadius: "10px", fontSize: "12px", color: "#f59e0b" }}>
                              <i className="fas fa-info-circle" style={{ marginRight: "6px" }}></i>
                              Le seuil de rentabilité sera calculé pour déterminer le volume minimum.
                            </div>
                          )
                        }
                      </div>
                    )}

                    {seulProduit === false && (
                      <div className="calc-field">
                        <label className="calc-label">Combien vendez-vous de ce produit par mois (environ) ?</label>
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "10px" }}>
                          {["10", "20", "50", "100", "sait-pas"].map(p => (
                            <button key={p} type="button" onClick={() => { setPalierLoyer(p); if (p !== "sait-pas") setPctLoyer(""); }} style={{ padding: "8px 12px", borderRadius: "10px", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", border: `2px solid ${palierLoyer === p ? "#f59e0b" : "var(--diamond-border)"}`, background: palierLoyer === p ? "rgba(245,158,11,0.15)" : "var(--dark-elevated)", color: palierLoyer === p ? "#f59e0b" : "var(--text-muted)" }}>
                              {p === "sait-pas" ? "Je ne sais pas" : `~${p}`}
                            </button>
                          ))}
                        </div>
                        {palierLoyer === "sait-pas" && (
                          <>
                            <label className="calc-label">Quelle part du loyer attribuez-vous à ce produit ?</label>
                            <div style={{ display: "flex", gap: "6px" }}>
                              {["5", "10", "20", "50"].map(p => (
                                <button key={p} type="button" onClick={() => setPctLoyer(p)} style={{ flex: 1, padding: "8px", borderRadius: "10px", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", border: `2px solid ${pctLoyer === p ? "#f59e0b" : "var(--diamond-border)"}`, background: pctLoyer === p ? "rgba(245,158,11,0.15)" : "var(--dark-elevated)", color: pctLoyer === p ? "#f59e0b" : "var(--text-muted)" }}>
                                  {p}%
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* ── VENTE EN LIGNE ── */}
            {canalEnLigne && (
              <div style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.25)", borderRadius: "16px", padding: "16px", marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                  <i className="fas fa-globe" style={{ color: "#3b82f6", fontSize: "16px" }}></i>
                  <span style={{ fontSize: "14px", fontWeight: 800, color: "#3b82f6" }}>Vente en Ligne</span>
                </div>

                <div style={{ marginBottom: "14px" }}>
                  <label className="calc-label">Faites-vous de la publicité ?</label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {([
                      { id: "pub" as const, label: "Oui, je fais de la pub", icon: "fa-ad" },
                      { id: "organique" as const, label: "Non, organique", icon: "fa-leaf" },
                    ]).map(opt => (
                      <button key={opt.id} type="button" onClick={() => setPubMode(opt.id)} style={{ flex: 1, padding: "10px 8px", borderRadius: "10px", fontSize: "11px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", textAlign: "center", border: `2px solid ${pubMode === opt.id ? "#3b82f6" : "var(--diamond-border)"}`, background: pubMode === opt.id ? "rgba(59,130,246,0.15)" : "var(--dark-elevated)", color: pubMode === opt.id ? "#3b82f6" : "var(--text-muted)" }}>
                        <i className={`fas ${opt.icon}`} style={{ display: "block", fontSize: "15px", marginBottom: "4px" }}></i>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {pubMode === "pub" && (
                  <>
                    <div className="calc-field">
                      <label className="calc-label">
                        <i className="fas fa-coins" style={{ marginRight: "5px", color: "#f59e0b" }}></i>
                        Quelle devise utilisez-vous sur Meta ou TikTok ?
                      </label>
                      <select className="form-input" value={devisePubLabo} onChange={e => setDevisePubLabo(e.target.value)} style={{ cursor: "pointer" }}>
                        <option value="">{deviseActuelle} (devise systeme)</option>
                        {DEVISES_PUB.filter(d => d.code !== deviseActuelle).map(d => (
                          <option key={d.code} value={d.code}>{d.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="calc-field">
                      {!neSaitPasBudget ? (
                        <>
                          <label className="calc-label">Combien avez-vous prévu pour ce lancement ?</label>
                          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                            <input className="form-input" type="number" placeholder="Ex: 50 000" value={budgetPub} onChange={e => setBudgetPub(e.target.value)} style={{ flex: 1 }} />
                            <span style={{ background: "var(--dark-elevated)", padding: "10px 14px", borderRadius: "10px", fontSize: "12px", fontWeight: 700, color: "#f59e0b", border: "1px solid var(--diamond-border)" }}>{devisePubLaboActive || deviseActuelle}</span>
                          </div>
                          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", marginTop: "12px" }}>
                            <input type="checkbox" checked={neSaitPasBudget} onChange={e => setNeSaitPasBudget(e.target.checked)} style={{ accentColor: "#3b82f6" }} />
                            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Je ne sais pas</span>
                          </label>
                        </>
                      ) : (
                        <>
                          <label className="calc-label">Combien pouvez-vous dépenser par jour ?</label>
                          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                            <input className="form-input" type="number" placeholder="Ex: 2 000" value={budgetPubJour} onChange={e => setBudgetPubJour(e.target.value)} style={{ flex: 1 }} />
                            <span style={{ background: "linear-gradient(135deg, #f59e0b, #f97316)", padding: "10px 14px", borderRadius: "10px", fontSize: "12px", fontWeight: 800, color: "white" }}>{devisePubLaboActive || deviseActuelle}</span>
                          </div>
                          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "6px" }}>
                            Le montant saisi est en <strong style={{ color: "#f59e0b" }}>{devisePubLaboActive || deviseActuelle}</strong>
                          </div>
                          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", marginTop: "12px" }}>
                            <input type="checkbox" checked={neSaitPasBudget} onChange={e => setNeSaitPasBudget(e.target.checked)} style={{ accentColor: "#3b82f6" }} />
                            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Je ne sais pas</span>
                          </label>
                        </>
                      )}
                    </div>

                    {pubEstDifferenteLabo && (budgetPubJourNum > 0 || budgetPubTotalNum > 0) && (
                      <div style={{ background: "rgba(102,126,234,0.1)", border: "1px solid rgba(102,126,234,0.25)", borderRadius: "12px", padding: "14px", marginBottom: "10px" }}>
                        <div style={{ fontSize: "12px", color: "#a78bfa", fontWeight: 700, marginBottom: "8px" }}>
                          <i className="fas fa-exchange-alt" style={{ marginRight: "6px" }}></i>Conversion automatique
                        </div>
                        <div style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 700, marginBottom: "6px" }}>
                          1 {devisePubLaboActive} = {tauxConversion.toFixed(2)} {deviseActuelle}
                        </div>
                        {neSaitPasBudget && budgetPubJourNum > 0 && (
                          <div style={{ fontSize: "13px", color: "#10b981", fontWeight: 700 }}>
                            <i className="fas fa-check-circle" style={{ marginRight: "5px" }}></i>
                            {budgetPubJourNum.toLocaleString("fr-FR")} {devisePubLaboActive}/jour = {(budgetPubJourNum * tauxConversion).toLocaleString("fr-FR")} {deviseActuelle}/jour
                          </div>
                        )}
                        {!neSaitPasBudget && budgetPubTotalNum > 0 && (
                          <div style={{ fontSize: "13px", color: "#10b981", fontWeight: 700 }}>
                            <i className="fas fa-check-circle" style={{ marginRight: "5px" }}></i>
                            {budgetPubTotalNum.toLocaleString("fr-FR")} {devisePubLaboActive} = {(budgetPubTotalNum * tauxConversion).toLocaleString("fr-FR")} {deviseActuelle}
                          </div>
                        )}
                      </div>
                    )}

                    <div style={{ borderTop: "1px solid var(--diamond-border)", margin: "16px 0", paddingTop: "16px" }}>
                      <div className="calc-field">
                        <label className="calc-label">En combien de temps espérez-vous épuiser le stock ?</label>
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                          {([
                            { id: "1sem" as const, label: "1 semaine" },
                            { id: "1mois" as const, label: "1 mois" },
                            { id: "2mois" as const, label: "2 mois" },
                            { id: "perso" as const, label: "Personnalisé" },
                          ]).map(opt => (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => setDureeEpuisement(opt.id)}
                              style={{
                                flex: 1,
                                minWidth: "80px",
                                padding: "10px 12px",
                                borderRadius: "10px",
                                fontSize: "12px",
                                fontWeight: 700,
                                cursor: "pointer",
                                fontFamily: "inherit",
                                border: `2px solid ${dureeEpuisement === opt.id ? "#3b82f6" : "var(--diamond-border)"}`,
                                background: dureeEpuisement === opt.id ? "rgba(59,130,246,0.15)" : "var(--dark-elevated)",
                                color: dureeEpuisement === opt.id ? "#3b82f6" : "var(--text-muted)",
                              }}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                        {dureeEpuisement === "perso" && (
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "12px" }}>
                            <input
                              className="form-input"
                              type="number"
                              placeholder="Nombre de jours"
                              value={dureePerso}
                              onChange={e => setDureePerso(e.target.value)}
                              style={{ width: "150px" }}
                            />
                            <span style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 600 }}>jours</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ── STAFF ── */}
            <div className="calc-field">
              <label className="calc-label">
                <i className="fas fa-users" style={{ marginRight: "6px", color: "#10b981" }}></i>
                Avez-vous du personnel ?
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {([
                  { id: "seul" as const, label: "Non, je gère seul", icon: "fa-user" },
                  { id: "salaire" as const, label: "Oui, salaire fixe mensuel", icon: "fa-money-bill-wave" },
                  { id: "commission" as const, label: "Oui, commission par vente", icon: "fa-percentage" },
                ]).map(opt => (
                  <button key={opt.id} type="button" onClick={() => setStaffMode(opt.id)} style={{ width: "100%", padding: "12px 14px", borderRadius: "12px", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", textAlign: "left", display: "flex", alignItems: "center", gap: "10px", border: `2px solid ${staffMode === opt.id ? "#10b981" : "var(--diamond-border)"}`, background: staffMode === opt.id ? "rgba(16,185,129,0.1)" : "var(--dark-elevated)", color: staffMode === opt.id ? "#10b981" : "var(--text-muted)" }}>
                    <i className={`fas ${opt.icon}`}></i>
                    {opt.label}
                  </button>
                ))}
              </div>
              {staffMode === "salaire" && (
                <div style={{ marginTop: "12px" }}>
                  <label className="calc-label">Salaire mensuel ({deviseActuelle})</label>
                  <input className="form-input" type="number" placeholder="Ex: 30 000" value={salaireMensuel} onChange={e => setSalaireMensuel(e.target.value)} />
                </div>
              )}
              {staffMode === "commission" && (
                <div style={{ marginTop: "12px" }}>
                  <label className="calc-label">Commission par pièce vendue ({deviseActuelle})</label>
                  <input className="form-input" type="number" placeholder="Ex: 1 000" value={commission} onChange={e => setCommission(e.target.value)} />
                </div>
              )}
            </div>

            <Field label={`Autres frais divers par pièce (${deviseActuelle})`}>
              <input className="form-input" type="number" placeholder="Emballage, étiquettes, etc." value={autresFrais} onChange={e => setAutresFrais(e.target.value)} />
            </Field>

            {calc.coutRevient > 0 && (
              <div style={{ background: "var(--dark-elevated)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: "14px", padding: "16px", marginBottom: "20px" }}>
                <div className="calc-label" style={{ marginBottom: "10px" }}>Aperçu rapide</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  <div>
                    <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>Coût de revient</div>
                    <div style={{ fontSize: "16px", fontWeight: 900, color: "#ef4444" }}>{fmt(Math.round(calc.coutRevient), deviseActuelle)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>Bénéfice net</div>
                    <div style={{ fontSize: "16px", fontWeight: 900, color: calc.benefice >= 0 ? "#10b981" : "#ef4444" }}>
                      {calc.benefice >= 0 ? "+" : ""}{fmt(Math.round(calc.benefice), deviseActuelle)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <button className="btn btn-secondary" onClick={() => setStep(2)}>
                <i className="fas fa-arrow-left"></i> Retour
              </button>
              <button
                className="btn"
                style={{ background: "linear-gradient(135deg,#8b5cf6,#ec4899)", color: "white" }}
                onClick={() => setShowReport(true)} disabled={!calc.ok}
              >
                <i className="fas fa-chart-bar"></i> Voir le Rapport
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StepHeader({ icon, gradient, title, sub }: { icon: string; gradient: string; title: string; sub: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
      <div style={{
        width: "36px", height: "36px", borderRadius: "10px", background: gradient,
        display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "16px",
      }}>
        <i className={`fas ${icon}`}></i>
      </div>
      <div>
        <div style={{ fontWeight: 800, fontSize: "16px", color: "var(--text-primary)" }}>{title}</div>
        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{sub}</div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="calc-field">
      <label className="calc-label">{label}</label>
      {children}
    </div>
  );
}
