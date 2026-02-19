export default async function handler(req, res) {
    const { user_id } = req.query;
    if (!user_id) return res.status(400).json({ error: 'Missing user_id' });

    const supabaseUrl = process.env.SUPABASE_URL || 'https://qeimizgeiqwtppzaecdz.supabase.co';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseKey) return res.status(500).json({ error: 'Server not configured' });

    try {
        const connRes = await fetch(`${supabaseUrl}/rest/v1/shopify_connections?user_id=eq.${user_id}&select=shop_domain,access_token`, {
            headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
        });
        const connections = await connRes.json();
        if (!connections || connections.length === 0) return res.status(404).json({ error: 'No Shopify connection' });

        const { shop_domain, access_token } = connections[0];
        const custRes = await fetch(`https://${shop_domain}/admin/api/2026-01/customers.json?limit=250`, {
            headers: { 'X-Shopify-Access-Token': access_token }
        });
        if (!custRes.ok) {
            const errText = await custRes.text();
            return res.status(custRes.status).json({ error: 'Shopify API error', details: errText });
        }

        const data = await custRes.json();
        res.status(200).json(data);
    } catch (err) {
        console.error('Customers proxy error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}
