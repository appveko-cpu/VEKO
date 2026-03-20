import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { plan, billing_period, auto_renew } = body as {
    plan: "solo" | "pro";
    billing_period: "monthly" | "yearly";
    auto_renew: boolean;
  };

  if (!plan || !["solo", "pro"].includes(plan)) {
    return NextResponse.json({ error: "Plan invalide" }, { status: 400 });
  }

  const PRICES: Record<string, Record<string, number>> = {
    solo: { monthly: 2500, yearly: 25000 },
    pro:  { monthly: 4500, yearly: 45000 },
  };

  const montant = PRICES[plan][billing_period ?? "monthly"];
  const apiUrl = process.env.MONEYFUSION_API_URL;

  if (!apiUrl) {
    return NextResponse.json({ error: "MONEYFUSION_API_URL non configurée" }, { status: 500 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://veko-app.com";

  const payload = {
    totalPrice: montant,
    article: [{ abonnement_veko: montant }],
    personal_Info: [
      {
        userId: user.id,
        plan: plan,
        billing_period: billing_period,
        auto_renew: auto_renew,
      },
    ],
    numeroSend: "",
    nomclient: user.email ?? "",
    return_url: `${baseUrl}/payment/success`,
    webhook_url: `${baseUrl}/api/payment/webhook`,
  };

  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok || !data.url) {
      console.error("[payment/initiate] Money Fusion error:", data);
      return NextResponse.json({ error: "Erreur Money Fusion", detail: data }, { status: 502 });
    }

    return NextResponse.json({ url: data.url });
  } catch (err) {
    console.error("[payment/initiate] fetch error:", err);
    return NextResponse.json({ error: "Erreur réseau" }, { status: 502 });
  }
}
