export default async function handler(req, res) {
    const { code, shop, state } = req.query;

    if (!code || !shop || !state) {
        return res.redirect(302, 'https://veko-app.com/?shopify=error&reason=missing_params');
    }

    const clientId = process.env.SHOPIFY_CLIENT_ID;
    const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;
    const supabaseUrl = process.env.SUPABASE_URL || 'https://qeimizgeiqwtppzaecdz.supabase.co';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!clientId || !clientSecret || !supabaseKey) {
        return res.redirect(302, 'https://veko-app.com/?shopify=error&reason=server_config');
    }

    const sepIndex = state.lastIndexOf('_');
    let userId, importRange;
    if (sepIndex > 0) {
        userId = state.substring(0, sepIndex);
        importRange = state.substring(sepIndex + 1);
    } else {
        userId = state;
        importRange = 'all';
    }

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
            console.error('Token exchange failed:', tokenRes.status, errText);
            return res.redirect(302, 'https://veko-app.com/?shopify=error&reason=token_exchange');
        }

        const tokenData = await tokenRes.json();
        const accessToken = tokenData.access_token;

        if (!accessToken) {
            console.error('No access_token in response:', JSON.stringify(tokenData));
            return res.redirect(302, 'https://veko-app.com/?shopify=error&reason=no_token');
        }

        await fetch(`${supabaseUrl}/rest/v1/shopify_connections?user_id=eq.${userId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
            }
        });

        await fetch(`${supabaseUrl}/rest/v1/shopify_connections?shop_domain=eq.${encodeURIComponent(shop)}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
            }
        });

        const insertRes = await fetch(`${supabaseUrl}/rest/v1/shopify_connections`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                user_id: userId,
                shop_domain: shop,
                access_token: accessToken
            })
        });

        if (!insertRes.ok) {
            const errText = await insertRes.text();
            console.error('Supabase insert error:', insertRes.status, errText);
            return res.redirect(302, `https://veko-app.com/?shopify=error&reason=db_insert&detail=${encodeURIComponent(errText.substring(0, 100))}`);
        }

        return res.redirect(302, `https://veko-app.com/?shopify=success&import_range=${importRange}`);
    } catch (err) {
        console.error('OAuth callback error:', err.message || err);
        return res.redirect(302, `https://veko-app.com/?shopify=error&reason=exception&detail=${encodeURIComponent(String(err.message || err).substring(0, 100))}`);
    }
}
