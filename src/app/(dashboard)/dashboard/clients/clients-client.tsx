"use client";
import { useState, useMemo, useEffect } from "react";
import { useDevise } from "@/context/DeviseContext";
import { createClient } from "@/lib/supabase/client";
import TooltipGuide from "@/components/onboarding/TooltipGuide";

type Client = {
  id: string;
  nom: string;
  tel: string;
  nbCommandes: number;
  totalCA: number;
  totalBenefice: number;
};

function fmt(n: number, d: string) {
  return n.toLocaleString("fr-FR") + " " + d;
}

export default function ClientsClient() {
  const { deviseActuelle } = useDevise();
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await createClient()
          .from("ventes")
          .select("nom_client, tel, ca, benefice")
          .eq("retournee", false);
        if (data) {
          const map = new Map<string, Client>();
          data.forEach((v: Record<string, unknown>) => {
            const key = `${(v.nom_client as string) ?? ""}|${(v.tel as string) ?? ""}`;
            const existing = map.get(key);
            if (existing) {
              existing.nbCommandes += 1;
              existing.totalCA += (v.ca as number) ?? 0;
              existing.totalBenefice += (v.benefice as number) ?? 0;
            } else {
              map.set(key, {
                id: key,
                nom: (v.nom_client as string) || "Anonyme",
                tel: (v.tel as string) || "",
                nbCommandes: 1,
                totalCA: (v.ca as number) ?? 0,
                totalBenefice: (v.benefice as number) ?? 0,
              });
            }
          });
          setClients(Array.from(map.values()).sort((a, b) => b.totalCA - a.totalCA));
        }
      } catch { }
      setLoading(false);
    }
    load();
  }, []);

  const clientsFiltres = useMemo(() => clients.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.nom.toLowerCase().includes(q) || c.tel.includes(q);
  }), [clients, search]);

  return (
    <div className="main-content">
      <div className="container">
        <div className="card" style={{ padding: "24px 24px 0 24px", cursor: "default" }}>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <i className="fas fa-users" style={{ color: "var(--accent-blue)", fontSize: "22px" }}></i>
            <TooltipGuide
              id="clients_intro"
              title="Vos clients en un coup d'oeil"
              message="Ici vous retrouvez tous vos clients avec leur historique d'achats, leur CA total et leur bénéfice généré."
              icon="fas fa-users"
              position="bottom"
            >
              <span style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
                Mes Clients
              </span>
            </TooltipGuide>
          </div>

          <input
            className="form-input"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un client..."
            style={{ marginBottom: "0" }}
          />

          <div
            style={{
              background: "var(--dark-elevated)",
              borderRadius: "12px",
              marginTop: "16px",
              marginLeft: "-24px",
              marginRight: "-24px",
              padding: "24px",
              minHeight: "280px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {loading ? (
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "220px" }}>
                <i className="fas fa-spinner fa-spin" style={{ fontSize: "28px", color: "var(--accent-purple)" }}></i>
              </div>
            ) : clientsFiltres.length === 0 && (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "220px",
                  textAlign: "center",
                }}
              >
                <i
                  className="fas fa-user-plus"
                  style={{
                    fontSize: "68px",
                    color: "var(--text-muted)",
                    opacity: 0.28,
                    display: "block",
                    marginBottom: "20px",
                  }}
                ></i>
                <p style={{ fontSize: "16px", color: "var(--text-muted)", margin: 0 }}>
                  Aucun client trouvé.
                </p>
              </div>
            )}

            {!loading && clientsFiltres.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {clientsFiltres.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      background: "var(--dark-card)",
                      borderRadius: "12px",
                      padding: "14px 18px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      border: "1px solid var(--diamond-border)",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            background: "var(--gradient-primary)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "15px",
                            fontWeight: 800,
                            color: "white",
                            flexShrink: 0,
                          }}
                        >
                          {c.nom.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>{c.nom}</div>
                          {c.tel && <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{c.tel}</div>}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--accent-green)" }}>{fmt(c.totalBenefice, deviseActuelle)}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{c.nbCommandes} commande{c.nbCommandes > 1 ? "s" : ""}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
