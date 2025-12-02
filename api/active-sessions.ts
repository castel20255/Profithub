// Vercel API handler (no external import needed)

module.exports = async function handler(req, res) {
    const { url } = req.query;
    if (!url || typeof url !== 'string') {
        res.status(400).json({ error: 'Missing or invalid url parameter' });
        return;
    }
    try {
        const cookieHeader = req.headers.cookie || '';
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Cookie: cookieHeader,
            },
        });
        if (!response.ok) {
            res.status(response.status).json({ error: `Upstream error ${response.status}` });
            return;
        }
        const data = await response.json();
        res.status(200).json(data);
    } catch (e) {
        console.error('Proxy error', e);
        res.status(500).json({ error: 'Internal server error' });
    }
};
