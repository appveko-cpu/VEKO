import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

interface PersonalInfo {
  userId?: string;
  plan?: string;
  period?: string;
  autoRenew?: boolean | string;
}

interface WebhookPayload {
  event?: string;
  tokenPay?: string;
  personal_Info?: PersonalInfo[];
}

export async function POST(request: NextRequest) {
  let body: WebhookPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { tokenPay, event, personal_Info } = body;

  if (event !== "payin.session.completed") {
    return NextResponse.json({ received: true });
  }

  if (!tokenPay) {
    return NextResponse.json({ error: "Missing tokenPay" }, { status: 400 });
  }

  const info = personal_Info?.[0];
  const userId = info?.userId;
  const plan = info?.plan;
  const period = info?.period;
  const autoRenew = info?.autoRenew;

  if (!userId || !plan || !period) {
    return NextResponse.json({ error: "Missing personal_Info fields" }, { status: 400 });
  }

  if (!["solo", "pro"].includes(plan) || !["mensuel", "annuel"].includes(period)) {
    return NextResponse.json({ error: "Invalid plan or period" }, { status: 400 });
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    console.error("[payment/webhook] Missing SUPABASE_SERVICE_ROLE_KEY");
    return NextResponse.json({ error: "Server config error" }, { status: 500 });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("last_payment_ref")
    .eq("id", userId)
    .single();

  if (profile?.last_payment_ref === tokenPay) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  const now = new Date();
  const expireAt = new Date(now);
  if (period === "annuel") {
    expireAt.setDate(expireAt.getDate() + 365);
  } else {
    expireAt.setDate(expireAt.getDate() + 30);
  }

  const { error: updateError } = await supabaseAdmin
    .from("profiles")
    .update({
      plan,
      plan_start_at: now.toISOString(),
      plan_expire_at: expireAt.toISOString(),
      abonnement_auto: autoRenew === true || autoRenew === "true",
      essais_restants: 999,
      plan_period: period,
      last_payment_ref: tokenPay,
    })
    .eq("id", userId);

  if (updateError) {
    console.error("[payment/webhook] Supabase update error:", updateError);
    return NextResponse.json({ error: "DB update failed" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
