export function requireLocalRequest(request: Request) {
  const url = new URL(request.url);
  const loopback = new Set(['localhost', '127.0.0.1', '[::1]']);
  if (!loopback.has(url.hostname) || !['http:', 'https:'].includes(url.protocol)) throw new Error('This runtime is available on the local machine only.');
  // Next may normalize its request URL to localhost while the browser uses 127.0.0.1.
  // Compare the browser origin with the validated HTTP Host, never forwarded headers.
  const host = request.headers.get('host');
  const actual = host ? new URL(`${url.protocol}//${host}`) : url;
  if (!loopback.has(actual.hostname) || actual.port !== url.port || actual.username || actual.password || (host && actual.host.toLowerCase() !== host.toLowerCase())) throw new Error('Loopback host identity mismatch.');
  const origin = request.headers.get('origin');
  if (origin && origin !== actual.origin) throw new Error('Cross-origin runtime requests are disabled.');
  if (request.headers.get('sec-fetch-site') === 'cross-site') throw new Error('Cross-site runtime requests are disabled.');
}
