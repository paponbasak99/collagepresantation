// DocBook API Client Wrapper & Session Manager
import { showToast } from './toast.js';

const API_BASE = '/api';

export function getToken() {
  return localStorage.getItem('docbook_token');
}

export function getCurrentUser() {
  const userJson = localStorage.getItem('docbook_user');
  try {
    return userJson ? JSON.parse(userJson) : null;
  } catch (e) {
    return null;
  }
}

export function setSession(token, user) {
  if (token) localStorage.setItem('docbook_token', token);
  if (user) localStorage.setItem('docbook_user', JSON.stringify(user));
  window.dispatchEvent(new CustomEvent('sessionChanged', { detail: { user } }));
}

export function clearSession() {
  localStorage.removeItem('docbook_token');
  localStorage.removeItem('docbook_user');
  window.dispatchEvent(new CustomEvent('sessionChanged', { detail: { user: null } }));
}

export async function request(endpoint, options = {}) {
  // Strip duplicate leading /api if passed
  let cleanEndpoint = endpoint;
  if (cleanEndpoint.startsWith('/api/')) {
    cleanEndpoint = cleanEndpoint.slice(4);
  } else if (cleanEndpoint === '/api') {
    cleanEndpoint = '';
  }
  if (!cleanEndpoint.startsWith('/') && !cleanEndpoint.startsWith('http')) {
    cleanEndpoint = '/' + cleanEndpoint;
  }
  const url = cleanEndpoint.startsWith('http') ? cleanEndpoint : `${API_BASE}${cleanEndpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers
    });

    const isJson = res.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await res.json() : await res.text();

    if (!res.ok) {
      if (res.status === 401) {
        // Clear token if expired or unauthorized
        const isAuthCheck = endpoint.includes('/auth/me');
        if (!isAuthCheck) {
          clearSession();
          showToast('Session expired. Please log in again.', 'warning');
          setTimeout(() => {
            if (!window.location.pathname.includes('login.html')) {
              window.location.href = '/login.html';
            }
          }, 1200);
        }
      }
      const errorMessage = (typeof data === 'object' && data.message) ? data.message : 'Server request failed';
      const error = new Error(errorMessage);
      error.status = res.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    throw err;
  }
}

export const api = {
  get: (endpoint, options) => request(endpoint, { method: 'GET', ...options }),
  post: (endpoint, body, options) => request(endpoint, { method: 'POST', body: JSON.stringify(body), ...options }),
  put: (endpoint, body, options) => request(endpoint, { method: 'PUT', body: JSON.stringify(body), ...options }),
  delete: (endpoint, options) => request(endpoint, { method: 'DELETE', ...options }),
  download: async (endpoint, filename) => {
    let cleanEndpoint = endpoint.startsWith('/api/') ? endpoint.slice(4) : endpoint;
    if (!cleanEndpoint.startsWith('/') && !cleanEndpoint.startsWith('http')) cleanEndpoint = '/' + cleanEndpoint;
    const url = cleanEndpoint.startsWith('http') ? cleanEndpoint : `${API_BASE}${cleanEndpoint}`;
    const token = getToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error('Download failed');
    const blob = await res.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename || 'download.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(downloadUrl);
  }
};
