import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const AMOUNTS: Record<string, Record<string, number>> = {
  solo: { mensuel: 2500, annuel: 25000 },
  pro: { mensuel: 4500, annuel: 45000 },
};

const LABELS: Record<string, Record<string, string>> = {
  solo: { mensuel: "Abonnement VEKO Solo Mensuel", annuel: "Abonnement VEKO Solo Annuel" },
  pro: { mensuel: "Abonnement VEKO Pro Mensuel", annuel: "Abonnement VEKO Pro Annuel" },
};

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { plan?: string; period?: string; autoRenew?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { plan, period, autoRenew } = body;

  if (!plan || !period || !AMOUNTS[plan] || !AMOUNTS[plan][period]) {
    return NextResponse.json({ error: "Invalid plan or period" }, { status: 400 });
  }

  const totalPrice = AMOUNTS[plan][period];
  const articleName = LABELS[plan][period];
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://veko-app.com";

  const payload = {
    totalPrice,
    article: [{ name: articleName, price: totalPrice }],
    personal_Info: [
      {
        userId: user.id,
        plan,
        period,
        autoRenew: autoRenew === true,
      },
    ],
    numeroSend: "",
    nomclient: user.email ?? "",
    return_url: `${appUrl}/payment/success`,
    webhook_url: `${appUrl}/api/payment/webhook`,
  };

  let mfResponse: Response;
  try {
    mfResponse = await fetch(
      "https://www.pay.moneyfusion.net/VEKO/9cc0f7a0cc72e8cb/pay/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
  } catch (err) {
    console.error("[payment/initiate] Money Fusion fetch error:", err);
    return NextResponse.json({ error: "Payment provider unavailable" }, { status: 502 });
  }

  let mfData: { payment_url?: string; token?: string; message?: string };
  try {
    mfData = await mfResponse.json();
  } catch {
    return NextResponse.json({ error: "Invalid response from payment provider" }, { status: 502 });
  }

  const paymentUrl = mfData.payment_url ?? mfData.token;
  if (!paymentUrl) {
    console.error("[payment/initiate] No payment_url in MF response:", mfData);
    return NextResponse.json({ error: "No payment URL returned" }, { status: 502 });
  }

  return NextResponse.json({ payment_url: paymentUrl });
}
