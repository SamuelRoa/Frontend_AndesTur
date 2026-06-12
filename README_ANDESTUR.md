# AndesTur — Sistema Administrativo de Agencia Turística

Panel administrativo full-stack para la gestión de agencias turísticas, con frontend React + Vite y backend Express + Sequelize + PostgreSQL (Supabase).

---

## Arquitectura

```
┌─────────────────────────────────────────────────────┐
│  AndesTur_panel (Frontend)                          │
│  Vite + React 19 + Tailwind CSS 4 + shadcn/ui      │
│  Puerto: 5173 (dev)                                 │
├─────────────────────────────────────────────────────┤
│         ↓ API REST (HTTP)                           │
├─────────────────────────────────────────────────────┤
│  Backend_AndesTur-master (Backend)                  │
│  Express 5 + Sequelize ORM + JWT                    │
│  Puerto: 3000                                       │
├─────────────────────────────────────────────────────┤
│         ↓ Sequelize                                 │
├─────────────────────────────────────────────────────┤
│  PostgreSQL (Supabase Pooler :6543)                 │
└─────────────────────────────────────────────────────┘
```

---

## Stack Tecnológico

### Frontend
| Tecnología | Versión | Uso |
|---|---|---|
| Vite | 8.x | Build tool / dev server |
| React | 19 | UI library |
| Tailwind CSS | 4.x | Estilos utilitarios |
| shadcn/ui | — | Componentes pre-estilizados (Radix UI) |
| Recharts | 2.x | Gráficos del dashboard |
| Lucide React | 0.564 | Iconos vectoriales |
| next-themes | 0.4 | Toggle claro/oscuro |

### Backend
| Tecnología | Versión | Uso |
|---|---|---|
| Express | 5 | Framework HTTP |
| Sequelize | — | ORM para PostgreSQL |
| PostgreSQL | — | Base de datos (Supabase) |
| JWT | — | Autenticación por token |
| bcrypt | — | Hash de contraseñas |
| Zod | — | Validación de schemas |
| Swagger | — | Documentación de API |

---

## Módulos del Sistema (Frontend)

### 1. Dashboard
- `components/dashboard.jsx`
- Gráficos interactivos con Recharts
- Estadísticas de empleados, destinos, paquetes, vehículos, reservas

### 2. Empleados — `EmployeesModule`
- `components/modules/employees-module.jsx`
- CRUD completo: crear, listar, editar, eliminar
- Exportación (PDF / TXT / Excel — UI placeholder)
- Búsqueda por nombre, email, DNI, cargo

### 3. Destinos — `DestinationsModule`
- `components/modules/destinations-module.jsx`
- CRUD completo + exportación
- Búsqueda por nombre, ubicación, descripción

### 4. Paquetes — `PackagesModule`
- `components/modules/packages-module.jsx`
- CRUD completo + exportación
- Búsqueda por nombre, descripción

### 5. Vehículos — `VehiclesModule`
- `components/modules/vehicles-module.jsx`
- CRUD completo + exportación
- Búsqueda por placa, marca, modelo

### 6. Reservas — `ReservationsModule`
- `components/modules/reservations-module.jsx`
- CRUD completo + exportación
- Búsqueda por cliente, email, paquete
- Estados de pago: Pendiente, Parcial, Pagado, Cancelado, Expirado

### 7. Barra de Búsqueda Global
- `components/global-search.jsx`
- Busca en todos los módulos simultáneamente (empleados, destinos, paquetes, vehículos, reservas, clientes)
- Dropdown con resultados agrupados
- Navegación directa al módulo al hacer clic
- Atajos: ↑/↓ para navegar resultados, Enter para seleccionar, Escape para cerrar

---

## Componentes Compartidos

| Componente | Archivo | Propósito |
|---|---|---|
| Sidebar | `components/sidebar.jsx` | Navegación lateral fija (w-64), responsive |
| ProfileDialog | `components/profile-dialog.jsx` | 3 tabs: Perfil, Contraseña, Redes Sociales |
| ThemeToggle | `components/theme-toggle.jsx` | Switch claro/oscuro |
| ExportButton | `components/export-button.jsx` | Dropdown de exportación (PDF/TXT/Excel) |
| LoginForm | `components/login-form.jsx` | Formulario de inicio de sesión |
| SignupForm | `components/signup-form.jsx` | Formulario de registro |
| GlobalSearch | `components/global-search.jsx` | Búsqueda global en todos los módulos |

---

## API Backend — Endpoints

### Autenticación
| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/api/auth/login` | Iniciar sesión |
| POST | `/api/auth/register` | Registrar usuario |
| GET | `/api/auth/verify` | Verificar token |
| POST | `/api/auth/forgot-password` | Recuperar contraseña |
| POST | `/api/auth/change-password` | Cambiar contraseña (autenticado) |

### Usuarios
| Método | Endpoint | Descripción |
|---|---|---|
| PUT | `/api/users/profile_update` | Actualizar perfil (username, email) |

### Staff (Empleados)
| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/staff` | Listar todos |
| GET | `/api/staff/:id` | Obtener por ID |
| POST | `/api/staff` | Crear |
| PUT | `/api/staff/:id` | Actualizar |
| DELETE | `/api/staff/:id` | Eliminar |

