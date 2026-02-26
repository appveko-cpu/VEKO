"use client";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import ProfileDropdown from "./ProfileDropdown";
import NotificationPanel from "./NotificationPanel";
import DeviseModal from "./DeviseModal";
import { useDevise } from "@/context/DeviseContext";

const sidebarTabs = [
  { id: "dashboard", path: "/dashboard", icon: "fas fa-chart-line", label: "Dashboard" },
  { id: "calcul", path: "/dashboard/calcul", icon: "fas fa-calculator", label: "Calcul" },
  { id: "produits", path: "/dashboard/produits", icon: "fas fa-box", label: "Produits" },
  { id: "commandes", path: "/dashboard/commandes", icon: "fas fa-receipt", label: "Commandes" },
  { id: "clients", path: "/dashboard/clients", icon: "fas fa-users", label: "Clients" },
  { id: "labo", path: "/dashboard/labo", icon: "fas fa-flask", label: "Laboratoire" },
];

const sidebarBottom = [
  { id: "parametres", path: "/dashboard/parametres", icon: "fas fa-cog", label: "Parametres" },
];

const bottomNavTabs = [
  { id: "dashboard", path: "/dashboard", icon: "fas fa-chart-line", label: "Dashboard" },
  { id: "calcul", path: "/dashboard/calcul", icon: "fas fa-calculator", label: "Calcul" },
  { id: "produits", path: "/dashboard/produits", icon: "fas fa-box", label: "Produits" },
  { id: "commandes", path: "/dashboard/commandes", icon: "fas fa-receipt", label: "Commandes" },
];

