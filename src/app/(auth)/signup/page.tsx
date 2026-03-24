"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPass, setShowPass] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("Les mots de passe ne correspondent pas."); return; }
    if (password.length < 6) { setError("Le mot de passe doit contenir au moins 6 caractères."); return; }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) {
        setError(error.message === "User already registered" ? "Un compte existe déjà avec cet email." : error.message);
      } else {
        setSuccess(true);
      }
    } catch {
      setError("Une erreur est survenue. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    try {
      const supabase = createClient();
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
    } catch {
      setError("Connexion Google échouée. Réessayez.");
      setGoogleLoading(false);
    }
  }

  if (success) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0F172A 0%, #1a1f35 50%, #0F172A 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px", fontFamily: "var(--font-inter), sans-serif",
      }}>
        <div style={{
          background: "rgba(30,41,59,0.85)", border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "24px", padding: "40px 32px", textAlign: "center",
          backdropFilter: "blur(20px)", maxWidth: "400px", width: "100%",
        }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📧</div>
          <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#F8FAFC", marginBottom: "10px" }}>
            Vérifiez votre email
          </h2>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.55)", lineHeight: 1.6, marginBottom: "24px" }}>
            Un lien de confirmation a été envoyé à <strong style={{ color: "#10B981" }}>{email}</strong>.<br />
            Cliquez sur le lien pour activer votre compte.
          </p>
          <Link href="/login" style={{
            display: "inline-block", padding: "12px 28px", borderRadius: "12px",
            background: "linear-gradient(135deg,#10B981,#059669)", color: "white",
            fontWeight: 800, fontSize: "14px", textDecoration: "none",
          }}>
            Retour à la connexion
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0F172A 0%, #1a1f35 50%, #0F172A 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "20px", fontFamily: "var(--font-inter), sans-serif",
    }}>
      <div style={{ width: "100%", maxWidth: "420px" }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
            <div style={{
              width: "56px", height: "56px", borderRadius: "16px",
              background: "linear-gradient(135deg, #10B981, #059669)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 8px 32px rgba(16,185,129,0.35)",
              fontSize: "26px", fontWeight: 900, color: "white", letterSpacing: "1px",
            }}>V</div>
            <div style={{
              fontSize: "28px", fontWeight: 900,
              background: "linear-gradient(135deg, #10B981, #059669)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              letterSpacing: "4px",
            }}>VEKO</div>
          </div>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "13px", marginTop: "8px" }}>
            La vision de ce que vous gagnez vraiment
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: "rgba(30,41,59,0.85)", border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "24px", padding: "32px", backdropFilter: "blur(20px)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
        }}>
          <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#F8FAFC", marginBottom: "6px", textAlign: "center" }}>
            Créer un compte
          </h1>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", textAlign: "center", marginBottom: "28px" }}>
            Commencez gratuitement dès aujourd&apos;hui
          </p>

          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={googleLoading}
            style={{
              width: "100%", padding: "13px", borderRadius: "12px",
              background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)",
              color: "#F8FAFC", fontSize: "14px", fontWeight: 700, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
              marginBottom: "20px", transition: "all 0.2s",
              opacity: googleLoading ? 0.6 : 1,
            }}
          >
            {googleLoading ? (
              <span style={{ width: "18px", height: "18px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
            ) : (
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
            )}
            {googleLoading ? "Connexion..." : "Continuer avec Google"}
          </button>

          {/* Separator */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.1)" }} />
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", fontWeight: 600 }}>OU</span>
            <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.1)" }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.6)", marginBottom: "6px", display: "block" }}>Email</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.com" required
                style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#F8FAFC", fontSize: "14px", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
              />
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.6)", marginBottom: "6px", display: "block" }}>Mot de passe</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 caractères" required
                  style={{ width: "100%", padding: "12px 42px 12px 14px", borderRadius: "10px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#F8FAFC", fontSize: "14px", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", padding: "2px" }}>
                  <i className={`fas fa-eye${showPass ? "-slash" : ""}`} style={{ fontSize: "14px" }} />
                </button>
              </div>
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.6)", marginBottom: "6px", display: "block" }}>Confirmer le mot de passe</label>
              <input
                type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••" required
                style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#F8FAFC", fontSize: "14px", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
              />
            </div>

            {error && (
              <div style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "10px", padding: "10px 14px", fontSize: "13px", color: "#f87171" }}>
                <i className="fas fa-exclamation-circle" style={{ marginRight: "8px" }} />{error}
              </div>
            )}

            <button
              type="submit" disabled={loading}
              style={{
                width: "100%", padding: "13px", borderRadius: "12px",
                background: "linear-gradient(135deg, #10B981, #059669)",
                border: "none", color: "white", fontSize: "15px", fontWeight: 800,
                cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1,
                boxShadow: "0 4px 20px rgba(16,185,129,0.35)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "4px",
              }}
            >
              {loading ? (
                <span style={{ width: "18px", height: "18px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
              ) : (
                <><i className="fas fa-user-plus" /> Créer mon compte</>
              )}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", marginTop: "20px", fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>
          Déjà un compte ?{" "}
          <Link href="/login" style={{ color: "#10B981", fontWeight: 700, textDecoration: "none" }}>
            Se connecter
          </Link>
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: rgba(255,255,255,0.25); }
        input:focus { border-color: rgba(16,185,129,0.5) !important; box-shadow: 0 0 0 3px rgba(16,185,129,0.1); }
      `}</style>
    </div>
  );
}
