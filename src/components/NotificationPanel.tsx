"use client";
import { useState, useEffect } from "react";

type Conseil = {
  icon: string;
  color: string;
  titre: string;
  message: string;
};

type AlerteItem = {
  borderColor: string;
  icon: string;
  iconColor: string;
  titre: string;
  message: string;
  actionLabel?: string;
};

function genererConseils(): Conseil[] {
  return [
    {
      icon: "fa-lightbulb",
      color: "var(--accent-blue)",
      titre: "Bienvenue sur VEKO !",
      message: "Commencez par enregistrer vos produits dans l'onglet Produits, puis ajoutez votre première vente.",
    },
  ];
}

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function NotificationPanel({ open, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<"notifs" | "conseils">("notifs");
  const [alertes] = useState<AlerteItem[]>([]);
  const [conseils, setConseils] = useState<Conseil[]>([]);

  useEffect(() => {
    if (open) {
      setConseils(genererConseils());
    }
  }, [open]);

  return (
    <>
      <div
        className={`notif-overlay${open ? " show" : ""}`}
        onClick={onClose}
      />
      <div className={`notif-panel${open ? " show" : ""}`}>
        <div className="notif-panel-header">
          <span style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)" }}>
            Notifications
          </span>
          <button
            onClick={onClose}
            style={{
              background: "var(--hover-overlay)",
              border: "1px solid var(--diamond-border)",
              color: "var(--text-primary)",
              fontSize: "18px",
              cursor: "pointer",
              padding: "10px",
              minWidth: "44px",
              minHeight: "44px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
            }}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="notif-tabs">
          <button
            className={`notif-tab${activeTab === "notifs" ? " active" : ""}`}
            onClick={() => setActiveTab("notifs")}
          >
            <i className="fas fa-bell"></i>
            Alertes
          </button>
          <button
            className={`notif-tab${activeTab === "conseils" ? " active" : ""}`}
            onClick={() => setActiveTab("conseils")}
          >
            <i className="fas fa-lightbulb"></i>
            Conseils
          </button>
        </div>

        {activeTab === "notifs" && (
          <div className="notif-list">
            {alertes.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)" }}>
                <i className="fas fa-check-circle" style={{ fontSize: "48px", marginBottom: "16px", opacity: 0.3, display: "block" }}></i>
                <p>Aucune alerte pour le moment</p>
              </div>
            ) : (
              alertes.map((a, i) => (
                <div
                  key={i}
                  className="notif-item"
                  style={{ borderLeft: `4px solid ${a.borderColor}` }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                    <i className={`fas ${a.icon}`} style={{ color: a.iconColor }}></i>
                    <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{a.titre}</span>
                  </div>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: a.actionLabel ? "12px" : 0 }}>
                    {a.message}
                  </p>
                  {a.actionLabel && (
                    <button
                      style={{
                        padding: "8px 14px",
                        background: a.iconColor,
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "11px",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      {a.actionLabel}
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "conseils" && (
          <div className="notif-list">
            {conseils.map((c, i) => (
              <div key={i} className="notif-item">
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                  <i className={`fas ${c.icon}`} style={{ color: c.color }}></i>
                  <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{c.titre}</span>
                </div>
                <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>{c.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
