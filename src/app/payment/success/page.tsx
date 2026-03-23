"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(4);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          router.push("/dashboard");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [router]);

  const progress = ((4 - countdown) / 4) * 100;

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--dark-bg)",
      padding: "20px",
    }}>
      <div style={{
        maxWidth: "420px",
        width: "100%",
        background: "var(--dark-card)",
        borderRadius: "24px",
        padding: "40px 32px",
        border: "1px solid var(--diamond-border)",
        textAlign: "center",
      }}>
        <div style={{
          width: "72px",
          height: "72px",
          borderRadius: "50%",
          background: "rgba(16,185,129,0.15)",
          border: "2px solid var(--accent-green)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 24px",
        }}>
          <i className="fas fa-circle-check" style={{
            fontSize: "32px",
            color: "var(--accent-green)",
          }} />
        </div>

        <h1 style={{
          fontSize: "24px",
          fontWeight: 800,
          color: "var(--text-primary)",
          marginBottom: "12px",
        }}>
          Paiement confirmé !
        </h1>

        <p style={{
          fontSize: "14px",
          color: "var(--text-muted)",
          lineHeight: 1.6,
          marginBottom: "32px",
        }}>
          Votre plan est maintenant actif. Redirection vers votre tableau de bord dans{" "}
          <strong style={{ color: "var(--text-primary)" }}>{countdown}s</strong>...
        </p>

        <div style={{
          width: "100%",
          height: "4px",
          background: "var(--dark-elevated)",
          borderRadius: "2px",
          overflow: "hidden",
          marginBottom: "24px",
        }}>
          <div style={{
            height: "100%",
            width: `${progress}%`,
            background: "var(--accent-green)",
            borderRadius: "2px",
            transition: "width 1s linear",
          }} />
        </div>

        <button
          onClick={() => router.push("/dashboard")}
          style={{
            padding: "12px 24px",
            borderRadius: "12px",
            border: "none",
            background: "var(--gradient-primary)",
            color: "white",
            fontSize: "14px",
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "var(--font-inter), sans-serif",
          }}
        >
          Aller au tableau de bord
        </button>
      </div>
    </div>
  );
}
