import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const AMOUNTS: Record<string, Record<string, number>> = {
  solo: { mensuel: 2500, annuel: 25000 },
  pro: { mensuel: 4500, annuel: 45000 },
};

const LABELS: Record<string, Record<string, string>> = {
  solo: { mensuel: "Abonnement VEKO Solo Mensuel", annuel: "Abonnement VEKO Solo Annuel" },
  pro: { mensuel: "Abonnement VEKO Pro Mensuel", annuel: "Abonnement VEKO Pro Annuel" },
};

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    console.error("[cron/expire-subscriptions] Missing SUPABASE_SERVICE_ROLE_KEY");
    return NextResponse.json({ error: "Server config error" }, { status: 500 });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const now = new Date();
  const windowStart = new Date(now.getTime() - 26 * 60 * 60 * 1000);

  const { data: profiles, error: fetchError } = await supabaseAdmin
    .from("profiles")
    .select("id, plan, plan_period, abonnement_auto, plan_expire_at")
    .not("plan", "in", '("free","fondateur")')
    .gte("plan_expire_at", windowStart.toISOString())
    .lte("plan_expire_at", now.toISOString());

  if (fetchError) {
    console.error("[cron/expire-subscriptions] Fetch error:", fetchError);
    return NextResponse.json({ error: "DB fetch failed" }, { status: 500 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://veko-app.com";

  let processed = 0;
  let renewed = 0;
  let expired = 0;
  let errors = 0;

  for (const profile of profiles ?? []) {
    processed++;
    const plan = profile.plan as string;
    const period: "mensuel" | "annuel" =
      profile.plan_period === "annuel" ? "annuel" : "mensuel";

    if (!profile.abonnement_auto) {
      await supabaseAdmin
        .from("profiles")
        .update({ plan: "free", essais_restants: 0 })
        .eq("id", profile.id);
      expired++;
      continue;
    }

    if (!AMOUNTS[plan]) {
      await supabaseAdmin
        .from("profiles")
        .update({ plan: "free", essais_restants: 0 })
        .eq("id", profile.id);
      errors++;
      continue;
    }

    const totalPrice = AMOUNTS[plan][period];
    const articleName = LABELS[plan][period];

    let email = "";
    try {
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(profile.id);
      email = userData?.user?.email ?? "";
    } catch (err) {
      console.error("[cron/expire-subscriptions] getUserById error:", err);
    }

    const payload = {
      totalPrice,
      article: [{ [articleName]: totalPrice }],
      personal_Info: [
        {
          userId: profile.id,
          plan,
          period,
          autoRenew: true,
        },
      ],
      numeroSend: "0000000000",
      nomclient: email,
      return_url: `${appUrl}/payment/success`,
      webhook_url: `${appUrl}/api/payment/webhook`,
    };

    try {
      const mfResponse = await fetch(
        "https://www.pay.moneyfusion.net/VEKO/9cc0f7a0cc72e8cb/pay/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const mfData: { statut?: boolean; url?: string } = await mfResponse.json();

      if (mfData.url && mfData.statut !== false) {
        const graceExpiry = new Date(Date.now() + 25 * 60 * 60 * 1000);
        await supabaseAdmin
          .from("profiles")
          .update({ plan_expire_at: graceExpiry.toISOString() })
          .eq("id", profile.id);
        renewed++;
      } else {
        await supabaseAdmin
          .from("profiles")
          .update({ plan: "free", essais_restants: 0 })
          .eq("id", profile.id);
        errors++;
      }
    } catch (err) {
      console.error("[cron/expire-subscriptions] MF error for", profile.id, err);
      await supabaseAdmin
        .from("profiles")
        .update({ plan: "free", essais_restants: 0 })
        .eq("id", profile.id);
      errors++;
    }
  }

  return NextResponse.json({ processed, renewed, expired, errors });
}
