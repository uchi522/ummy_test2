const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';
const TOKEN_KEY = 'corpboard_id_token';

function getAuthHeaders() {
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function handleUnauthorized(status) {
  if (status === 401) {
    localStorage.removeItem(TOKEN_KEY);
    window.dispatchEvent(new Event('auth:logout'));
  }
}

export async function get(path) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { ...getAuthHeaders() },
  });
  handleUnauthorized(res.status);
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json();
}

export async function post(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(body),
  });
  handleUnauthorized(res.status);
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
  return res.json();
}
