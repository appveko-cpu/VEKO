export default async function handler(req, res) {
    const { code, shop, state } = req.query;

    if (!code || !shop || !state) {
        return res.status(400).json({ error: 'Missing code, shop or state' });
    }

    const clientId = process.env.SHOPIFY_CLIENT_ID;
    const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;
    const supabaseUrl = process.env.SUPABASE_URL || 'https://qeimizgeiqwtppzaecdz.supabase.co';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!clientId || !clientSecret || !supabaseKey) {
        return res.status(500).json({ error: 'Server configuration missing' });
    }

    const parts = state.split('_');
    const userId = parts[0];
    const importRange = parts.slice(1).join('_') || 'all';

    try {
        const tokenRes = await fetch(`https://${shop}/admin/oauth/access_token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                client_id: clientId,
                client_secret: clientSecret,
                code: code
            })
        });

        if (!tokenRes.ok) {
            const errText = await tokenRes.text();
            return res.status(400).json({ error: 'Shopify token exchange failed', details: errText });
        }

        const tokenData = await tokenRes.json();
        const accessToken = tokenData.access_token;

        const upsertRes = await fetch(`${supabaseUrl}/rest/v1/shopify_connections?on_conflict=shop_domain`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Prefer': 'resolution=merge-duplicates'
            },
            body: JSON.stringify({
                user_id: userId,
                shop_domain: shop,
                access_token: accessToken
            })
        });

        if (!upsertRes.ok) {
            const errText = await upsertRes.text();
            console.error('Supabase upsert error:', errText);
        }

        res.redirect(302, `https://veko-app.com/?shopify=success&import_range=${importRange}`);
    } catch (err) {
        console.error('OAuth callback error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}
