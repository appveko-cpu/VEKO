import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Politique de confidentialité — VEKO",
  description: "Politique de confidentialité de VEKO — conformité RGPD",
};

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#e2e8f0", fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <header style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "16px 24px", display: "flex", alignItems: "center", gap: "16px", position: "sticky", top: 0, background: "#0a0a0f", zIndex: 10 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <img src="/logo.png" alt="VEKO" style={{ height: "32px", width: "auto" }} />
          <span style={{ fontSize: "18px", fontWeight: 700, color: "#fff", letterSpacing: "-0.3px" }}>VEKO</span>
        </Link>
        <span style={{ color: "rgba(255,255,255,0.2)", margin: "0 4px" }}>|</span>
        <Link href="javascript:history.back()" style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", textDecoration: "none", display: "flex", alignItems: "center", gap: "6px" }}>
          <span>←</span> Retour
        </Link>
      </header>

      {/* Content */}
      <main style={{ maxWidth: "780px", margin: "0 auto", padding: "48px 24px 80px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#fff", marginBottom: "8px" }}>
          Politique de confidentialité
        </h1>
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", marginBottom: "40px" }}>
          Dernière mise à jour : mars 2026
        </p>

        <Section title="1. Qui sommes-nous ?">
          <p>VEKO est une application de gestion commerciale destinée aux entrepreneurs et e-commerçants africains. Contact : <a href="mailto:appveko@gmail.com" style={{ color: "#8b5cf6" }}>appveko@gmail.com</a></p>
        </Section>

        <Section title="2. Données collectées">
          <ul>
            <li><strong>Données de compte</strong> : adresse e-mail et nom d&apos;affichage.</li>
            <li><strong>Données commerciales</strong> : produits, commandes, CA et bénéfices que vous saisissez dans l&apos;application.</li>
            <li><strong>Données Shopify</strong> (si boutique connectée) : commandes et CA importés depuis votre boutique.</li>
          </ul>
        </Section>

        <Section title="3. Pourquoi on collecte ces données">
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                <th style={{ textAlign: "left", padding: "8px 12px", color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>Finalité</th>
                <th style={{ textAlign: "left", padding: "8px 12px", color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>Base</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Faire fonctionner votre espace VEKO", "Exécution du service"],
                ["Sécuriser votre compte", "Protection de vos données"],
                ["Synchroniser vos données Shopify", "Votre accord explicite"],
              ].map(([fin, base], i) => (
                <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <td style={{ padding: "10px 12px" }}>{fin}</td>
                  <td style={{ padding: "10px 12px", color: "rgba(255,255,255,0.5)" }}>{base}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        <Section title="4. Partage des données">
          <p>Vos données ne sont jamais vendues ni louées. Elles sont uniquement hébergées sur Supabase, notre infrastructure sécurisée. Personne d&apos;autre n&apos;y a accès.</p>
        </Section>

        <Section title="5. Durée de conservation">
          <p>Vos données sont conservées tant que votre compte est actif. À la suppression du compte, tout est effacé sous 30 jours.</p>
        </Section>

        <Section title="6. Sécurité">
          <p>Vos données sont chiffrées et protégées. Seul vous avez accès à vos informations commerciales.</p>
        </Section>

        <Section title="7. Vos droits">
          <p>Vous pouvez à tout moment consulter, modifier ou supprimer vos données en nous contactant à <a href="mailto:appveko@gmail.com" style={{ color: "#8b5cf6" }}>appveko@gmail.com</a>. Nous répondons sous 48h.</p>
        </Section>

        <Section title="8. Cookies">
          <p>Uniquement le cookie de session nécessaire pour rester connecté à votre compte. Aucun tracking publicitaire.</p>
        </Section>

        <Section title="9. Modifications">
          <p>Tout changement vous sera notifié 15 jours à l&apos;avance.</p>
        </Section>

        <Section title="10. Contact">
          <p>
            <a href="mailto:appveko@gmail.com" style={{ color: "#8b5cf6" }}>appveko@gmail.com</a>
            {" · "}WhatsApp : +242 05 699 44 48
          </p>
        </Section>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "20px 24px", textAlign: "center" }}>
        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)", margin: 0 }}>
          © 2026 VEKO — Tous droits réservés &nbsp;·&nbsp;{" "}
          <Link href="/terms" style={{ color: "rgba(255,255,255,0.35)", textDecoration: "underline" }}>Conditions d&apos;utilisation</Link>
        </p>
      </footer>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: "36px" }}>
      <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#fff", marginBottom: "14px", paddingBottom: "8px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        {title}
      </h2>
      <div style={{ fontSize: "14px", lineHeight: 1.75, color: "rgba(255,255,255,0.7)" }}>
        {children}
      </div>
    </section>
  );
}
