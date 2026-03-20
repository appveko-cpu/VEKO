import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const now = new Date().toISOString();

  const { data: expired, error } = await supabase
    .from("profiles")
    .select("id, plan, abonnement_auto, essais_restants")
    .lt("plan_expire_at", now)
    .not("plan", "in", '("free","fondateur")');

  if (error) {
    console.error("[cron/check-expiry] query error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!expired || expired.length === 0) {
    return NextResponse.json({ processed: 0 });
  }

  const mfApiUrl = process.env.MONEYFUSION_API_URL;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://veko-app.com";
  let processed = 0;

  for (const profile of expired) {
    if (profile.abonnement_auto && mfApiUrl) {
      try {
        const payload = {
          totalPrice: profile.plan === "pro" ? 4500 : 2500,
          article: [{ abonnement_veko: profile.plan === "pro" ? 4500 : 2500 }],
          personal_Info: [{ userId: profile.id, plan: profile.plan, billing_period: "monthly", auto_renew: true }],
          numeroSend: "",
          nomclient: "",
          return_url: `${appUrl}/payment/success`,
          webhook_url: `${appUrl}/api/payment/webhook`,
        };

        const res = await fetch(mfApiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.url) {
            console.log(`[cron] Auto-renewal initiated for ${profile.id}, url: ${data.url}`);
            processed++;
            continue;
          }
        }
      } catch (e) {
        console.error(`[cron] Auto-renewal error for ${profile.id}:`, e);
      }
    }

    await supabase
      .from("profiles")
      .update({ plan: "free", abonnement_auto: false })
      .eq("id", profile.id);

    processed++;
  }

  return NextResponse.json({ processed, total: expired.length });
}
