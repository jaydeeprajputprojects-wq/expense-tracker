const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwVJ783UQBEP6UreGyZ3fdANeFlpp0Yq2zr0iSUhIBmdfSpsn7S_hwmGXwH2gdx4wz5/exec';

function buildCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept, Authorization',
    'Access-Control-Max-Age': '86400'
  };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: buildCorsHeaders()
      });
    }

    if (url.pathname.startsWith('/api')) {
      const targetUrl = new URL(GOOGLE_APPS_SCRIPT_URL);
      const queryString = url.search || '';
      const upstreamUrl = `${targetUrl.origin}${targetUrl.pathname}${queryString}`;

      const upstreamRequest = new Request(upstreamUrl, {
        method: request.method,
        headers: request.headers,
        body: request.method === 'GET' || request.method === 'HEAD' ? undefined : await request.text(),
      });

      const response = await fetch(upstreamRequest);
      const responseText = await response.text();

      return new Response(responseText, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          ...buildCorsHeaders(),
          'Content-Type': response.headers.get('Content-Type') || 'application/json'
        }
      });
    }

    return env.ASSETS.fetch(request);
  }
};
