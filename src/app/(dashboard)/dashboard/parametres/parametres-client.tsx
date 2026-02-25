"use client";
import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";

const INDICATIFS = [
  { code: "+237", pays: "Cameroun", flag: "CM" },
  { code: "+225", pays: "Cote d'Ivoire", flag: "CI" },
  { code: "+221", pays: "Senegal", flag: "SN" },
  { code: "+242", pays: "Congo", flag: "CG" },
  { code: "+243", pays: "RD Congo", flag: "CD" },
  { code: "+241", pays: "Gabon", flag: "GA" },
  { code: "+229", pays: "Benin", flag: "BJ" },
  { code: "+226", pays: "Burkina Faso", flag: "BF" },
  { code: "+227", pays: "Niger", flag: "NE" },
  { code: "+228", pays: "Togo", flag: "TG" },
  { code: "+223", pays: "Mali", flag: "ML" },
  { code: "+222", pays: "Mauritanie", flag: "MR" },
  { code: "+224", pays: "Guinee", flag: "GN" },
  { code: "+234", pays: "Nigeria", flag: "NG" },
  { code: "+233", pays: "Ghana", flag: "GH" },
  { code: "+254", pays: "Kenya", flag: "KE" },
  { code: "+255", pays: "Tanzanie", flag: "TZ" },
  { code: "+256", pays: "Ouganda", flag: "UG" },
  { code: "+250", pays: "Rwanda", flag: "RW" },
  { code: "+257", pays: "Burundi", flag: "BI" },
  { code: "+27", pays: "Afrique du Sud", flag: "ZA" },
  { code: "+251", pays: "Ethiopie", flag: "ET" },
  { code: "+20", pays: "Egypte", flag: "EG" },
  { code: "+212", pays: "Maroc", flag: "MA" },
  { code: "+216", pays: "Tunisie", flag: "TN" },
  { code: "+213", pays: "Algerie", flag: "DZ" },
  { code: "+218", pays: "Libye", flag: "LY" },
  { code: "+249", pays: "Soudan", flag: "SD" },
  { code: "+260", pays: "Zambie", flag: "ZM" },
  { code: "+263", pays: "Zimbabwe", flag: "ZW" },
  { code: "+265", pays: "Malawi", flag: "MW" },
  { code: "+244", pays: "Angola", flag: "AO" },
  { code: "+258", pays: "Mozambique", flag: "MZ" },
  { code: "+267", pays: "Botswana", flag: "BW" },
  { code: "+268", pays: "Eswatini", flag: "SZ" },
  { code: "+266", pays: "Lesotho", flag: "LS" },
  { code: "+264", pays: "Namibie", flag: "NA" },
  { code: "+230", pays: "Maurice", flag: "MU" },
  { code: "+261", pays: "Madagascar", flag: "MG" },
  { code: "+269", pays: "Comores", flag: "KM" },
  { code: "+262", pays: "Reunion", flag: "RE" },
  { code: "+248", pays: "Seychelles", flag: "SC" },
  { code: "+33", pays: "France", flag: "FR" },
  { code: "+32", pays: "Belgique", flag: "BE" },
  { code: "+41", pays: "Suisse", flag: "CH" },
  { code: "+44", pays: "Royaume-Uni", flag: "GB" },
  { code: "+49", pays: "Allemagne", flag: "DE" },
  { code: "+39", pays: "Italie", flag: "IT" },
  { code: "+34", pays: "Espagne", flag: "ES" },
  { code: "+351", pays: "Portugal", flag: "PT" },
  { code: "+31", pays: "Pays-Bas", flag: "NL" },
  { code: "+43", pays: "Autriche", flag: "AT" },
  { code: "+30", pays: "Grece", flag: "GR" },
  { code: "+48", pays: "Pologne", flag: "PL" },
  { code: "+420", pays: "Tchequie", flag: "CZ" },
  { code: "+36", pays: "Hongrie", flag: "HU" },
  { code: "+40", pays: "Roumanie", flag: "RO" },
  { code: "+359", pays: "Bulgarie", flag: "BG" },
  { code: "+385", pays: "Croatie", flag: "HR" },
  { code: "+381", pays: "Serbie", flag: "RS" },
  { code: "+386", pays: "Slovenie", flag: "SI" },
  { code: "+421", pays: "Slovaquie", flag: "SK" },
  { code: "+358", pays: "Finlande", flag: "FI" },
  { code: "+46", pays: "Suede", flag: "SE" },
  { code: "+47", pays: "Norvege", flag: "NO" },
  { code: "+45", pays: "Danemark", flag: "DK" },
  { code: "+354", pays: "Islande", flag: "IS" },
  { code: "+353", pays: "Irlande", flag: "IE" },
  { code: "+352", pays: "Luxembourg", flag: "LU" },
  { code: "+370", pays: "Lituanie", flag: "LT" },
  { code: "+371", pays: "Lettonie", flag: "LV" },
  { code: "+372", pays: "Estonie", flag: "EE" },
  { code: "+375", pays: "Bielorussie", flag: "BY" },
  { code: "+380", pays: "Ukraine", flag: "UA" },
  { code: "+7", pays: "Russie", flag: "RU" },
  { code: "+90", pays: "Turquie", flag: "TR" },
  { code: "+1", pays: "USA", flag: "US" },
  { code: "+1", pays: "Canada", flag: "CA" },
  { code: "+52", pays: "Mexique", flag: "MX" },
  { code: "+55", pays: "Bresil", flag: "BR" },
  { code: "+54", pays: "Argentine", flag: "AR" },
  { code: "+56", pays: "Chili", flag: "CL" },
  { code: "+57", pays: "Colombie", flag: "CO" },
  { code: "+58", pays: "Venezuela", flag: "VE" },
  { code: "+51", pays: "Perou", flag: "PE" },
  { code: "+591", pays: "Bolivie", flag: "BO" },
  { code: "+593", pays: "Equateur", flag: "EC" },
  { code: "+595", pays: "Paraguay", flag: "PY" },
  { code: "+598", pays: "Uruguay", flag: "UY" },
  { code: "+509", pays: "Haiti", flag: "HT" },
  { code: "+1809", pays: "Rep. Dominicaine", flag: "DO" },
  { code: "+53", pays: "Cuba", flag: "CU" },
  { code: "+506", pays: "Costa Rica", flag: "CR" },
  { code: "+507", pays: "Panama", flag: "PA" },
  { code: "+502", pays: "Guatemala", flag: "GT" },
  { code: "+503", pays: "El Salvador", flag: "SV" },
  { code: "+504", pays: "Honduras", flag: "HN" },
  { code: "+505", pays: "Nicaragua", flag: "NI" },
  { code: "+86", pays: "Chine", flag: "CN" },
  { code: "+852", pays: "Hong Kong", flag: "HK" },
  { code: "+853", pays: "Macao", flag: "MO" },
  { code: "+886", pays: "Taiwan", flag: "TW" },
  { code: "+81", pays: "Japon", flag: "JP" },
  { code: "+82", pays: "Coree du Sud", flag: "KR" },
  { code: "+850", pays: "Coree du Nord", flag: "KP" },
  { code: "+84", pays: "Vietnam", flag: "VN" },
  { code: "+66", pays: "Thailande", flag: "TH" },
  { code: "+60", pays: "Malaisie", flag: "MY" },
  { code: "+65", pays: "Singapour", flag: "SG" },
  { code: "+62", pays: "Indonesie", flag: "ID" },
  { code: "+63", pays: "Philippines", flag: "PH" },
  { code: "+95", pays: "Myanmar", flag: "MM" },
  { code: "+855", pays: "Cambodge", flag: "KH" },
  { code: "+856", pays: "Laos", flag: "LA" },
  { code: "+91", pays: "Inde", flag: "IN" },
  { code: "+92", pays: "Pakistan", flag: "PK" },
  { code: "+880", pays: "Bangladesh", flag: "BD" },
  { code: "+94", pays: "Sri Lanka", flag: "LK" },
  { code: "+977", pays: "Nepal", flag: "NP" },
  { code: "+93", pays: "Afghanistan", flag: "AF" },
  { code: "+98", pays: "Iran", flag: "IR" },
  { code: "+964", pays: "Irak", flag: "IQ" },
  { code: "+963", pays: "Syrie", flag: "SY" },
  { code: "+961", pays: "Liban", flag: "LB" },
  { code: "+962", pays: "Jordanie", flag: "JO" },
  { code: "+972", pays: "Israel", flag: "IL" },
  { code: "+970", pays: "Palestine", flag: "PS" },
  { code: "+966", pays: "Arabie Saoudite", flag: "SA" },
  { code: "+971", pays: "Emirats Arabes", flag: "AE" },
  { code: "+974", pays: "Qatar", flag: "QA" },
  { code: "+965", pays: "Koweit", flag: "KW" },
  { code: "+973", pays: "Bahrein", flag: "BH" },
  { code: "+968", pays: "Oman", flag: "OM" },
  { code: "+967", pays: "Yemen", flag: "YE" },
  { code: "+61", pays: "Australie", flag: "AU" },
  { code: "+64", pays: "Nouvelle-Zelande", flag: "NZ" },
  { code: "+679", pays: "Fidji", flag: "FJ" },
  { code: "+675", pays: "Papouasie N-G", flag: "PG" },
];

