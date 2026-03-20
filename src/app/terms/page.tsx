import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Conditions d'utilisation — VEKO",
  description: "Conditions générales d'utilisation de l'application VEKO",
};

export default function TermsPage() {
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
          Conditions d&apos;utilisation
        </h1>
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", marginBottom: "40px" }}>
          Dernière mise à jour : mars 2026
        </p>

        <Section title="1. Le service">
          <p>VEKO est une application web de gestion commerciale accessible sur <a href="https://veko-app.com" style={{ color: "#8b5cf6" }}>veko-app.com</a>. Contact : <a href="mailto:appveko@gmail.com" style={{ color: "#8b5cf6" }}>appveko@gmail.com</a></p>
        </Section>

        <Section title="2. Acceptation">
          <p>En créant un compte, vous acceptez ces conditions. Toute modification vous sera notifiée 15 jours à l&apos;avance.</p>
        </Section>

        <Section title="3. Création de compte">
          <ul>
            <li>Un seul compte par personne.</li>
            <li>Vous êtes responsable de la confidentialité de vos identifiants.</li>
            <li>Les informations fournies doivent être exactes.</li>
          </ul>
        </Section>

        <Section title="4. Utilisation du service">
          <p>VEKO est réservé à un usage personnel et professionnel légitime. Tout usage frauduleux entraîne la suspension du compte.</p>
        </Section>

        <Section title="5. Vos données">
          <p>Vous restez propriétaire de toutes vos données commerciales. VEKO les stocke uniquement pour faire fonctionner le service. Aucune vente à des tiers.</p>
        </Section>

        <Section title="6. Intégration Shopify">
          <ul>
            <li>Si vous connectez votre boutique Shopify, VEKO accède uniquement aux données nécessaires au service.</li>
            <li>Vous pouvez déconnecter à tout moment depuis vos Paramètres.</li>
            <li>L&apos;accès est révocable à tout moment — le token est immédiatement supprimé.</li>
          </ul>
        </Section>

        <Section title="7. Disponibilité">
          <p>Nous mettons tout en œuvre pour que VEKO soit disponible en permanence. Les maintenances planifiées sont notifiées à l&apos;avance.</p>
        </Section>

        <Section title="8. Propriété intellectuelle">
          <p>Le nom, le design et les fonctionnalités VEKO sont notre propriété exclusive.</p>
        </Section>

        <Section title="9. Responsabilité">
          <p>Les calculs VEKO sont basés sur les données que vous saisissez. La précision des résultats dépend de la précision de vos entrées.</p>
        </Section>

        <Section title="10. Résiliation">
          <p>Vous pouvez supprimer votre compte à tout moment. Vos données sont effacées sous 30 jours. VEKO peut suspendre un compte en cas d&apos;utilisation frauduleuse.</p>
        </Section>

        <Section title="11. Contact">
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
          <Link href="/privacy" style={{ color: "rgba(255,255,255,0.35)", textDecoration: "underline" }}>Politique de confidentialité</Link>
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
