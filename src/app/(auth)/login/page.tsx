"use client";
import { useState, CSSProperties } from "react";
import { createClient } from "@/lib/supabase/client";

type Tab = "login" | "signup" | "reset";

function translateError(msg: string): string {
  if (msg.includes("Invalid login credentials")) return "Email ou mot de passe incorrect.";
  if (msg.includes("Email not confirmed")) return "Confirme ton email avant de te connecter.";
  if (msg.includes("User already registered")) return "Un compte existe déjà avec cet email.";
  if (msg.includes("Password should be at least 6")) return "Le mot de passe doit faire au moins 6 caractères.";
  if (msg.includes("Too many requests")) return "Trop de tentatives. Attends quelques minutes.";
  if (msg.includes("Unable to validate email")) return "Adresse email invalide.";
  if (msg.includes("Signup is disabled")) return "Les inscriptions sont désactivées.";
  return "Une erreur est survenue. Réessaie.";
}

export default function LoginPage() {
  const [tab, setTab] = useState<Tab>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nom, setNom] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  function clearMessages() {
    setError("");
    setInfo("");
  }

  function switchTab(t: Tab) {
    setTab(t);
    clearMessages();
    setLoading(false);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    clearMessages();
    if (!email || !password) { setError("Remplis tous les champs."); return; }
    setLoading(true);
    try {
      const { error } = await createClient().auth.signInWithPassword({ email, password });
      if (error) { setError(translateError(error.message)); setLoading(false); }
      else window.location.href = "/dashboard";
    } catch {
      setError("Connexion impossible. Vérifie ta connexion internet.");
      setLoading(false);
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    clearMessages();
    if (!nom.trim()) { setError("Entre ton prénom ou nom."); return; }
    if (password.length < 6) { setError("Le mot de passe doit faire au moins 6 caractères."); return; }
    if (password !== confirm) { setError("Les mots de passe ne correspondent pas."); return; }
    setLoading(true);
    try {
      const { data, error } = await createClient().auth.signUp({
        email, password,
        options: { data: { full_name: nom.trim() } },
      });
      if (error) { setError(translateError(error.message)); setLoading(false); }
      else if (data.session) window.location.href = "/dashboard";
      else {
        setInfo(`Email de confirmation envoyé à ${email}. Clique sur le lien pour activer ton compte.`);
        setLoading(false);
      }
    } catch {
      setError("Inscription impossible. Vérifie ta connexion internet.");
      setLoading(false);
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    clearMessages();
    if (!email) { setError("Entre ton adresse email."); return; }
    setLoading(true);
    try {
      const { error } = await createClient().auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/dashboard`,
      });
      if (error) { setError(translateError(error.message)); setLoading(false); }
      else {
        setInfo(`Email envoyé à ${email}. Vérifie ta boîte mail.`);
        setLoading(false);
      }
    } catch {
      setError("Impossible d'envoyer l'email. Réessaie.");
      setLoading(false);
    }
  }

  async function handleGoogle() {
    clearMessages();
    try {
      const { error } = await createClient().auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) setError(translateError(error.message));
    } catch {
      setError("Connexion Google impossible. Réessaie.");
    }
  }

  const inputStyle: CSSProperties = {
    width: "100%",
    padding: "14px 16px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "12px",
    color: "white",
    fontSize: "14px",
    outline: "none",
    fontFamily: "var(--font-inter), Inter, sans-serif",
    boxSizing: "border-box",
    transition: "border-color 0.3s",
  };

  const pwdWrapStyle: CSSProperties = {
    position: "relative",
    marginBottom: "16px",
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a0f1e 0%, #1a1a3e 50%, #0d1424 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      fontFamily: "var(--font-inter), Inter, sans-serif",
    }}>
      <div style={{ width: "100%", maxWidth: "380px" }}>

        {/* Card */}
        <div style={{
          background: "rgba(255,255,255,0.06)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "28px",
          padding: "40px 28px",
          textAlign: "center",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}>

          {/* Logo */}
          <div style={{
            width: "64px", height: "64px",
            background: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
            borderRadius: "18px",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
          }}>
            <i className="fas fa-chart-line" style={{ fontSize: "28px", color: "white" }}></i>
          </div>

          <h1 style={{ fontSize: "28px", fontWeight: 900, color: "white", margin: "0 0 6px", letterSpacing: "2px" }}>
            VEKO
          </h1>
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", margin: "0 0 28px" }}>
            La vision de ce que vous gagnez vraiment
          </p>

          {/* Tabs */}
          {tab !== "reset" && (
            <div style={{
              display: "flex",
              marginBottom: "24px",
              background: "rgba(255,255,255,0.06)",
              borderRadius: "10px",
              padding: "3px",
            }}>
              <button
                onClick={() => switchTab("login")}
                style={{
                  flex: 1, padding: "10px", border: "none", borderRadius: "8px",
                  fontSize: "13px", fontWeight: 600, cursor: "pointer",
                  fontFamily: "var(--font-inter), Inter, sans-serif",
                  background: tab === "login" ? "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)" : "transparent",
                  color: tab === "login" ? "white" : "rgba(255,255,255,0.5)",
                  transition: "all 0.3s",
                }}
              >
                Se connecter
              </button>
              <button
                onClick={() => switchTab("signup")}
                style={{
                  flex: 1, padding: "10px", border: "none", borderRadius: "8px",
                  fontSize: "13px", fontWeight: 600, cursor: "pointer",
                  fontFamily: "var(--font-inter), Inter, sans-serif",
                  background: tab === "signup" ? "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)" : "transparent",
                  color: tab === "signup" ? "white" : "rgba(255,255,255,0.5)",
                  transition: "all 0.3s",
                }}
              >
                S&apos;inscrire
              </button>
            </div>
          )}

          {/* Error / Info banners */}
          {error && (
            <div style={{
              marginBottom: "16px", padding: "14px",
              background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: "12px", textAlign: "left",
            }}>
              <i className="fas fa-exclamation-circle" style={{ color: "#ef4444", marginRight: "6px" }}></i>
              <span style={{ fontSize: "12px", color: "#ef4444" }}>{error}</span>
            </div>
          )}
          {info && (
            <div style={{
              marginBottom: "16px", padding: "16px",
              background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)",
              borderRadius: "12px", textAlign: "left",
            }}>
              <i className="fas fa-envelope-open-text" style={{ color: "#8b5cf6", marginRight: "6px" }}></i>
              <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.8)", lineHeight: 1.6 }}>{info}</span>
            </div>
          )}

          {/* ── LOGIN ── */}
          {tab === "login" && (
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: "16px" }}>
                <input
                  type="email"
                  placeholder="Adresse email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = "#8b5cf6")}
                  onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.15)")}
                />
              </div>
              <div style={pwdWrapStyle}>
                <input
                  type={showPwd ? "text" : "password"}
                  placeholder="Mot de passe"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ ...inputStyle, paddingRight: "46px" }}
                  onFocus={e => (e.target.style.borderColor = "#8b5cf6")}
                  onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.15)")}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  style={{
                    position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none",
                    color: "rgba(255,255,255,0.35)", cursor: "pointer", padding: "4px",
                  }}
                >
                  <i className={`fas fa-eye${showPwd ? "-slash" : ""}`}></i>
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%", padding: "14px",
                  background: loading ? "rgba(255,255,255,0.08)" : "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
                  color: loading ? "rgba(255,255,255,0.4)" : "white",
                  border: "none", borderRadius: "12px",
                  fontSize: "14px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
                  fontFamily: "var(--font-inter), Inter, sans-serif",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  transition: "opacity 0.2s",
                }}
              >
                <i className={`fas ${loading ? "fa-spinner fa-spin" : "fa-sign-in-alt"}`}></i>
                {loading ? "Connexion..." : "Se connecter"}
              </button>

              {/* Divider */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "20px 0" }}>
                <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.15)" }}></div>
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>ou</span>
                <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.15)" }}></div>
              </div>

              {/* Google */}
              <button
                type="button"
                onClick={handleGoogle}
                style={{
                  width: "100%", padding: "13px",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "12px", color: "white",
                  fontSize: "13px", fontWeight: 600, cursor: "pointer",
                  fontFamily: "var(--font-inter), Inter, sans-serif",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                  transition: "all 0.2s",
                }}
                onMouseOver={e => (e.currentTarget.style.background = "rgba(255,255,255,0.12)")}
                onMouseOut={e => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
              >
                <svg width="18" height="18" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59A14.5 14.5 0 0 1 9.5 24c0-1.59.28-3.14.76-4.59l-7.98-6.19A23.99 23.99 0 0 0 0 24c0 3.77.9 7.35 2.56 10.53l7.97-5.94z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 5.94C6.51 42.62 14.62 48 24 48z" />
                </svg>
                Continuer avec Google
              </button>

              {/* Forgot password */}
              <button
                type="button"
                onClick={() => switchTab("reset")}
                style={{
                  background: "none", border: "none", color: "#8b5cf6",
                  fontSize: "11px", cursor: "pointer",
                  fontFamily: "var(--font-inter), Inter, sans-serif",
                  marginTop: "16px", textDecoration: "underline",
                }}
              >
                Mot de passe oublié ?
              </button>
            </form>
          )}

          {/* ── SIGNUP ── */}
          {tab === "signup" && (
            <form onSubmit={handleSignup}>
              <div style={{ marginBottom: "16px" }}>
                <input
                  type="text"
                  placeholder="Prénom / Nom"
                  value={nom}
                  onChange={e => setNom(e.target.value)}
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = "#8b5cf6")}
                  onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.15)")}
                />
              </div>
              <div style={{ marginBottom: "16px" }}>
                <input
                  type="email"
                  placeholder="Adresse email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = "#8b5cf6")}
                  onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.15)")}
                />
              </div>
              <div style={pwdWrapStyle}>
                <input
                  type={showPwd ? "text" : "password"}
                  placeholder="Mot de passe (min. 6 caractères)"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ ...inputStyle, paddingRight: "46px" }}
                  onFocus={e => (e.target.style.borderColor = "#8b5cf6")}
                  onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.15)")}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  style={{
                    position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none",
                    color: "rgba(255,255,255,0.35)", cursor: "pointer", padding: "4px",
                  }}
                >
                  <i className={`fas fa-eye${showPwd ? "-slash" : ""}`}></i>
                </button>
              </div>
              <div style={{ marginBottom: "16px", position: "relative" }}>
                <input
                  type={showPwd ? "text" : "password"}
                  placeholder="Confirmer le mot de passe"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  style={{
                    ...inputStyle,
                    borderColor: confirm
                      ? confirm === password && password.length >= 6
                        ? "rgba(52,211,153,0.5)"
                        : "rgba(248,113,113,0.5)"
                      : "rgba(255,255,255,0.15)",
                  }}
                  onFocus={e => (e.target.style.borderColor = "#8b5cf6")}
                  onBlur={e => {
                    e.target.style.borderColor = confirm
                      ? confirm === password && password.length >= 6
                        ? "rgba(52,211,153,0.5)"
                        : "rgba(248,113,113,0.5)"
                      : "rgba(255,255,255,0.15)";
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%", padding: "14px",
                  background: loading ? "rgba(255,255,255,0.08)" : "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
                  color: loading ? "rgba(255,255,255,0.4)" : "white",
                  border: "none", borderRadius: "12px",
                  fontSize: "14px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
                  fontFamily: "var(--font-inter), Inter, sans-serif",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  transition: "opacity 0.2s",
                }}
              >
                <i className={`fas ${loading ? "fa-spinner fa-spin" : "fa-rocket"}`}></i>
                {loading ? "Création..." : "Créer mon compte"}
              </button>

              {/* Google signup */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "20px 0" }}>
                <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.15)" }}></div>
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>ou</span>
                <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.15)" }}></div>
              </div>
              <button
                type="button"
                onClick={handleGoogle}
                style={{
                  width: "100%", padding: "13px",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "12px", color: "white",
                  fontSize: "13px", fontWeight: 600, cursor: "pointer",
                  fontFamily: "var(--font-inter), Inter, sans-serif",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                  transition: "all 0.2s",
                }}
                onMouseOver={e => (e.currentTarget.style.background = "rgba(255,255,255,0.12)")}
                onMouseOut={e => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
              >
                <svg width="18" height="18" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59A14.5 14.5 0 0 1 9.5 24c0-1.59.28-3.14.76-4.59l-7.98-6.19A23.99 23.99 0 0 0 0 24c0 3.77.9 7.35 2.56 10.53l7.97-5.94z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 5.94C6.51 42.62 14.62 48 24 48z" />
                </svg>
                S&apos;inscrire avec Google
              </button>
            </form>
          )}

          {/* ── RESET PASSWORD ── */}
          {tab === "reset" && (
            <form onSubmit={handleReset}>
              <div style={{ textAlign: "center", marginBottom: "24px" }}>
                <div style={{ fontSize: "32px", marginBottom: "10px" }}>🔐</div>
                <div style={{ fontSize: "16px", fontWeight: 800, color: "white", marginBottom: "6px" }}>
                  Mot de passe oublié
                </div>
                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
                  Entre ton email pour recevoir un lien de réinitialisation.
                </div>
              </div>
              <div style={{ marginBottom: "16px" }}>
                <input
                  type="email"
                  placeholder="Adresse email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={inputStyle}
                  onFocus={ev => (ev.target.style.borderColor = "#8b5cf6")}
                  onBlur={ev => (ev.target.style.borderColor = "rgba(255,255,255,0.15)")}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%", padding: "14px",
                  background: loading ? "rgba(255,255,255,0.08)" : "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
                  color: loading ? "rgba(255,255,255,0.4)" : "white",
                  border: "none", borderRadius: "12px",
                  fontSize: "14px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
                  fontFamily: "var(--font-inter), Inter, sans-serif",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                }}
              >
                <i className={`fas ${loading ? "fa-spinner fa-spin" : "fa-paper-plane"}`}></i>
                {loading ? "Envoi..." : "Envoyer le lien"}
              </button>
              <button
                type="button"
                onClick={() => switchTab("login")}
                style={{
                  background: "none", border: "none", color: "rgba(255,255,255,0.4)",
                  fontSize: "13px", cursor: "pointer", fontWeight: 600,
                  fontFamily: "var(--font-inter), Inter, sans-serif",
                  marginTop: "14px", width: "100%",
                }}
              >
                <i className="fas fa-arrow-left" style={{ marginRight: "7px" }}></i>
                Retour à la connexion
              </button>
            </form>
          )}

          {/* Footer */}
          <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)", marginTop: "20px", lineHeight: 1.5 }}>
            En vous connectant, vous acceptez notre{" "}
            <span style={{ color: "#8b5cf6", textDecoration: "underline", cursor: "pointer" }}>
              Politique de Confidentialité
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
