import type { SupabaseClient } from "@supabase/supabase-js";

interface ShopifyLineItem {
  title: string;
  quantity: number;
}

interface ShopifyCustomer {
  first_name?: string;
  last_name?: string;
  phone?: string;
}

interface ShopifyOrder {
  id: number;
  name: string;
  total_price: string;
  created_at: string;
  line_items: ShopifyLineItem[];
  customer?: ShopifyCustomer;
}

export async function syncShopifyOrders(
  userId: string,
  shop: string,
  accessToken: string,
  supabaseAdmin: SupabaseClient
): Promise<{ synced: number; total: number }> {
  const headers = {
    "X-Shopify-Access-Token": accessToken,
    "Content-Type": "application/json",
  };

  const allOrders: ShopifyOrder[] = [];
  let url: string | null =
    `https://${shop}/admin/api/2026-01/orders.json?status=any&limit=250&fields=id,name,total_price,created_at,line_items,customer`;

  while (url) {
    const pageUrl: string = url;
    const pageRes: Response = await fetch(pageUrl, { headers });
    if (!pageRes.ok) break;
    const pageData = (await pageRes.json()) as { orders?: ShopifyOrder[] };
    if (pageData.orders) allOrders.push(...pageData.orders);
    const linkHeader: string = pageRes.headers.get("Link") ?? "";
    const nextMatch: RegExpMatchArray | null = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
    url = nextMatch ? nextMatch[1] : null;
  }

  if (allOrders.length === 0) {
    return { synced: 0, total: 0 };
  }

  const { data: existingRows } = await supabaseAdmin
    .from("ventes")
    .select("shopify_order_id")
    .eq("user_id", userId)
    .not("shopify_order_id", "is", null);

  const existingIds = new Set(
    (existingRows ?? []).map((r: { shopify_order_id: string }) => r.shopify_order_id)
  );

  const { data: produits } = await supabaseAdmin
    .from("produits")
    .select("nom, prix_revient")
    .eq("user_id", userId);

  const produitMap = new Map<string, number>();
  (produits ?? []).forEach((p: { nom: string; prix_revient: number }) => {
    produitMap.set(p.nom.toLowerCase().trim(), p.prix_revient);
  });

  const newOrders = allOrders.filter(
    (o) => !existingIds.has(String(o.id))
  );

  if (newOrders.length === 0) {
    return { synced: 0, total: allOrders.length };
  }

  const rows = newOrders.map((o) => {
    const nbPieces = o.line_items.reduce((s, li) => s + li.quantity, 0) || 1;
    const ca = parseFloat(o.total_price) || 0;
    const produitNom = o.line_items[0]?.title ?? "Produit Shopify";
    const prixRevient = produitMap.get(produitNom.toLowerCase().trim()) ?? 0;
    const depenses = nbPieces * prixRevient;
    const benefice = ca - depenses;
    const marge = ca > 0 ? (benefice / ca) * 100 : 0;
    const nomClient =
      [o.customer?.first_name, o.customer?.last_name]
        .filter(Boolean)
        .join(" ") || "Client Shopify";

    return {
      user_id: userId,
      date: o.created_at,
      nom_client: nomClient,
      tel: o.customer?.phone ?? "",
      produit: produitNom,
      nb_pieces: nbPieces,
      prix_vente: nbPieces > 0 ? ca / nbPieces : ca,
      ca,
      depenses,
      benefice,
      marge,
      budget_pub_provisoire: false,
      retournee: false,
      source: "shopify",
      shopify_order_id: String(o.id),
      shopify_status: "pending",
      shopify_note: null,
    };
  });

  await supabaseAdmin.from("ventes").insert(rows);

  const totalRevenue = allOrders.reduce(
    (s, o) => s + (parseFloat(o.total_price) || 0),
    0
  );

  await supabaseAdmin.from("profiles").update({
    shopify_orders_count: allOrders.length,
    shopify_revenue: totalRevenue,
    shopify_last_sync: new Date().toISOString(),
  }).eq("id", userId);

  return { synced: newOrders.length, total: allOrders.length };
}
