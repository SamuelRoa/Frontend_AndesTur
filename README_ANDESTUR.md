# AndesTur - Sistema Administrativo de Agencia Turística

Panel administrativo completo para la gestión de agencias turísticas con soporte para tema claro y oscuro totalmente funcional.

## Características

✅ **Autenticación**: Sistema de login y registro completo  
✅ **Dashboard**: Panel de control con estadísticas y gráficos interactivos  
✅ **Gestión de Empleados**: Nómina, posiciones y datos del personal  
✅ **Destinos Turísticos**: Administración de lugares y experiencias  
✅ **Paquetes**: Ofertas con precios y disponibilidad  
✅ **Flota de Vehículos**: Gestión de transportes y mantenimiento  
✅ **Reservas**: Sistema de reservaciones con estados de pago  
✅ **Finanzas**: Análisis de ingresos, gastos y rentabilidad  
✅ **Tema Claro/Oscuro**: Toggle funcional con persistencia  
✅ **Diseño Responsive**: Interfaz mobile-first  

## Credenciales de Demo

Haz clic en cualquier credencial para pre-rellenar automáticamente los campos:

### Administrador
```
Email: admin@andetur.com
Contraseña: admin123
Rol: Acceso completo
```

### Gerente
```
Email: manager@andetur.com
Contraseña: manager123
Rol: Gestión operacional
```

### Usuario
```
Email: usuario@andetur.com
Contraseña: user123
Rol: Visualización
```

## Cómo Usar

1. **Abre** http://localhost:3000
2. **Haz clic en una credencial de demo** para pre-rellenar automáticamente el formulario
3. **O ingresa manualmente** un email y contraseña válida
4. **Haz clic en "Ingresar al Sistema"**
5. **Explora los módulos** desde el sidebar izquierdo
6. **Cambiar tema**: Haz clic en el icono Sol/Luna (esquina superior derecha)

## Paleta de Colores (AndesTur Brand)

### Light Mode
- **Fondo**: Blanco (#FFFFFF)
- **Texto**: Gris Pizarra (#1E293B)
- **Primario**: Verde Páramo (#1B5E20)
- **Secundario**: Azul Laguna (#0277BD)
- **Muted**: Verde Neblina (#E8F5E9)

### Dark Mode
- **Fondo**: Azul Noche (#0F172A)
- **Texto**: Blanco Nieve (#F1F5F9)
- **Primario**: Verde Claro (#2E7D32)
- **Secundario**: Azul Cielo (#0288D1)
- **Muted**: Gris Oscuro (#0F172A)

## Tipografía

- **Serif (Identidad)**: Merriweather Bold and Regular (Anthropic style)
- **Sans-Serif (Sistema)**: Inter Regular

## Estructura del Proyecto

```
app/
├── page.tsx                 # Página principal con autenticación
├── layout.tsx              # Layout raíz con soporte de temas
└── globals.css             # Estilos globales y definición de temas

components/
├── theme-provider.tsx      # Proveedor de temas
├── theme-toggle.tsx        # Botón para cambiar tema (Sun/Moon)
├── login-form.tsx          # Formulario de login con credenciales de demo
├── signup-form.tsx         # Formulario de registro
├── sidebar.tsx             # Navegación lateral inteligente
├── dashboard.tsx           # Panel de control principal
└── modules/
    ├── employees-module.tsx
    ├── destinations-module.tsx
    ├── packages-module.tsx
    ├── vehicles-module.tsx
    ├── reservations-module.tsx
    └── finances-module.tsx

lib/
└── mock-data.ts            # Datos simulados para demostración
```

## Tema Claro/Oscuro

### Cómo Funciona
- **Toggle automático**: El botón en la esquina superior derecha cambia entre modo claro y oscuro
- **Icono dinámico**: 
  - 🌙 (Luna) = Modo Claro activo, click para cambiar a Oscuro
  - ☀️ (Sol) = Modo Oscuro activo, click para cambiar a Claro
- **Persistencia**: El tema se guarda automáticamente en localStorage

### Soporte Completo
- ✅ Login y Signup
- ✅ Dashboard y estadísticas
- ✅ Todos los módulos
- ✅ Sidebar y navegación
- ✅ Gráficos adaptativos

## Instrucciones de Desarrollo

### Iniciar servidor
```bash
pnpm dev
```

### Build para producción
```bash
pnpm build
pnpm start
```

## Próximos Pasos para Integración Backend

### 1. Autenticación
Reemplaza la lógica mock en:
- `components/login-form.tsx`
- `components/signup-form.tsx`

Con llamadas a tu API de autenticación

### 2. Base de Datos
Conecta Supabase o tu base de datos preferida:
- Actualiza `lib/mock-data.ts` con llamadas API
- Implementa CRUD en cada módulo

### 3. API Endpoints Recomendados
```
POST   /api/auth/login
POST   /api/auth/signup
GET    /api/employees
POST   /api/employees
GET    /api/destinations
GET    /api/packages
GET    /api/vehicles
GET    /api/reservations
GET    /api/finances
```

## Librerías Utilizadas

- **Vite + React**: Framework React super veloz (SPA)
- **React 19**: Librería UI
- **Tailwind CSS 4**: Estilos
- **shadcn/ui**: Componentes UI pre-estilizados
- **Recharts**: Gráficos y visualizaciones
- **Lucide React**: Iconos vectoriales
- **next-themes**: Gestión de temas claro/oscuro
- **TypeScript**: Tipado estático

## Datos Mock

El sistema incluye datos simulados pre-cargados:
- 5 Empleados con información completa
- 5 Destinos turísticos con coordenadas GPS
- 5 Paquetes con precios y disponibilidad
- 5 Vehículos con especificaciones
- 5 Reservas con estados de pago
- 6 meses de datos financieros

## Notas Importantes

- El sistema actualmente usa datos mock (`lib/mock-data.ts`)
- Todos los formularios tienen validación básica frontend
- El tema se persiste en localStorage automáticamente
- El sidebar es responsive y se colapsa en móvil
- Los gráficos se actualizan según el tema automáticamente

---

**AndesTur © 2026** - Sistema Administrativo de Agencia Turística  
**Versión**: 1.0.0  
**Última actualización**: Mayo 2026
