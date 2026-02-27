import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { randomUUID } from "crypto";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const shopParam = searchParams.get("shop");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://veko-app.com";

  if (!shopParam?.trim()) {
    return NextResponse.redirect(`${appUrl}/dashboard/parametres?shopify=error&reason=missing_shop`);
  }

  let shop = shopParam.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
  if (!shop.includes(".")) {
    shop = `${shop}.myshopify.com`;
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(`${appUrl}/login`);
  }

  const nonce = randomUUID();
  const statePayload = Buffer.from(
    JSON.stringify({ userId: user.id, nonce, shop })
  ).toString("base64url");

  const scopes = [
    "read_orders", "write_orders",
    "read_products",
    "read_customers", "write_customers",
    "read_draft_orders", "write_draft_orders",
    "read_fulfillments", "write_fulfillments",
    "read_inventory", "write_inventory",
  ].join(",");

  const redirectUri = `${appUrl}/api/auth/shopify`;
  const shopifyAuthUrl =
    `https://${shop}/admin/oauth/authorize` +
    `?client_id=${process.env.SHOPIFY_CLIENT_ID}` +
    `&scope=${encodeURIComponent(scopes)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&state=${nonce}`;

  const response = NextResponse.redirect(shopifyAuthUrl);
  response.cookies.set("shopify_oauth", statePayload, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
