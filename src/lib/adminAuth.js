// FinFamily Central Bank / Operations Admin API Client

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return '/api';
    }
  }
  return 'https://finfamily-backend.vercel.app/api';
};

const ADMIN_TOKEN_KEY = 'finfamily_admin_token';
const ADMIN_EMAIL_KEY = 'finfamily_admin_email';

export function getAdminToken() {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(ADMIN_TOKEN_KEY) || localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function getAdminEmail() {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(ADMIN_EMAIL_KEY) || localStorage.getItem(ADMIN_EMAIL_KEY) || 'Admin';
}

export function setAdminAuth(token, email) {
  if (typeof window === 'undefined') return;
  if (token) {
    sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
    sessionStorage.setItem(ADMIN_EMAIL_KEY, email || '');
  } else {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    sessionStorage.removeItem(ADMIN_EMAIL_KEY);
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_EMAIL_KEY);
  }
}

export function isAdminLoggedIn() {
  return Boolean(getAdminToken());
}

export async function adminRequest(method, endpoint, data) {
  const token = getAdminToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${getBaseUrl()}${endpoint}`;
  const response = await fetch(url, {
    method,
    headers,
    body: data !== undefined ? JSON.stringify(data) : undefined,
  });

  let body = null;
  try {
    body = await response.json();
  } catch {
    // Non-JSON or empty response
  }

  if (!response.ok) {
    let msg = response.statusText || 'Admin Request failed';
    if (typeof body?.detail === 'string') {
      msg = body.detail;
    } else if (Array.isArray(body?.detail)) {
      msg = body.detail.map((e) => e.msg || JSON.stringify(e)).join(' · ');
    }
    const err = new Error(msg);
    err.status = response.status;
    err.data = body;
    throw err;
  }

  return body;
}

export const adminApi = {
  login: (email, password) =>
    adminRequest('POST', '/admin/auth/login', { email, password }),

  getOverview: () => adminRequest('GET', '/admin/overview'),

  getTransactions: (params = {}) => {
    const qs = new URLSearchParams();
    if (params.status) qs.set('status', params.status);
    if (params.declineReason) qs.set('decline_reason', params.declineReason);
    if (params.limit) qs.set('limit', params.limit);
    const query = qs.toString();
    return adminRequest('GET', `/admin/transactions${query ? `?${query}` : ''}`);
  },

  getCards: () => adminRequest('GET', '/admin/cards'),

  updateCardStatus: (walletId, cardStatus) =>
    adminRequest('PATCH', `/admin/cards/${walletId}/status`, { card_status: cardStatus }),

  getDatabaseHealth: () => adminRequest('GET', '/admin/database/health'),

  getSecurityAlerts: () => adminRequest('GET', '/admin/security/alerts'),

  sendBeacon: (eventData) =>
    adminRequest('POST', '/admin/security/beacon', eventData),
};
