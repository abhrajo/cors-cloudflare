export async function onRequest(context) {
  const request = context.request;

  const url = new URL(request.url);
  const targetUrl = url.searchParams.get('url');

  if (request.method === 'OPTIONS') {
    return handleOptions();
  }

  if (!targetUrl) {
    return new Response('Missing "url" query parameter', { status: 400 });
  }

  const modifiedHeaders = new Headers(request.headers);
  modifiedHeaders.delete('origin');

  const modifiedRequest = new Request(targetUrl, {
    method: request.method,
    headers: modifiedHeaders,
    body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : null
  });

  try {
    const response = await fetch(modifiedRequest);
    const responseHeaders = new Headers(response.headers);

    // Set CORS headers
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cache-Control');
    responseHeaders.set('Access-Control-Expose-Headers', '*');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders
    });
  } catch (error) {
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}

function handleOptions() {
  const headers = new Headers();

  headers.set('Access-Control-Allow-Origin', '*'); // For preflight requests, allow all origins
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cache-Control');
  headers.set('Access-Control-Max-Age', '86400'); // Cache preflight response for 1 day

  return new Response(null, {
    status: 204,
    headers
  });
}