import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { syncShopifyOrders } from "@/lib/shopify/sync-orders";

export async function POST(_request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    return NextResponse.json({ error: "server_config" }, { status: 500 });
  }

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("shopify_connected, shopify_access_token, shopify_store_url")
    .eq("id", user.id)
    .single();

  if (!profile?.shopify_connected || !profile.shopify_access_token || !profile.shopify_store_url) {
    return NextResponse.json({ error: "shopify_not_connected" }, { status: 400 });
  }

  try {
    const result = await syncShopifyOrders(
      user.id,
      profile.shopify_store_url,
      profile.shopify_access_token,
      supabaseAdmin
    );
    return NextResponse.json(result);
  } catch (e) {
    console.error("[shopify/sync] error:", e);
    return NextResponse.json({ error: "sync_failed" }, { status: 500 });
  }
}
