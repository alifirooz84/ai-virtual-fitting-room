/**
 * Unified API Client for Virtual Fitting Room
 * Supports relative path, custom API host, and timeout with AbortController.
 */

export const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    const custom = (window as any).__API_URL__ || (window as any).API_BASE_URL;
    if (custom && typeof custom === 'string') {
      return custom.replace(/\/$/, '');
    }
  }
  return '';
};

/**
 * Universal Image URL Resolver
 * Automatically resolves relative paths, fixes /uploads/ to /api/uploads/,
 * and ensures full compatibility with cPanel Apache routing.
 */
export const resolveGarmentImageUrl = (url: string | undefined): string => {
  if (!url) return '';
  if (url.startsWith('data:image')) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;

  let clean = url.trim();
  // If stored as /uploads/..., redirect to /api/uploads/... where cPanel API serves it
  if (clean.startsWith('/uploads/')) {
    clean = '/api' + clean;
  } else if (clean.startsWith('uploads/')) {
    clean = '/api/' + clean;
  }

  const base = getApiBaseUrl();
  return clean.startsWith('/') ? `${base}${clean}` : `${base}/${clean}`;
};

export const apiFetch = async (
  endpoint: string,
  init?: RequestInit,
  timeoutMs: number = 8000
): Promise<Response> => {
  const base = getApiBaseUrl();
  const fullUrl = endpoint.startsWith('http') ? endpoint : `${base}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(fullUrl, {
      ...init,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timer);
  }
};
