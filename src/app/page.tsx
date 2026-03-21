import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <div style={{ background: "#0F172A", minHeight: "100vh", fontFamily: "system-ui, sans-serif", color: "#F8FAFC", overflowX: "hidden" }}>

      <style>{`
        .lp-nav-links { display: flex; align-items: center; gap: 28px; }
        .lp-hero-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
        .lp-previews-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
        .lp-features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .lp-testi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        @media (max-width: 900px) {
          .lp-nav-links { display: none !important; }
          .lp-hero-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .lp-previews-grid { grid-template-columns: 1fr !important; }
          .lp-features-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .lp-testi-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .lp-features-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(15,23,42,0.9)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        padding: "0 32px",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Image src="/logo.png" alt="VEKO" width={32} height={32} style={{ borderRadius: 8 }} />
            <span style={{ fontSize: 22, fontWeight: 900, background: "linear-gradient(135deg,#10B981,#059669)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: 3 }}>VEKO</span>
          </div>
          <div className="lp-nav-links">
            <a href="#features" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: 14, fontWeight: 500 }}>Fonctionnalités</a>
            <a href="#testimonials" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: 14, fontWeight: 500 }}>Témoignages</a>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link href="/login" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", fontSize: 14, fontWeight: 600, padding: "8px 16px" }}>
              Se connecter
            </Link>
            <Link href="/login" style={{
              background: "linear-gradient(135deg,#10B981,#059669)", color: "white", textDecoration: "none",
              fontSize: 14, fontWeight: 700, padding: "10px 20px", borderRadius: 10,
              boxShadow: "0 4px 16px rgba(16,185,129,0.35)",
            }}>
              Commencer gratuitement
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 32px 64px" }}>
        <div className="lp-hero-grid">
          <div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)",
              borderRadius: 100, padding: "6px 14px", marginBottom: 24,
            }}>
              <span style={{ color: "#10b981", fontSize: 12, fontWeight: 700 }}>✦ Gestion commerciale intelligente</span>
            </div>
            <h1 style={{
              fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 900, lineHeight: 1.1,
              letterSpacing: "-1.5px", marginBottom: 20,
              background: "linear-gradient(135deg,#10B981 0%,#3b82f6 60%,#8b5cf6 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              La vision de ce que vous gagnez vraiment
            </h1>
            <p style={{ fontSize: 17, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, marginBottom: 36, maxWidth: 480 }}>
              Calculez vos vrais bénéfices, suivez chaque vente et prenez les bonnes décisions — sans Excel, sans calcul à la main.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 44 }}>
              <Link href="/login" style={{
                background: "linear-gradient(135deg,#10B981,#059669)", color: "white", textDecoration: "none",
                fontSize: 15, fontWeight: 700, padding: "14px 28px", borderRadius: 12,
                boxShadow: "0 8px 24px rgba(16,185,129,0.4)",
              }}>
                Commencer gratuitement →
              </Link>
              <Link href="/login" style={{
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)",
                color: "rgba(255,255,255,0.85)", textDecoration: "none",
                fontSize: 15, fontWeight: 600, padding: "14px 28px", borderRadius: 12,
              }}>
                Se connecter
              </Link>
            </div>
            <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
              {([["1 200+", "vendeurs actifs"], ["5", "pays"], ["100%", "gratuit"]] as [string, string][]).map(([n, l]) => (
                <div key={l}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: "#10b981" }}>{n}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero mockup dashboard */}
          <div>
            <div style={{
              background: "#0F172A", borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
              overflow: "hidden",
            }}>
              <div style={{ background: "#1E293B", padding: "10px 16px", display: "flex", alignItems: "center", gap: 6, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                {(["#ef4444","#f59e0b","#10b981"] as string[]).map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />)}
                <div style={{ flex: 1, background: "rgba(255,255,255,0.06)", borderRadius: 4, height: 20, marginLeft: 8 }} />
              </div>
              <div style={{ padding: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Récapitulatif — tout temps</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                  {([
                    ["Chiffre d'Affaires", "425 000 FCFA", "#10b981"],
                    ["Bénéfice Net", "128 500 FCFA", "#10b981"],
                    ["Ventes totales", "87 commandes", "#3b82f6"],
                    ["Taux de retour", "2.3%", "#f59e0b"],
                  ] as [string, string, string][]).map(([label, val, color]) => (
                    <div key={label} style={{ background: "#1E293B", borderRadius: 10, padding: "10px 12px", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{label}</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color }}>{val}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background: "#1E293B", borderRadius: 10, padding: "10px 12px", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Évolution 7 jours</div>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 36 }}>
                    {[40,55,35,70,60,80,65].map((h, i) => (
                      <div key={i} style={{ flex: 1, height: `${h}%`, background: "linear-gradient(180deg,#10b981,rgba(16,185,129,0.3))", borderRadius: "3px 3px 0 0" }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── APP PREVIEWS ── */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "64px 32px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontSize: "clamp(26px,4vw,40px)", fontWeight: 900, letterSpacing: "-0.5px", marginBottom: 12 }}>
            Tous vos outils en un seul endroit
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", maxWidth: 500, margin: "0 auto" }}>
            Du tableau de bord au fixateur de prix — chaque outil pensé pour les vendeurs africains.
          </p>
        </div>
        <div className="lp-previews-grid">
          {/* Mockup Dashboard */}
          <AppMockup label="Dashboard" icon="fa-chart-line" color="#10b981">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 8 }}>
              {([
                ["CA", "425 000 FCFA", "#10b981"],
                ["Bénéfice", "128 500 FCFA", "#10b981"],
                ["Ventes", "87 commandes", "#3b82f6"],
                ["Retours", "2 retours", "#ef4444"],
              ] as [string, string, string][]).map(([l, v, c]) => (
                <div key={l} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 8, padding: "8px 10px" }}>
                  <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 }}>{l}</div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: c }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 32 }}>
              {[30,55,40,70,50,80,60].map((h, i) => (
                <div key={i} style={{ flex: 1, height: `${h}%`, background: "rgba(16,185,129,0.5)", borderRadius: "2px 2px 0 0" }} />
              ))}
            </div>
          </AppMockup>

          {/* Mockup Fixateur de Prix */}
          <AppMockup label="Fixateur de Prix" icon="fa-crosshairs" color="#8b5cf6">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 8 }}>
              {([
                ["Coût de revient", "7 200 FCFA", "#f97316"],
                ["Prix souhaité", "12 000 FCFA", "#3b82f6"],
                ["Bénéfice / vente", "+4 800 FCFA", "#10b981"],
                ["Prix concurrent", "11 500 FCFA", "#f59e0b"],
              ] as [string, string, string][]).map(([l, v, c]) => (
                <div key={l} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 8, padding: "8px 10px" }}>
                  <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 }}>{l}</div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: c }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ padding: "6px 8px", background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 6 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#10b981" }}>VERDICT VEKO : Ce prix est VIABLE ✓</div>
            </div>
          </AppMockup>

          {/* Mockup Commandes */}
          <AppMockup label="Commandes" icon="fa-receipt" color="#f59e0b">
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { nom: "Aminata Koné", prod: "Sac cuir × 2", montant: "24 000", statut: "Livré", c: "#10b981" },
                { nom: "Jean-Paul M.", prod: "Sneakers × 1", montant: "18 500", statut: "En cours", c: "#3b82f6" },
                { nom: "Fatou Diallo", prod: "Robe wax × 3", montant: "31 000", statut: "Retourné", c: "#ef4444" },
              ].map(r => (
                <div key={r.nom} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 8px", background: "rgba(255,255,255,0.04)", borderRadius: 7 }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#F8FAFC" }}>{r.nom}</div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>{r.prod}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: "#F8FAFC" }}>{r.montant} FCFA</div>
                    <div style={{ fontSize: 8, fontWeight: 700, color: r.c, background: `${r.c}22`, padding: "1px 6px", borderRadius: 4, marginTop: 2 }}>{r.statut}</div>
                  </div>
                </div>
              ))}
            </div>
          </AppMockup>

          {/* Mockup Laboratoire */}
          <AppMockup label="Laboratoire" icon="fa-flask" color="#ec4899">
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Scanner de coûts</div>
            {[
              { l: "Prix d'achat fournisseur", v: 6500, max: 12000, c: "#f97316" },
              { l: "Transport / article", v: 800, max: 12000, c: "#8b5cf6" },
              { l: "Publicité / article", v: 1200, max: 12000, c: "#ec4899" },
              { l: "Commission staff", v: 500, max: 12000, c: "#3b82f6" },
            ].map(r => (
              <div key={r.l} style={{ marginBottom: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ fontSize: 9, color: "rgba(255,255,255,0.55)" }}>{r.l}</span>
                  <span style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.8)" }}>{r.v.toLocaleString("fr-FR")} FCFA</span>
                </div>
                <div style={{ height: 5, background: "rgba(255,255,255,0.08)", borderRadius: 3 }}>
                  <div style={{ height: "100%", width: `${(r.v / r.max) * 100}%`, background: r.c, borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </AppMockup>
        </div>
      </section>

      {/* ── FONCTIONNALITÉS ── */}
      <section id="features" style={{ maxWidth: 1200, margin: "0 auto", padding: "64px 32px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontSize: "clamp(26px,4vw,40px)", fontWeight: 900, letterSpacing: "-0.5px", marginBottom: 12 }}>
            Tout ce dont vous avez besoin
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", maxWidth: 480, margin: "0 auto" }}>
            Des outils professionnels, conçus pour la réalité du commerce africain.
          </p>
        </div>
        <div className="lp-features-grid">
          {[
            { icon: "fa-crosshairs", title: "Fixateur de Prix intelligent", desc: "Calculez le vrai prix de vente qui garantit votre rentabilité après tous vos frais.", color: "#8b5cf6" },
            { icon: "fa-chart-line", title: "Suivi des ventes en temps réel", desc: "Visualisez votre CA, bénéfice net et taux de retour au jour le jour.", color: "#10b981" },
            { icon: "fa-box", title: "Catalogue Produits", desc: "Gérez vos produits avec prix de revient, frais de transport et commissions.", color: "#3b82f6" },
            { icon: "fa-receipt", title: "Gestion Commandes", desc: "Enregistrez chaque vente et suivez le statut de toutes vos commandes.", color: "#f59e0b" },
            { icon: "fa-users", title: "Base Clients intégrée", desc: "Retrouvez l'historique complet de chaque client en un clic.", color: "#06b6d4" },
            { icon: "fa-coins", title: "Charges & Bénéfice net", desc: "Intégrez loyer, pub et charges pour connaître votre vrai bénéfice mensuel.", color: "#eab308" },
          ].map(f => (
            <div key={f.title} style={{ background: "#1E293B", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "24px 20px" }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: `${f.color}20`, border: `1px solid ${f.color}40`,
                display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16,
              }}>
                <i className={`fas ${f.icon}`} style={{ color: f.color, fontSize: 18 }} />
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#F8FAFC", marginBottom: 8 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TÉMOIGNAGES ── */}
      <section id="testimonials" style={{ maxWidth: 1200, margin: "0 auto", padding: "64px 32px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontSize: "clamp(26px,4vw,40px)", fontWeight: 900, letterSpacing: "-0.5px", marginBottom: 12 }}>
            Ils voient enfin ce qu&apos;ils gagnent
          </h2>
        </div>
        <div className="lp-testi-grid">
          {[
            {
              initiales: "KA", couleur: "#10b981",
              texte: "Avant VEKO je pensais gagner 150 000 FCFA par mois. L'app m'a montré que je gagnais seulement 42 000. Ça m'a littéralement sauvé.",
              nom: "Koffi A.", ville: "Abidjan", type: "Dropshipping",
            },
            {
              initiales: "AD", couleur: "#8b5cf6",
              texte: "Le fixateur de prix m'a évité de vendre à perte pendant 6 mois. Maintenant je sais exactement à quel prix vendre pour être rentable.",
              nom: "Amina D.", ville: "Dakar", type: "Boutique en ligne",
            },
            {
              initiales: "SB", couleur: "#3b82f6",
              texte: "Je gère 80 commandes par semaine depuis mon téléphone. VEKO c'est ma comptable, mon analyste et mon tableau de bord en un.",
              nom: "Sandra B.", ville: "Douala", type: "E-commerce",
            },
          ].map(t => (
            <div key={t.nom} style={{
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 16, padding: "24px 20px", display: "flex", flexDirection: "column", gap: 20,
            }}>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.7, fontStyle: "italic" }}>
                &ldquo;{t.texte}&rdquo;
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: `${t.couleur}25`, border: `2px solid ${t.couleur}50`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 800, color: t.couleur, flexShrink: 0,
                }}>
                  {t.initiales}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#F8FAFC" }}>{t.nom}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{t.ville} · {t.type}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 32px 80px" }}>
        <div style={{
          background: "linear-gradient(135deg,#10b981 0%,#3b82f6 100%)",
          borderRadius: 24, padding: "56px 40px", textAlign: "center",
        }}>
          <h2 style={{ fontSize: "clamp(24px,4vw,40px)", fontWeight: 900, color: "white", marginBottom: 14, letterSpacing: "-0.5px" }}>
            Rejoignez les entrepreneurs qui voient vraiment leur argent
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.85)", marginBottom: 36 }}>
            Créez votre compte en 30 secondes. Aucune carte bancaire requise.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            <Link href="/login" style={{
              background: "white", color: "#059669", textDecoration: "none",
              fontSize: 15, fontWeight: 800, padding: "14px 32px", borderRadius: 12,
              boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
            }}>
              Créer mon compte — c&apos;est gratuit →
            </Link>
            <Link href="/login" style={{
              background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.4)",
              color: "white", textDecoration: "none",
              fontSize: 14, fontWeight: 600, padding: "14px 24px", borderRadius: 12,
            }}>
              Déjà un compte ? Se connecter
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#0a0a0f", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Image src="/logo.png" alt="VEKO" width={22} height={22} style={{ borderRadius: 5, opacity: 0.6 }} />
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", fontWeight: 700 }}>© 2026 VEKO</span>
          </div>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            <Link href="/privacy" style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>Politique de confidentialité</Link>
            <Link href="/terms" style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>Conditions d&apos;utilisation</Link>
            <a href="mailto:appveko@gmail.com" style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function AppMockup({ label, icon, color, children }: {
  label: string;
  icon: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{
      background: "#0F172A", border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 14, overflow: "hidden",
      boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
    }}>
      <div style={{ background: "#1E293B", padding: "8px 12px", display: "flex", alignItems: "center", gap: 5, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        {(["#ef4444","#f59e0b","#10b981"] as string[]).map(c => <div key={c} style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />)}
        <div style={{ marginLeft: 8, display: "flex", alignItems: "center", gap: 6 }}>
          <i className={`fas ${icon}`} style={{ color, fontSize: 10 }} />
          <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.5)" }}>{label}</span>
        </div>
      </div>
      <div style={{ padding: 14 }}>{children}</div>
    </div>
  );
}
