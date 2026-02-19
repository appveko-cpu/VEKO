export default function handler(req, res) {
    const { shop, user_id, import_range } = req.query;

    if (!shop || !user_id) {
        return res.status(400).json({ error: 'Missing shop or user_id' });
    }

    const clientId = process.env.SHOPIFY_CLIENT_ID;
    if (!clientId) {
        return res.status(500).json({ error: 'SHOPIFY_CLIENT_ID not configured' });
    }

    const scopes = 'read_customers,write_customers,write_draft_orders,read_draft_orders,read_fulfillments,write_fulfillments,write_inventory,read_inventory,write_locations,read_locations,write_marketing_events,read_marketing_events,write_order_edits,read_order_edits,read_orders,write_orders,read_products,read_shipping,write_shipping';
    const redirectUri = 'https://veko-app.com/api/auth/shopify';
    const state = `${user_id}_${import_range || 'all'}`;

    const shopDomain = shop.includes('.myshopify.com') ? shop : `${shop}.myshopify.com`;
    const authUrl = `https://${shopDomain}/admin/oauth/authorize?client_id=${clientId}&scope=${scopes}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(state)}`;

    res.redirect(302, authUrl);
}