const fabItems = [
  { id: "labo", path: "/dashboard/labo", icon: "fas fa-flask", label: "Labo", color: "linear-gradient(135deg,#8b5cf6,#ec4899)" },
  { id: "clients", path: "/dashboard/clients", icon: "fas fa-users", label: "Clients", color: "#8b5cf6" },
  { id: "calcul", path: "/dashboard/calcul", icon: "fas fa-calculator", label: "Calcul", color: "#3b82f6" },
];

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [deviseOpen, setDeviseOpen] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const { deviseActuelle } = useDevise();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const isActive = (path: string) => {
    if (path === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(path);
  };

  return (
    <>
      {/* DESKTOP SIDEBAR — visible via CSS !important on ≥1024px */}
      <div className="desktop-sidebar">
        <div style={{ padding: "20px", textAlign: "center", borderBottom: "1px solid var(--diamond-border)", marginBottom: "12px" }}>
          <div style={{ fontSize: "24px", fontWeight: 900, background: "var(--gradient-primary)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: "3px" }}>
            VEKO
          </div>
          <div style={{ fontSize: "9px", color: "var(--text-muted)", marginTop: "6px", lineHeight: 1.3 }}>
            La vision de ce que<br />vous gagnez vraiment
          </div>
        </div>

        <div style={{ padding: "4px 16px 8px", fontSize: "10px", textTransform: "uppercase", letterSpacing: "1.5px", color: "var(--text-muted)", fontWeight: 700 }}>
          Onglets
        </div>

        <div>
          {sidebarTabs.map((tab) => (
            <div
              key={tab.id}
              className={`desktop-nav-item${isActive(tab.path) ? " active" : ""}`}
              onClick={() => router.push(tab.path)}
            >
              <i className={tab.icon}></i>
              <span>{tab.label}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "auto", borderTop: "1px solid var(--diamond-border)", paddingTop: "8px", paddingBottom: "8px" }}>
          {sidebarBottom.map((tab) => (
            <div
              key={tab.id}
              className={`desktop-nav-item${isActive(tab.path) ? " active" : ""}`}
              onClick={() => router.push(tab.path)}
            >
              <i className={tab.icon}></i>
              <span>{tab.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* TOP BAR MOBILE */}
      <div className="top-bar top-bar-mobile">
        <div className="top-bar-content">
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div className="top-bar-logo">VEKO</div>
          </div>

          <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <button className="top-bar-btn" style={{ marginBottom: "2px" }} onClick={() => setDeviseOpen(true)}>
              <i className="fas fa-coins"></i>
              <span>{deviseActuelle}</span>
            </button>
            <div style={{ fontSize: "9px", color: "var(--text-secondary)", textAlign: "center", maxWidth: "140px", lineHeight: 1.3, fontWeight: 700 }}>
              La vision de ce que vous gagnez vraiment
            </div>
          </div>

          <div className="top-bar-actions">
            <button className="top-bar-btn notif-btn" onClick={() => setNotifOpen(true)}>
              <i className="fas fa-bell"></i>
            </button>
            <div
              className="top-bar-icon"
              onClick={() => setProfileOpen((v) => !v)}
              style={{ cursor: "pointer" }}
            >
              <i className="fas fa-user"></i>
            </div>
          </div>
        </div>
      </div>

      {/* TOP BAR DESKTOP — visible via CSS !important on ≥1024px */}
      <div className="top-bar-desktop">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button className="top-bar-btn" onClick={() => setDeviseOpen(true)}>
              <i className="fas fa-coins"></i>
              <span>{deviseActuelle}</span>
            </button>
            <div style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 700 }}>
              La vision de ce que vous gagnez vraiment
            </div>
          </div>

          <div className="top-bar-actions">
            <button className="top-bar-btn notif-btn" onClick={() => setNotifOpen(true)}>
              <i className="fas fa-bell"></i>
            </button>
            <div
              className="top-bar-icon"
              onClick={() => setProfileOpen((v) => !v)}
              style={{ cursor: "pointer" }}
            >
              <i className="fas fa-user"></i>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM NAV MOBILE */}
      <div className="bottom-nav">
        <div className="bottom-nav-content">
          {bottomNavTabs.map((tab) => (
            <button
              key={tab.id}
              className={`nav-tab${isActive(tab.path) ? " active" : ""}`}
              onClick={() => router.push(tab.path)}
            >
              <i className={tab.icon}></i>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* FAB MOBILE */}
      <div className="fab-container">
        {fabOpen && (
          <>
            <div onClick={() => setFabOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 9997 }} />
            <div style={{ position: "absolute", bottom: "64px", right: 0, display: "flex", flexDirection: "column", gap: "10px", alignItems: "flex-end", zIndex: 9998 }}>
              {fabItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { router.push(item.path); setFabOpen(false); }}
                  style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    background: "var(--dark-card)", border: "1px solid var(--diamond-border)",
                    borderRadius: "24px", padding: "10px 16px",
                    color: "var(--text-primary)", cursor: "pointer",
                    fontSize: "14px", fontWeight: 700,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                    fontFamily: "var(--font-inter), sans-serif",
                    animation: "fabItemIn 0.18s ease",
                  }}
                >
                  <div style={{
                    width: "32px", height: "32px", borderRadius: "50%",
                    background: item.color.startsWith("linear") ? item.color : undefined,
                    backgroundColor: item.color.startsWith("linear") ? undefined : item.color,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <i className={item.icon} style={{ color: "white", fontSize: "14px" }}></i>
                  </div>
                  {item.label}
                </button>
              ))}
            </div>
          </>
        )}
        <button
          onClick={() => setFabOpen((v) => !v)}
          style={{
            width: "52px", height: "52px", borderRadius: "50%",
            background: "var(--gradient-primary)",
            border: "none", color: "white", fontSize: "22px", cursor: "pointer",
            boxShadow: "0 8px 24px rgba(16,185,129,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            position: "relative", zIndex: 9999,
            transition: "transform 0.2s ease",
            transform: fabOpen ? "rotate(45deg)" : "rotate(0deg)",
          }}
        >
          <i className="fas fa-plus"></i>
        </button>
      </div>
      <style>{`@keyframes fabItemIn { from { opacity:0; transform:translateX(20px) scale(0.9); } to { opacity:1; transform:translateX(0) scale(1); } }`}</style>

      {/* PROFILE DROPDOWN */}
      <ProfileDropdown
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
      />

      {/* NOTIFICATION PANEL */}
      <NotificationPanel
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
      />

      {/* DEVISE MODAL */}
      <DeviseModal
        open={deviseOpen}
        onClose={() => setDeviseOpen(false)}
      />
    </>
  );
}
