export default async function handler(req, res) {
  // Set CORS headers so browser requests never get blocked
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, ngrok-skip-browser-warning, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const rawPath = req.query?.path;
    const pathFromUrl = (req.url || '').split('?')[0].replace(/^\/api\/?/, '');
    const pathString = Array.isArray(rawPath)
      ? rawPath.join('/')
      : (typeof rawPath === 'string' && rawPath ? rawPath : pathFromUrl);

    // Extract search query if present
    const urlParts = (req.url || '').split('?');
    const queryString = urlParts.length > 1 ? `?${urlParts[1]}` : '';

    // Ensure clean sub-path with trailing slash for Django endpoints
    let cleanSubPath = (pathString || '').trim().replace(/^\/+/, '');
    if (cleanSubPath && !cleanSubPath.endsWith('/')) {
      cleanSubPath += '/';
    }

    const targetUrl = `https://hydration-cycle-answering.ngrok-free.dev/quik/${cleanSubPath}${queryString}`;

    const headers = {
      'Content-Type': req.headers['content-type'] || 'application/json',
      'ngrok-skip-browser-warning': '69420',
      'User-Agent': 'QUIK-Vercel-Proxy/1.0',
    };

    const fetchOptions = {
      method: req.method,
      headers,
    };

    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      fetchOptions.body = typeof req.body === 'object' ? JSON.stringify(req.body) : req.body;
    }

    const response = await fetch(targetUrl, fetchOptions);
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const data = await response.json();
      return res.status(response.status).json(data);
    } else {
      const text = await response.text();
      return res.status(response.status).send(text);
    }
  } catch (error) {
    console.error('Vercel proxy error:', error);
    return res.status(502).json({
      error: 'Unable to reach the QUIK backend server.',
      detail: error.message,
    });
  }
}