### Paquetes
| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/packages` | Listar todos |
| GET | `/api/packages/:id` | Obtener por ID |
| POST | `/api/packages` | Crear |
| PUT | `/api/packages/:id` | Actualizar |
| DELETE | `/api/packages/:id` | Eliminar |

### Destinos
| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/destinations` | Listar todos |
| GET | `/api/destinations/:id` | Obtener por ID |
| POST | `/api/destinations` | Crear |
| PUT | `/api/destinations/:id` | Actualizar |
| DELETE | `/api/destinations/:id` | Eliminar |

### Reservas
| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/reservations` | Listar todas |
| GET | `/api/reservations/:id` | Obtener por ID |
| POST | `/api/reservations` | Crear |
| PUT | `/api/reservations/:id` | Actualizar |
| DELETE | `/api/reservations/:id` | Eliminar |

### Vehículos
| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/vehicles` | Listar todos |
| GET | `/api/vehicles/:id` | Obtener por ID |
| POST | `/api/vehicles` | Crear |
| PUT | `/api/vehicles/:id` | Actualizar |
| DELETE | `/api/vehicles/:id` | Eliminar |

### Clientes
| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/customers` | Listar todos |
| GET | `/api/customers/:id` | Obtener por ID |
| POST | `/api/customers` | Crear |
| PUT | `/api/customers/:id` | Actualizar |
| DELETE | `/api/customers/:id` | Eliminar |

### Payment Headers
| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/payment-headers` | Listar todos |
| GET | `/api/payment-headers/:id` | Obtener por ID |
| POST | `/api/payment-headers` | Crear |
| PUT | `/api/payment-headers/:id` | Actualizar |
| DELETE | `/api/payment-headers/:id` | Eliminar |

> **Total: 32 endpoints** en 8 grupos (auth, users, staff, packages, destinations, reservations, vehicles, customers, payment-headers).

---

## Manejo de Errores (Backend)

Todos los controladores (`src/controllers/*.controller.js`) propagan errores a un middleware centralizado:

```
controller → next(error) → errorHandler.middleware.js
```

El middleware clasifica errores Sequelize:
- **UniqueConstraintError** → HTTP 409 (Conflict)
- **ValidationError** → HTTP 400 (Bad Request)
- **ForeignKeyConstraintError** → HTTP 400
- **Otros** → HTTP 500

---

## Tema Claro / Oscuro

Definido en `styles/globals.css` usando OKLCH:

| Modo | Fondo | Card | Sidebar | Acento |
|---|---|---|---|---|
| Claro | Ivory `oklch(0.965 0.008 100)` | Hueso `oklch(0.98 0.006 100)` | Ivory `oklch(0.935 0.008 100)` | Verde Páramo |
| Oscuro | Navy `oklch(0.17 0.02 250)` | Navy `oklch(0.21 0.025 250)` | Navy profundo `oklch(0.19 0.025 250)` | Verde |

---

## Estructura del Proyecto (Frontend)

```
AndesTur_panel/
├── src/
│   ├── App.jsx                  # Layout principal, ruteo de módulos
│   └── ...
├── components/
│   ├── ui/                      # shadcn/ui components
│   ├── modules/
│   │   ├── employees-module.jsx
│   │   ├── destinations-module.jsx
│   │   ├── packages-module.jsx
│   │   ├── vehicles-module.jsx
│   │   └── reservations-module.jsx
│   ├── sidebar.jsx
│   ├── dashboard.jsx
│   ├── login-form.jsx
│   ├── signup-form.jsx
│   ├── profile-dialog.jsx
│   ├── export-button.jsx
│   └── global-search.jsx
├── lib/
│   ├── api.js                   # Cliente HTTP (fetch + Bearer token)
│   └── auth.js                  # Hook useAuth (context + localStorage)
├── styles/
│   └── globals.css              # Variables CSS, temas claro/oscuro
├── package.json
└── vite.config.mjs
```

---

## Cómo Empezar

### 1. Backend
```bash
cd Backend_AndesTur-master
npm install
# Configurar .env (ver CREDENCIALES.txt para Supabase)
npm run dev        # Inicia en http://localhost:3000
```

### 2. Frontend
```bash
cd AndesTur_panel
pnpm install
pnpm dev           # Inicia en http://localhost:5174
```

### 3. Variables de Entorno
```env
# AndesTur_panel/.env.local
VITE_API_URL=http://localhost:3000
```

---

## Features Completadas

- ✅ Autenticación JWT (login, registro, cambio de contraseña)
- ✅ CRUD completo en los 5 módulos principales
- ✅ Perfil de usuario con edición y cambio de contraseña
- ✅ Búsqueda local en cada módulo
- ✅ Búsqueda global en todos los módulos desde el navbar
- ✅ Exportación (UI placeholder: PDF / TXT / Excel)
- ✅ Tema claro/oscuro con persistencia
- ✅ Sidebar responsive (colapsable en mobile)
- ✅ Manejo centralizado de errores del backend
- ✅ Dashboard con gráficos y estadísticas

---

## Credenciales reales

Las credenciales de acceso a producción están en **CREDENCIALES.txt**. No se incluyen aquí por seguridad.


---

**AndesTur © 2026** — Versión 2.0.0 — Última actualización: Mayo 2026
