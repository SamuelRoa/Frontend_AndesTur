function getApiBaseUrl() {
  const configured = import.meta.env.VITE_API_URL?.trim();

  if (configured) {
    return `${configured.replace(/\/$/, "")}/api`;
  }

  if (typeof window !== "undefined") {
    return "/api";
  }

  return "http://localhost:3000/api";
}

async function request(endpoint, options = {}) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === "object") {
    config.body = JSON.stringify(config.body);
  }

  const url = `${getApiBaseUrl()}${endpoint}`;
  console.log(`→ API: ${options.method || "GET"} ${url}`);

  let res;
  try {
    res = await fetch(url, config);
  } catch (err) {
    console.error("✗ Error de red:", err.message);
    throw new Error(
      `No se pudo conectar con el servidor. ¿El backend está corriendo?`,
    );
  }

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error(`Respuesta inválida del servidor (status ${res.status})`);
  }

  if (!res.ok) {
    if (res.status === 401 && endpoint !== "/auth/login") {
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
        window.location.reload();
      }
    }
    if (res.status !== 403) console.error("✗ Error API:", data);
    throw new Error(data.message || `Error del servidor: ${res.status}`);
  }

  console.log("✓ Respuesta:", data);
  return data;
}

// Auth
export const auth = {
  login: (email, password) =>
    request("/auth/login", { method: "POST", body: { email, password } }),

  register: (userData) =>
    request("/auth/register", { method: "POST", body: userData }),

  verify: () => request("/auth/verify"),

  getProfile: () => request("/auth/profile"),

  forgotPassword: (email) =>
    request("/auth/forgot-password", { method: "POST", body: { email } }),

  updateProfile: (data) =>
    request("/users/profile_update", { method: "PUT", body: data }),

  changePassword: (data) =>
    request("/auth/change-password", { method: "POST", body: data }),
};

function buildQuery(params) {
  if (!params || Object.keys(params).length === 0) return "";
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== "") qs.set(key, val);
  });
  const str = qs.toString();
  return str ? `?${str}` : "";
}

// Staff (Employees)
export const staff = {
  getAll: (params) => request(`/staff${buildQuery(params)}`),
  getById: (id) => request(`/staff/${id}`),
  create: (data) => request("/staff", { method: "POST", body: data }),
  update: (id, data) => request(`/staff/${id}`, { method: "PUT", body: data }),
  delete: (id) => request(`/staff/${id}`, { method: "DELETE" }),
};

// Packages
export const packages = {
  getAll: (params) => request(`/packages${buildQuery(params)}`),
  getById: (id) => request(`/packages/${id}`),
  create: (data) => request("/packages", { method: "POST", body: data }),
  update: (id, data) =>
    request(`/packages/${id}`, { method: "PUT", body: data }),
  delete: (id) => request(`/packages/${id}`, { method: "DELETE" }),
};

// Destinations
export const destinations = {
  getAll: (params) => request(`/destinations${buildQuery(params)}`),
  getById: (id) => request(`/destinations/${id}`),
  create: (data) => request("/destinations", { method: "POST", body: data }),
  update: (id, data) =>
    request(`/destinations/${id}`, { method: "PUT", body: data }),
  delete: (id) => request(`/destinations/${id}`, { method: "DELETE" }),
};

// Reservations
export const reservations = {
  getAll: (params) => request(`/reservations${buildQuery(params)}`),
  getById: (id) => request(`/reservations/${id}`),
  create: (data) => request("/reservations", { method: "POST", body: data }),
  update: (id, data) =>
    request(`/reservations/${id}`, { method: "PUT", body: data }),
  delete: (id) => request(`/reservations/${id}`, { method: "DELETE" }),
};

// Vehicles
export const vehicles = {
  getAll: (params) => request(`/vehicles${buildQuery(params)}`),
  getById: (id) => request(`/vehicles/${id}`),
  create: (data) => request("/vehicles", { method: "POST", body: data }),
  update: (id, data) =>
    request(`/vehicles/${id}`, { method: "PUT", body: data }),
  delete: (id) => request(`/vehicles/${id}`, { method: "DELETE" }),
};

// Customers
export const customers = {
  getAll: (params) => request(`/customers${buildQuery(params)}`),
  getById: (id) => request(`/customers/${id}`),
  create: (data) => request("/customers", { method: "POST", body: data }),
  update: (id, data) =>
    request(`/customers/${id}`, { method: "PUT", body: data }),
  delete: (id) => request(`/customers/${id}`, { method: "DELETE" }),
};

// Export / Download
export const downloadExport = async (moduleName, format) => {
  const token = localStorage.getItem("auth_token");
  const url = `${getApiBaseUrl()}/exports/${moduleName}/${format}`;
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Error del servidor: ${res.status}`);
  }
  const blob = await res.blob();
  const disposition = res.headers.get("Content-Disposition") || "";
  const match = disposition.match(/filename="?(.+?)"?$/);
  const filename = match
    ? match[1]
    : `${moduleName}.${format === "excel" ? "xlsx" : format}`;
  const urlBlob = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = urlBlob;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(urlBlob);
};

// Payment headers
export const paymentHeaders = {
  getAll: (params) => request(`/payment-headers${buildQuery(params)}`),
  getById: (id) => request(`/payment-headers/${id}`),
  create: (data) => request("/payment-headers", { method: "POST", body: data }),
  update: (id, data) =>
    request(`/payment-headers/${id}`, { method: "PUT", body: data }),
  delete: (id) => request(`/payment-headers/${id}`, { method: "DELETE" }),
};

export const payments = {
  getByReservation: (id) => request(`/payments/${id}`),
  registerManual: (data) =>
    request("/payments/manual", { method: "POST", body: data }),
};

// Users (Admin)
export const users = {
  getAll: (params) => request(`/users${buildQuery(params)}`),
  getById: (id) => request(`/users/${id}`),
  create: (data) => request("/users", { method: "POST", body: data }),
  update: (id, data) => request(`/users/${id}`, { method: "PUT", body: data }),
  toggleActive: (id, activo) =>
    request(`/users/${id}`, { method: "PUT", body: { activo } }),
  delete: (id, adminPassword) =>
    request(`/users/${id}`, { method: "DELETE", body: { adminPassword } }),
};

// Roles
export const roles = {
  getAll: () => request("/roles"),
  getById: (id) => request(`/roles/${id}`),
  update: (id, data) => request(`/roles/${id}`, { method: "PUT", body: data }),
};

// States
export const states = {
  getAll: (params) => request(`/states${buildQuery(params)}`),
};

// Municipalities
export const municipalities = {
  getAll: (params) => request(`/municipalities${buildQuery(params)}`),
  create: (data) => request("/municipalities", { method: "POST", body: data }),
};

// Packages Destinations
export const packagesDestinations = {
  getAll: (params) => request(`/packages-destinations${buildQuery(params)}`),
};

// Trash (Papelera)
export const trash = {
  getAll: (params) => request(`/trash${buildQuery(params)}`),
  getById: (id) => request(`/trash/${id}`),
  restore: (id) => request(`/trash/${id}/restore`, { method: "POST" }),
  permanentDelete: (id) => request(`/trash/${id}`, { method: "DELETE" }),
};
