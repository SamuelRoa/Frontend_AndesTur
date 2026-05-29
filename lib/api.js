const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

async function request(endpoint, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  }

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body)
  }

  const url = `${API_URL}/api${endpoint}`
  console.log(`→ API: ${options.method || 'GET'} ${url}`)

  let res
  try {
    res = await fetch(url, config)
  } catch (err) {
    console.error('✗ Error de red:', err.message)
    throw new Error(`No se pudo conectar con el servidor (${API_URL}). ¿El backend está corriendo?`)
  }

  let data
  try {
    data = await res.json()
  } catch {
    throw new Error(`Respuesta inválida del servidor (status ${res.status})`)
  }

  if (!res.ok) {
    console.error('✗ Error API:', data)
    throw new Error(data.message || `Error del servidor: ${res.status}`)
  }

  console.log('✓ Respuesta:', data)
  return data
}

// Auth
export const auth = {
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: { email, password } }),

  register: (userData) =>
    request('/auth/register', { method: 'POST', body: userData }),

  verify: () =>
    request('/auth/verify'),

  getProfile: () =>
    request('/auth/profile'),

  forgotPassword: (email) =>
    request('/auth/forgot-password', { method: 'POST', body: { email } }),
}

// Staff (Employees)
export const staff = {
  getAll: () => request('/staff'),
  getById: (id) => request(`/staff/${id}`),
  create: (data) => request('/staff', { method: 'POST', body: data }),
  update: (id, data) => request(`/staff/${id}`, { method: 'PUT', body: data }),
  delete: (id) => request(`/staff/${id}`, { method: 'DELETE' }),
}

// Packages
export const packages = {
  getAll: () => request('/packages'),
  getById: (id) => request(`/packages/${id}`),
  create: (data) => request('/packages', { method: 'POST', body: data }),
  update: (id, data) => request(`/packages/${id}`, { method: 'PUT', body: data }),
  delete: (id) => request(`/packages/${id}`, { method: 'DELETE' }),
}

// Destinations
export const destinations = {
  getAll: () => request('/destinations'),
  getById: (id) => request(`/destinations/${id}`),
  create: (data) => request('/destinations', { method: 'POST', body: data }),
  update: (id, data) => request(`/destinations/${id}`, { method: 'PUT', body: data }),
  delete: (id) => request(`/destinations/${id}`, { method: 'DELETE' }),
}

// Reservations
export const reservations = {
  getAll: () => request('/reservations'),
  getById: (id) => request(`/reservations/${id}`),
  create: (data) => request('/reservations', { method: 'POST', body: data }),
  update: (id, data) => request(`/reservations/${id}`, { method: 'PUT', body: data }),
  delete: (id) => request(`/reservations/${id}`, { method: 'DELETE' }),
}

// Vehicles
export const vehicles = {
  getAll: () => request('/vehicles'),
  getById: (id) => request(`/vehicles/${id}`),
  create: (data) => request('/vehicles', { method: 'POST', body: data }),
  update: (id, data) => request(`/vehicles/${id}`, { method: 'PUT', body: data }),
  delete: (id) => request(`/vehicles/${id}`, { method: 'DELETE' }),
}

// Customers
export const customers = {
  getAll: () => request('/customers'),
  getById: (id) => request(`/customers/${id}`),
  create: (data) => request('/customers', { method: 'POST', body: data }),
  update: (id, data) => request(`/customers/${id}`, { method: 'PUT', body: data }),
  delete: (id) => request(`/customers/${id}`, { method: 'DELETE' }),
}

// Payment headers
export const paymentHeaders = {
  getAll: () => request('/payment-headers'),
  getById: (id) => request(`/payment-headers/${id}`),
  create: (data) => request('/payment-headers', { method: 'POST', body: data }),
  update: (id, data) => request(`/payment-headers/${id}`, { method: 'PUT', body: data }),
  delete: (id) => request(`/payment-headers/${id}`, { method: 'DELETE' }),
}
