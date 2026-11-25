/**
 * Unified API Client for Virtual Fitting Room
 * Supports relative path (same domain / reverse proxy) and custom API host (subdomain / separate port).
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

export const apiFetch = (endpoint: string, init?: RequestInit): Promise<Response> => {
  const base = getApiBaseUrl();
  const fullUrl = endpoint.startsWith('http') ? endpoint : `${base}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  return fetch(fullUrl, init);
};