export default function ParametresClient() {
  const [username, setUsername] = useState("");
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [indicatif, setIndicatif] = useState("+237");
  const [searchIndicatif, setSearchIndicatif] = useState("");
  const [showIndicatifDropdown, setShowIndicatifDropdown] = useState(false);
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [isGoogle, setIsGoogle] = useState(false);

  const [ancienMdp, setAncienMdp] = useState("");
  const [nouveauMdp, setNouveauMdp] = useState("");
  const [showAncien, setShowAncien] = useState(false);
  const [showNouveau, setShowNouveau] = useState(false);

  const [shopifyConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveMsg, setSaveMsg] = useState("");
  const [mdpMsg, setMdpMsg] = useState("");

  const selectedIndicatif = INDICATIFS.find(i => i.code === indicatif);
  
  const filteredIndicatifs = useMemo(() => {
    const search = searchIndicatif.toLowerCase().trim();
    if (!search) return INDICATIFS;
    return INDICATIFS.filter(i => 
      i.code.includes(search) || 
      i.pays.toLowerCase().includes(search) ||
      i.flag.toLowerCase().includes(search)
    );
  }, [searchIndicatif]);

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      setEmail(user.email ?? "");
      const providers = user.app_metadata?.providers ?? [];
      setIsGoogle(providers.includes("google") && !providers.includes("email"));

      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        if (profile) {
          setUsername(profile.username ?? user.email?.split("@")[0] ?? "");
          setPrenom(profile.prenom ?? "");
          setNom(profile.nom ?? "");
          setTelephone(profile.telephone ?? "");
          setIndicatif(profile.indicatif ?? "+237");
        } else {
          setUsername(user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "");
        }
      } catch {
        setUsername(user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "");
      }
      setLoading(false);
    }
    loadUser();
  }, []);

  async function handleSaveProfil(e: React.FormEvent) {
    e.preventDefault();
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    try {
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        username: username.trim(),
        prenom: prenom.trim(),
        nom: nom.trim(),
        telephone: telephone.trim(),
        indicatif,
        updated_at: new Date().toISOString(),
      });
      setSaveMsg(error ? "Erreur lors de la sauvegarde." : "Informations enregistrées !");
    } catch {
      setSaveMsg("Erreur lors de la sauvegarde.");
    }
    setTimeout(() => setSaveMsg(""), 3000);
  }

  async function handleChangeMdp(e: React.FormEvent) {
    e.preventDefault();
    if (!ancienMdp || !nouveauMdp) {
      setMdpMsg("Veuillez remplir les deux champs.");
      setTimeout(() => setMdpMsg(""), 3000);
      return;
    }
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) return;

    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: ancienMdp,
    });
    if (signInErr) {
      setMdpMsg("Mot de passe actuel incorrect.");
      setTimeout(() => setMdpMsg(""), 3000);
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: nouveauMdp });
    if (error) {
      setMdpMsg("Erreur : " + error.message);
    } else {
      setMdpMsg("Mot de passe modifié !");
      setAncienMdp(""); setNouveauMdp("");
    }
    setTimeout(() => setMdpMsg(""), 3000);
  }

  const initiales = (
    (prenom.charAt(0) || username.charAt(0) || "U").toUpperCase() +
    (nom.charAt(0) || "").toUpperCase()
  );

  if (loading) {
    return (
      <div className="main-content">
        <div className="container">
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px" }}>
            <i className="fas fa-spinner fa-spin" style={{ fontSize: "28px", color: "var(--accent-purple)" }}></i>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="container">

        <div className="card" style={{ padding: "28px 24px", cursor: "default" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{
              width: "72px", height: "72px", borderRadius: "50%",
              background: "var(--gradient-primary)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "26px", fontWeight: 900, color: "#fff",
              flexShrink: 0, boxShadow: "0 4px 20px rgba(59,130,246,0.35)"
            }}>
              {initiales || "U"}
            </div>
            <div>
              <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
                {prenom || username} {nom}
              </div>
              <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
                {email}
              </div>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                marginTop: "8px", padding: "4px 12px", borderRadius: "20px",
                background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.25)",
                fontSize: "11px", fontWeight: 700, color: "var(--accent-blue)"
              }}>
                <i className="fas fa-medal"></i>
                Bronze
              </div>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: "24px", cursor: "default" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <i className="fas fa-user-pen" style={{ color: "var(--accent-blue)", fontSize: "18px" }}></i>
            <span style={{ fontSize: "17px", fontWeight: 800, color: "var(--text-primary)" }}>
              Informations personnelles
            </span>
          </div>

          <form onSubmit={handleSaveProfil}>
            <div className="calc-field">
              <label className="calc-label">NOM D&apos;UTILISATEUR</label>
              <input className="form-input" type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Votre pseudo" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="calc-field">
                <label className="calc-label">PRÉNOM</label>
                <input className="form-input" type="text" value={prenom} onChange={(e) => setPrenom(e.target.value)} placeholder="Prénom" />
              </div>
              <div className="calc-field">
                <label className="calc-label">NOM</label>
                <input className="form-input" type="text" value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Nom de famille" />
              </div>
            </div>
            <div className="calc-field">
              <label className="calc-label">TÉLÉPHONE</label>
              <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: "10px" }}>
                <div style={{ position: "relative" }}>
                  <button
                    type="button"
                    onClick={() => { setShowIndicatifDropdown(!showIndicatifDropdown); setSearchIndicatif(""); }}
                    className="form-input"
                    style={{ cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", textAlign: "left" }}
                  >
                    <span>{selectedIndicatif ? `${selectedIndicatif.code} ${selectedIndicatif.pays}` : indicatif}</span>
                    <i className={`fas fa-chevron-${showIndicatifDropdown ? "up" : "down"}`} style={{ fontSize: "10px", color: "var(--text-muted)" }}></i>
                  </button>
                  
                  {showIndicatifDropdown && (
                    <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 100, background: "var(--dark-card)", border: "1px solid var(--diamond-border)", borderRadius: "12px", marginTop: "4px", boxShadow: "0 10px 30px rgba(0,0,0,0.4)", overflow: "hidden" }}>
                      <div style={{ padding: "10px", borderBottom: "1px solid var(--diamond-border)" }}>
                        <input
                          type="text"
                          value={searchIndicatif}
                          onChange={(e) => setSearchIndicatif(e.target.value)}
                          placeholder="Rechercher pays ou code..."
                          className="form-input"
                          style={{ fontSize: "12px", padding: "10px 12px" }}
                          autoFocus
                        />
                      </div>
                      <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                        {filteredIndicatifs.length === 0 ? (
                          <div style={{ padding: "16px", textAlign: "center", color: "var(--text-muted)", fontSize: "12px" }}>
                            Aucun résultat
                          </div>
                        ) : (
                          filteredIndicatifs.map((item, idx) => (
                            <button
                              key={`${item.code}-${item.flag}-${idx}`}
                              type="button"
                              onClick={() => { setIndicatif(item.code); setShowIndicatifDropdown(false); setSearchIndicatif(""); }}
                              style={{ width: "100%", padding: "10px 14px", border: "none", background: indicatif === item.code ? "rgba(139,92,246,0.15)" : "transparent", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px", textAlign: "left", fontSize: "12px", color: "var(--text-primary)", fontFamily: "inherit" }}
                            >
                              <span style={{ fontWeight: 700, color: "#8b5cf6", minWidth: "50px" }}>{item.code}</span>
                              <span style={{ color: "var(--text-secondary)" }}>{item.pays}</span>
                              {indicatif === item.code && <i className="fas fa-check" style={{ marginLeft: "auto", color: "#10b981", fontSize: "11px" }}></i>}
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <input className="form-input" type="tel" value={telephone} onChange={(e) => setTelephone(e.target.value)} placeholder="6XX XXX XXX" />
              </div>
            </div>
            <div className="calc-field" style={{ marginBottom: "4px" }}>
              <label className="calc-label">EMAIL (LECTURE SEULE)</label>
              <input className="form-input" type="email" value={email} readOnly style={{ opacity: 0.6, cursor: "not-allowed" }} />
            </div>

            {saveMsg && (
              <div style={{
                background: saveMsg.includes("Erreur") ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.15)",
                border: `1px solid ${saveMsg.includes("Erreur") ? "rgba(239,68,68,0.35)" : "rgba(16,185,129,0.35)"}`,
                borderRadius: "10px", padding: "10px 16px", marginBottom: "12px",
                fontSize: "13px", fontWeight: 700,
                color: saveMsg.includes("Erreur") ? "var(--accent-red)" : "var(--accent-green)",
                display: "flex", alignItems: "center", gap: "8px"
              }}>
                <i className={saveMsg.includes("Erreur") ? "fas fa-exclamation-circle" : "fas fa-check-circle"}></i>
                {saveMsg}
              </div>
            )}

            <button type="submit" className="btn btn-success" style={{ width: "100%" }}>
              <i className="fas fa-floppy-disk"></i>
              Enregistrer les modifications
            </button>
          </form>
        </div>

        <div className="card" style={{ padding: "24px", cursor: "default" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <i className="fas fa-lock" style={{ color: "var(--accent-purple)", fontSize: "18px" }}></i>
            <span style={{ fontSize: "17px", fontWeight: 800, color: "var(--text-primary)" }}>
              Sécurité
            </span>
          </div>

          {isGoogle ? (
            <div style={{
              background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)",
              borderRadius: "12px", padding: "16px 20px",
              display: "flex", alignItems: "center", gap: "12px"
            }}>
              <i className="fab fa-google" style={{ color: "#4285F4", fontSize: "20px", flexShrink: 0 }}></i>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>Connexion via Google</div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                  Ton mot de passe est géré par Google. Pas de modification possible ici.
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleChangeMdp}>
              <div className="calc-field">
                <label className="calc-label">MOT DE PASSE ACTUEL</label>
                <div style={{ position: "relative" }}>
                  <input className="form-input" type={showAncien ? "text" : "password"} value={ancienMdp} onChange={(e) => setAncienMdp(e.target.value)} placeholder="••••••••" style={{ paddingRight: "48px" }} />
                  <button type="button" onClick={() => setShowAncien((v) => !v)} style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "15px" }}>
                    <i className={showAncien ? "fas fa-eye-slash" : "fas fa-eye"}></i>
                  </button>
                </div>
              </div>
              <div className="calc-field" style={{ marginBottom: "4px" }}>
                <label className="calc-label">NOUVEAU MOT DE PASSE</label>
                <div style={{ position: "relative" }}>
                  <input className="form-input" type={showNouveau ? "text" : "password"} value={nouveauMdp} onChange={(e) => setNouveauMdp(e.target.value)} placeholder="••••••••" style={{ paddingRight: "48px" }} />
                  <button type="button" onClick={() => setShowNouveau((v) => !v)} style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "15px" }}>
                    <i className={showNouveau ? "fas fa-eye-slash" : "fas fa-eye"}></i>
                  </button>
                </div>
              </div>
              {mdpMsg && (
                <div style={{
                  background: mdpMsg.includes("modifié") ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
                  border: `1px solid ${mdpMsg.includes("modifié") ? "rgba(16,185,129,0.35)" : "rgba(239,68,68,0.35)"}`,
                  borderRadius: "10px", padding: "10px 16px", marginBottom: "12px",
                  fontSize: "13px", fontWeight: 700,
                  color: mdpMsg.includes("modifié") ? "var(--accent-green)" : "var(--accent-red)",
                  display: "flex", alignItems: "center", gap: "8px"
                }}>
                  <i className={mdpMsg.includes("modifié") ? "fas fa-check-circle" : "fas fa-exclamation-circle"}></i>
                  {mdpMsg}
                </div>
              )}
              <button type="submit" className="btn" style={{ width: "100%", background: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)", color: "#fff", border: "none", borderRadius: "12px", padding: "14px 20px", fontSize: "14px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                <i className="fas fa-key"></i>
                Modifier le mot de passe
              </button>
            </form>
          )}
        </div>

        <div className="card" style={{ padding: "24px", cursor: "default" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <i className="fas fa-bag-shopping" style={{ color: "#96bf48", fontSize: "18px" }}></i>
            <span style={{ fontSize: "17px", fontWeight: 800, color: "var(--text-primary)" }}>
              Intégration Shopify
            </span>
          </div>
          {shopifyConnected ? (
            <div style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: "12px", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#96bf48", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <i className="fas fa-check" style={{ color: "#fff", fontSize: "16px" }}></i>
                </div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--accent-green)" }}>Boutique connectée</div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>ma-boutique.myshopify.com</div>
                </div>
              </div>
              <button className="btn" style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "var(--accent-red)", borderRadius: "8px", padding: "8px 14px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
                Déconnecter
              </button>
            </div>
          ) : (
            <>
              <div style={{ background: "var(--dark-elevated)", borderRadius: "12px", padding: "16px 20px", display: "flex", alignItems: "center", gap: "14px", marginBottom: "16px" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: "rgba(150,191,72,0.15)", border: "1px solid rgba(150,191,72,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <i className="fas fa-plug" style={{ color: "#96bf48", fontSize: "18px" }}></i>
                </div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>Non connecté</div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px", lineHeight: 1.5 }}>
                    Connectez votre boutique Shopify pour synchroniser vos commandes et produits automatiquement.
                  </div>
                </div>
              </div>
              <button className="btn btn-success" style={{ width: "100%" }}>
                <i className="fas fa-plug"></i>
                Connecter ma boutique Shopify
              </button>
            </>
          )}
        </div>

        <div style={{ textAlign: "center", padding: "8px 0 24px", display: "flex", flexDirection: "column", gap: "8px" }}>
          <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: "12px", color: "var(--text-muted)", textDecoration: "underline" }}>
            Politique de confidentialité
          </button>
          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
            © 2026 VEKO — Tous droits réservés
          </div>
        </div>

      </div>
    </div>
  );
}
