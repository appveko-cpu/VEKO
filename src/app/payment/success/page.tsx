"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(4);

  const plan = searchParams.get("plan") ?? "";
  const PLAN_LABELS: Record<string, string> = { solo: "Solo", pro: "Pro", fondateur: "Fondateur" };
  const planLabel = PLAN_LABELS[plan] ?? "";

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

  return (
    <div style={{
      minHeight: "100dvh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#0f0f23",
      padding: "20px",
      fontFamily: "Inter, sans-serif",
    }}>
      <div style={{
        background: "#1a1a2e",
        border: "1px solid rgba(16,185,129,0.4)",
        borderRadius: "24px",
        padding: "48px 36px",
        maxWidth: "400px",
        width: "100%",
        textAlign: "center",
      }}>
        <div style={{
          width: "72px", height: "72px", borderRadius: "50%",
          background: "linear-gradient(135deg, #10b981, #059669)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "32px", color: "white",
          margin: "0 auto 24px",
          boxShadow: "0 8px 30px rgba(16,185,129,0.35)",
        }}>
          <i className="fas fa-check"></i>
        </div>

        <h1 style={{ fontSize: "28px", fontWeight: 900, color: "white", margin: "0 0 12px" }}>
          Accès activé !
        </h1>

        {planLabel && (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)",
            borderRadius: "20px", padding: "6px 16px",
            fontSize: "14px", fontWeight: 800, color: "#10b981",
            marginBottom: "20px",
          }}>
            <i className="fas fa-star"></i>
            Plan {planLabel}
          </div>
        )}

        <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.65)", lineHeight: 1.6, margin: "0 0 28px" }}>
          Ton abonnement est actif. Tu peux maintenant utiliser toutes les fonctionnalités VEKO sans limite.
        </p>

        <button
          onClick={() => router.push("/dashboard")}
          style={{
            width: "100%", padding: "14px", borderRadius: "12px",
            background: "linear-gradient(135deg, #10b981, #059669)",
            color: "white", fontWeight: 800, fontSize: "15px",
            border: "none", cursor: "pointer",
          }}
        >
          <i className="fas fa-arrow-right" style={{ marginRight: "8px" }}></i>
          Aller au dashboard ({countdown}s)
        </button>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
