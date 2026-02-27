import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createHmac, timingSafeEqual } from "crypto";

function validateShopifyHmac(searchParams: URLSearchParams, secret: string): boolean {
  const pairs: string[] = [];
  searchParams.forEach((value, key) => {
    if (key !== "hmac") pairs.push(`${key}=${value}`);
  });
  pairs.sort();
  const message = pairs.join("&");
  const digest = createHmac("sha256", secret).update(message).digest("hex");
  const provided = searchParams.get("hmac") ?? "";
  try {
    return timingSafeEqual(Buffer.from(digest), Buffer.from(provided));
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://veko-app.com";

  const errorRedirect = (reason: string) =>
    NextResponse.redirect(`${appUrl}/dashboard/parametres?shopify=error&reason=${reason}`);

  const code = searchParams.get("code");
  const shop = searchParams.get("shop");
  const hmac = searchParams.get("hmac");
  const state = searchParams.get("state");

  if (!code || !shop || !hmac || !state) return errorRedirect("missing_params");

  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;
  if (!clientSecret) return errorRedirect("server_config");

  if (!validateShopifyHmac(searchParams, clientSecret)) return errorRedirect("invalid_hmac");

  const oauthCookie = request.cookies.get("shopify_oauth");
  if (!oauthCookie) return errorRedirect("no_state_cookie");

  let cookieData: { userId: string; nonce: string; shop: string };
  try {
    cookieData = JSON.parse(Buffer.from(oauthCookie.value, "base64url").toString("utf-8"));
  } catch {
    return errorRedirect("invalid_cookie");
  }

  if (cookieData.nonce !== state || cookieData.shop !== shop) {
    return errorRedirect("state_mismatch");
  }

  let accessToken: string;
  try {
    const tokenRes = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.SHOPIFY_CLIENT_ID,
        client_secret: clientSecret,
        code,
      }),
    });
    if (!tokenRes.ok) return errorRedirect("token_exchange_failed");
    const tokenData = await tokenRes.json() as { access_token?: string };
    if (!tokenData.access_token) return errorRedirect("no_access_token");
    accessToken = tokenData.access_token;
  } catch {
    return errorRedirect("token_exchange_failed");
  }

  let ordersCount = 0;
  let totalRevenue = 0;
  try {
    const headers = {
      "X-Shopify-Access-Token": accessToken,
      "Content-Type": "application/json",
    };
    const [countRes, ordersRes] = await Promise.all([
      fetch(`https://${shop}/admin/api/2026-01/orders/count.json?status=any`, { headers }),
      fetch(`https://${shop}/admin/api/2026-01/orders.json?status=any&limit=250&fields=id,total_price`, { headers }),
    ]);
    if (countRes.ok) {
      const countData = await countRes.json() as { count?: number };
      ordersCount = countData.count ?? 0;
    }
    if (ordersRes.ok) {
      const ordersData = await ordersRes.json() as { orders?: { total_price: string }[] };
      if (ordersData.orders) {
        totalRevenue = ordersData.orders.reduce(
          (sum, o) => sum + parseFloat(o.total_price || "0"), 0
        );
      }
    }
  } catch {
    /* stats optionnelles */
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) return errorRedirect("server_config");

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { error: updateError } = await supabaseAdmin.from("profiles").update({
    shopify_access_token: accessToken,
    shopify_store_url: shop,
    shopify_connected: true,
    shopify_orders_count: ordersCount,
    shopify_revenue: totalRevenue,
    shopify_last_sync: new Date().toISOString(),
  }).eq("id", cookieData.userId);

  if (updateError) return errorRedirect("db_update_failed");

  const response = NextResponse.redirect(`${appUrl}/dashboard/parametres?shopify=success`);
  response.cookies.delete("shopify_oauth");
  return response;
}
