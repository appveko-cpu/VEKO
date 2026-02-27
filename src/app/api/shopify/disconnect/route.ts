import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(_request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase.from("profiles").update({
    shopify_connected: false,
    shopify_access_token: null,
    shopify_store_url: null,
    shopify_orders_count: 0,
    shopify_revenue: 0,
    shopify_last_sync: null,
  }).eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
