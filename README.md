# AndesTur – Panel Administrativo

---

## 🎯 Descripción
Este es el **panel administrativo** de **AndesTur**, una solución full‑stack para la gestión de agencias turísticas. El frontend está construido con **Vite 8 + React 19 + Tailwind CSS 4 + shadcn/ui** y el backend (separado) con **Express 5 + Sequelize + PostgreSQL (Supabase)**.

---

## 🛠️ Stack Tecnológico
| Área | Tecnología | Versión |
|------|------------|--------|
| Frontend | Vite | 8.x |
|          | React | 19 |
|          | Tailwind CSS | 4.x |
|          | shadcn/ui | — |
|          | Recharts | 2.x |
| Backend | Express | 5 |
|          | Sequelize | — |
|          | PostgreSQL (Supabase) | — |
|          | JWT | — |

---

## 📁 Estructura del proyecto (frontend)
```text
AndesTur_panel/
├── src/                     # Entrada principal (App.jsx, main.jsx)
├── components/              # UI y módulos
│   ├── modules/            # CRUD de empleados, destinos, paquetes, vehículos, reservas
│   ├── ui/                 # shadcn/ui primitives
│   ├── dashboard.jsx       # Dashboard con gráficos Recharts
│   ├── login-form.jsx      # Formulario de inicio de sesión
│   └── ...
├── lib/                     # api.js (fetch wrapper), auth.jsx (context)
├── styles/                  # globals.css (tema claro/oscuro)
├── vite.config.mjs
└── package.json
```
---

## 🚀 Cómo Empezar
### 1️⃣ Backend
```bash
git clone https://github.com/SamuelRoa/Backend_AndesTur.git
cd Backend_AndesTur
npm install
# Configura .env (ver CREDENCIALES.txt para Supabase)
npm run dev   # http://localhost:3000
```
### 2️⃣ Frontend (este panel)
```bash
git clone https://github.com/SamuelRoa/AndesTur_website.git  # contiene el frontend
cd AndesTur_panel
pnpm install
pnpm dev   # http://localhost:5174
```
> **Nota:** El frontend está configurado para usar `VITE_API_URL=http://localhost:3000`.
---

## 🛡️ Variables de Entorno
Crea un archivo `.env.local` en la raíz del proyecto:
```env
VITE_API_URL=http://localhost:3000
```
---

## 📚 Documentación de la API (Backend)
| Recurso | Endpoint | Método | Descripción |
|---------|----------|--------|-------------|
| Auth | `/api/auth/login` | POST | Iniciar sesión (devuelve JWT) |
| Auth | `/api/auth/register` | POST | Registro de usuario |
| Staff | `/api/staff` | GET | Listar empleados |
| Packages | `/api/packages` | GET | Listar paquetes turísticos |
| Destinations | `/api/destinations` | GET | Listar destinos |
| Reservations | `/api/reservations` | GET | Listar reservaciones |
| Vehicles | `/api/vehicles` | GET | Listar vehículos |
| Customers | `/api/customers` | GET | Listar clientes |
> **Más endpoints** están descritos en `Backend_AndesTur/docs/API.md`.
---

## 🔐 Credenciales de Producción
Las credenciales reales usadas por el panel están en **CREDENCIALES.txt**:
- **Cegarra Kimberly** – `cegarrakimberly1@gmail.com` / `Cegarra2601$`
- **Samuel Roa** – `samuelroa62@gmail.com` / `0411Canela$`

> Estas cuentas tienen acceso de **Administrador** a todos los módulos.
---

## 🎨 Tema y Estilos
El tema claro/oscuro se gestiona con `next-themes` y está definido en `styles/globals.css` usando variables OKLCH. Los colores principales son:
- **Verde Páramo** – `#1B5E20`
- **Azul Laguna** – `#0277BD`
- **Blanco Nieve** – `#FFFFFF` (claro) / `#F1F5F9` (oscuro)
---

## 📦 Funcionalidades Clave
- ✅ Autenticación JWT
- ✅ CRUD completo de empleados, destinos, paquetes, vehículos y reservaciones
- ✅ Búsqueda global y por módulo
- ✅ Exportación (PDF/TXT/Excel – placeholders)
- ✅ Dashboard con gráficos en tiempo real (datos reales del backend)
- ✅ Tema claro/oscuro persistente
- ✅ Sidebar responsive
---

## 📖 Enlaces útiles
- **Frontend (este panel)**: https://github.com/SamuelRoa/AndesTur_website.git
- **Backend**: https://github.com/SamuelRoa/Backend_AndesTur.git
- **Documentación del backend**: https://github.com/SamuelRoa/Backend_AndesTur/blob/master/README.md
---

## 📄 Licencia
Este proyecto está bajo la licencia **MIT**.

---

*Última actualización: 12 Jun 2026*
