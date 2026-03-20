"use client";
import { useData } from "@/context/DataContext";

export default function DemoDataBadge() {
  const { isDemoMode } = useData();
  if (!isDemoMode) return null;

  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(245,158,11,0.15), rgba(251,191,36,0.08))",
      border: "1px solid rgba(245,158,11,0.4)",
      borderRadius: "12px",
      padding: "14px 18px",
      marginBottom: "20px",
      display: "flex",
      alignItems: "center",
      gap: "14px",
    }}>
      <div style={{
        width: "40px",
        height: "40px",
        borderRadius: "10px",
        background: "rgba(245,158,11,0.2)",
        border: "1px solid rgba(245,158,11,0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}>
        <i className="fas fa-flask" style={{ color: "#f59e0b", fontSize: "18px" }}></i>
      </div>
      <div>
        <div style={{ fontSize: "12px", fontWeight: 800, color: "#f59e0b", marginBottom: "3px", letterSpacing: "0.05em" }}>
          DONNÉES DE DÉMONSTRATION
        </div>
        <div style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
          Ces chiffres sont fictifs. Crée ton compte pour entrer tes vrais chiffres et voir ta réalité.
        </div>
      </div>
    </div>
  );
}
