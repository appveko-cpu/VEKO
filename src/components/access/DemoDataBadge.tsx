"use client";
import { useData } from "@/context/DataContext";

export default function DemoDataBadge() {
  const { isDemoMode } = useData();
  if (!isDemoMode) return null;
  return (
    <div style={{
      background: "rgba(59,130,246,0.1)",
      border: "1px solid rgba(59,130,246,0.3)",
      borderRadius: "10px",
      padding: "10px 16px",
      marginBottom: "16px",
      display: "flex",
      alignItems: "center",
      gap: "10px",
    }}>
      <i className="fas fa-circle-info" style={{ color: "#3b82f6", fontSize: "15px", flexShrink: 0 }}></i>
      <span style={{ fontSize: "12px", fontWeight: 600, color: "#3b82f6" }}>
        DONNÉES FICTIVES — Entre tes propres chiffres pour voir ta réalité
      </span>
    </div>
  );
}
