"use client";
import dynamic from "next/dynamic";

const LaboClient = dynamic(() => import("./labo-client"), {
  ssr: false,
  loading: () => (
    <div className="main-content">
      <div className="container" style={{ paddingTop: "40px", textAlign: "center", color: "var(--text-muted)" }}>
        Chargement…
      </div>
    </div>
  ),
});

export default function LaboPage() {
  return <LaboClient />;
}
