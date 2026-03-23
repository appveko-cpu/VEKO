"use client";
import dynamic from "next/dynamic";

const CommandesClient = dynamic(() => import("./commandes-client"), {
  ssr: false,
  loading: () => (
    <div className="main-content">
      <div className="container" style={{ paddingTop: "40px", textAlign: "center", color: "var(--text-muted)" }}>
        Chargement…
      </div>
    </div>
  ),
});

export default function CommandesPage() {
  return <CommandesClient />;
}
