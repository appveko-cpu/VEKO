import Link from "next/link";

export default function Home() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--ultra-dark)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      fontFamily: "var(--font-inter), system-ui, sans-serif",
    }}>
      <div style={{ textAlign: "center", maxWidth: "400px", width: "100%" }}>
        {/* Icon */}
        <div style={{
          width: "90px", height: "90px", borderRadius: "24px",
          background: "var(--gradient-primary)",
          margin: "0 auto 24px",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "42px", color: "white",
          boxShadow: "var(--shadow-green)",
        }}>
          <i className="fas fa-chart-line"></i>
        </div>

        <h1 style={{ fontSize: "48px", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-1px", marginBottom: "12px" }}>
          VEKO
        </h1>
        <p style={{ fontSize: "16px", color: "var(--text-muted)", marginBottom: "40px", lineHeight: 1.6 }}>
          Gestion financière intelligente<br />pour vendeurs africains
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <Link href="/login" style={{
            display: "block", padding: "16px 24px",
            background: "var(--gradient-primary)",
            color: "white", borderRadius: "14px", fontWeight: 700, fontSize: "15px",
            textDecoration: "none", boxShadow: "var(--shadow-green)",
          }}>
            <i className="fas fa-sign-in-alt" style={{ marginRight: "10px" }}></i>
            Se connecter
          </Link>
          <Link href="/signup" style={{
            display: "block", padding: "16px 24px",
            background: "var(--dark-card)",
            border: "1px solid var(--diamond-border)",
            color: "var(--text-primary)", borderRadius: "14px", fontWeight: 700, fontSize: "15px",
            textDecoration: "none",
          }}>
            <i className="fas fa-user-plus" style={{ marginRight: "10px" }}></i>
            Créer un compte
          </Link>
        </div>
      </div>
    </div>
  );
}
