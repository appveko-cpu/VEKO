import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const processed = new Set<string>();

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const event = body.event as string;

  if (event !== "payin.session.completed") {
    return NextResponse.json({ ignored: true });
  }

  const tokenPay = body.tokenPay as string | undefined;
  if (tokenPay) {
    if (processed.has(tokenPay)) {
      return NextResponse.json({ duplicate: true });
    }
    processed.add(tokenPay);
    setTimeout(() => processed.delete(tokenPay!), 60 * 60 * 1000);
  }

  const personalInfoArr = body.personal_Info as Array<{
    userId?: string;
    plan?: string;
    billing_period?: string;
    auto_renew?: boolean;
  }> | undefined;

  const info = Array.isArray(personalInfoArr) ? personalInfoArr[0] : null;

  if (!info?.userId || !info?.plan) {
    console.error("[webhook] Missing userId or plan:", body);
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const durationDays = info.billing_period === "yearly" ? 365 : 30;
  const now = new Date();
  const expiry = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

  const { error } = await supabase
    .from("profiles")
    .update({
      plan: info.plan,
      plan_start_at: now.toISOString(),
      plan_expire_at: expiry.toISOString(),
      abonnement_auto: info.auto_renew ?? false,
      essais_restants: 999,
    })
    .eq("id", info.userId);

  if (error) {
    console.error("[webhook] Supabase update error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.log(`[webhook] Plan ${info.plan} activé pour user ${info.userId}`);
  return NextResponse.json({ success: true });
}
