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
