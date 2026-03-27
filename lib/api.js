// Client-side API helpers
async function req(path, opts = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...opts.headers },
    credentials: 'include',
    ...opts,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  signup: (b) => req('/api/auth/signup', { method: 'POST', body: b }),
  login: (b) => req('/api/auth/login', { method: 'POST', body: b }),
  logout: () => req('/api/auth/logout', { method: 'POST' }),
  me: () => req('/api/auth/me'),
  generate: (b) => req('/api/generate', { method: 'POST', body: b }),
  checkout: (b) => req('/api/checkout', { method: 'POST', body: b }),
  getOrders: () => req('/api/orders'),
  getImages: () => req('/api/images'),
};
