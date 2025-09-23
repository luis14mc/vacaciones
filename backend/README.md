# API Backend - Sistema de Vacaciones CNI Honduras

## Descripción
API REST completa para el sistema de gestión de vacaciones de CNI Honduras. Desarrollada con Node.js, Express.js, TypeScript y PostgreSQL.

## Características Principales

### 🔐 Autenticación y Autorización
- JWT (JSON Web Tokens) para autenticación
- Refresh tokens para sesiones extendidas
- Control de acceso basado en roles (RBAC)
- Rate limiting para seguridad
- Middleware de autenticación personalizado

### 👥 Gestión de Usuarios
- CRUD completo de usuarios
- Roles: `empleado`, `jefe_superior`, `rrhh`
- Gestión de departamentos y supervisores
- Estadísticas de usuarios

### 🏖️ Gestión de Vacaciones
- Solicitud de vacaciones con validaciones
- Aprobación/rechazo por supervisores
- Cálculo automático de días
- Control de días disponibles
- Historial de solicitudes

### 📊 Reportes y Estadísticas
- Reportes por período
- Estadísticas por departamento
- Reportes de usuarios
- Exportación en JSON/CSV
- Dashboard con métricas

### ⚙️ Configuración del Sistema
- Configuración dinámica
- Historial de cambios
- Categorías de configuración
- Valores por defecto
- Reseteo de configuraciones

## Tecnologías Utilizadas

- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **TypeScript** - Tipado estático
- **PostgreSQL** - Base de datos relacional
- **JWT** - Autenticación
- **bcrypt** - Hash de contraseñas
- **Helmet** - Seguridad HTTP
- **Morgan** - Logging de requests
- **Rate Limiting** - Control de velocidad

## Estructura del Proyecto

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts          # Configuración de PostgreSQL
│   ├── controllers/
│   │   ├── authController.ts    # Autenticación
│   │   ├── userController.ts    # Gestión de usuarios
│   │   ├── vacacionesController.ts # Gestión de vacaciones
│   │   ├── reportesController.ts   # Reportes y estadísticas
│   │   └── configuracionController.ts # Configuración del sistema
│   ├── middleware/
│   │   └── authMiddleware.ts    # Middleware de autenticación
│   ├── routes/
│   │   ├── auth.ts             # Rutas de autenticación
│   │   ├── users.ts            # Rutas de usuarios
│   │   ├── vacaciones.ts       # Rutas de vacaciones
│   │   ├── reportes.ts         # Rutas de reportes
│   │   └── configuracion.ts    # Rutas de configuración
│   ├── types/
│   │   └── index.ts            # Tipos TypeScript
│   └── app.ts                  # Aplicación principal
├── database/
│   └── init_tables.sql         # Script de inicialización de BD
├── package.json
├── tsconfig.json
└── README.md
```

## Instalación y Configuración

### Prerrequisitos
- Node.js >= 18
- PostgreSQL >= 13
- npm o yarn

### 1. Instalación de dependencias
```bash
cd backend
npm install
```

### 2. Variables de entorno
Crear archivo `.env` en la carpeta `backend/`:

```env
# Base de datos
DATABASE_URL=postgresql://usuario:password@localhost:5432/vacaciones_cni

# JWT
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui
JWT_REFRESH_SECRET=tu_refresh_secret_muy_seguro_aqui
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Servidor
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:4321

# Opcional: Para producción
FRONTEND_URL=https://tu-frontend.com
```

### 3. Base de datos
```bash
# Ejecutar script de inicialización
psql -U usuario -d vacaciones_cni -f database/init_tables.sql
```

### 4. Compilación y ejecución
```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm start
```

## API Endpoints

### Autenticación (`/api/auth`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/login` | Iniciar sesión | No |
| POST | `/refresh-token` | Renovar token | No |
| GET | `/profile` | Obtener perfil del usuario | Sí |
| POST | `/logout` | Cerrar sesión | Sí |
| GET | `/validate` | Validar token | Sí |

### Usuarios (`/api/users`)

| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| GET | `/` | Listar usuarios | RRHH, Jefe Superior |
| GET | `/stats` | Estadísticas de usuarios | RRHH, Jefe Superior |
| GET | `/:id` | Obtener usuario por ID | RRHH, Jefe Superior |
| POST | `/` | Crear usuario | RRHH |
| PUT | `/:id` | Actualizar usuario | RRHH |
| DELETE | `/:id` | Eliminar usuario | RRHH |

### Vacaciones (`/api/vacaciones`)

| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| GET | `/` | Listar solicitudes | Todos (filtrado por rol) |
| GET | `/stats` | Estadísticas de solicitudes | RRHH, Jefe Superior |
| GET | `/:id` | Obtener solicitud por ID | Todos |
| POST | `/` | Crear solicitud | Todos |
| PUT | `/:id` | Aprobar/rechazar solicitud | RRHH, Jefe Superior |

### Reportes (`/api/reportes`)

| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| GET | `/solicitudes` | Reporte de solicitudes | RRHH, Jefe Superior |
| GET | `/departamentos` | Reporte por departamento | RRHH, Jefe Superior |
| GET | `/usuarios` | Reporte de usuarios | RRHH, Jefe Superior |
| GET | `/estadisticas` | Estadísticas generales | RRHH, Jefe Superior |
| GET | `/exportar` | Exportar reportes | RRHH, Jefe Superior |

### Configuración (`/api/configuracion`)

| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| GET | `/` | Listar configuraciones | RRHH |
| GET | `/vacaciones` | Config. de vacaciones | RRHH |
| PUT | `/vacaciones` | Actualizar config. vacaciones | RRHH |
| GET | `/:clave` | Obtener configuración | RRHH |
| PUT | `/:clave` | Actualizar configuración | RRHH |
| POST | `/:categoria/reset` | Resetear configuración | RRHH |
| GET | `/:clave/historial` | Historial de cambios | RRHH |

## Ejemplos de Uso

### Autenticación
```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@cni.hn",
    "password": "password123"
  }'

# Respuesta
{
  "message": "Login exitoso",
  "data": {
    "user": {
      "id": 1,
      "email": "admin@cni.hn",
      "nombre": "Admin",
      "apellido": "CNI",
      "rol": "rrhh"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Crear Solicitud de Vacaciones
```bash
curl -X POST http://localhost:3001/api/vacaciones \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "fecha_inicio": "2024-12-20",
    "fecha_fin": "2024-12-27",
    "motivo": "Vacaciones de fin de año"
  }'
```

### Obtener Estadísticas
```bash
curl -X GET http://localhost:3001/api/reportes/estadisticas \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Seguridad

### Rate Limiting
- **Global**: 1000 requests por 15 minutos por IP
- **Autenticación**: 5 intentos de login por 15 minutos por IP
- **Por usuario**: 5 solicitudes de vacaciones por hora

### Validaciones
- Validación de entrada en todos los endpoints
- Sanitización de datos
- Control de acceso basado en roles
- Tokens JWT con expiración

### Headers de Seguridad
- Helmet.js para headers de seguridad HTTP
- CORS configurado para frontend específico
- Validación de Content-Type

## Monitoreo y Logs

### Health Check
```bash
curl http://localhost:3001/api/health
```

### Logs
- Morgan para logging de requests HTTP
- Console logs para debugging
- Timestamps en todas las operaciones

## Base de Datos

### Tablas Principales
- `usuarios` - Información de usuarios
- `solicitudes_vacaciones` - Solicitudes de vacaciones
- `configuracion_sistema` - Configuración del sistema
- `historial_configuracion` - Historial de cambios

### Vistas
- `vista_estadisticas_solicitudes` - Estadísticas de solicitudes
- `vista_estadisticas_usuarios` - Estadísticas de usuarios

### Triggers
- Actualización automática de timestamps
- Historial automático de cambios de configuración

## Desarrollo

### Scripts disponibles
```bash
npm run dev      # Desarrollo con hot reload
npm run build    # Compilar TypeScript
npm start        # Ejecutar versión compilada
npm run test     # Ejecutar tests (pendiente)
```

### Linting y Formato
```bash
npm run lint     # ESLint
npm run format   # Prettier
```

## Deployment

### Variables de Entorno de Producción
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@prod-host:5432/db
JWT_SECRET=production_secret_very_secure
CORS_ORIGIN=https://your-frontend-domain.com
PORT=3001
```

### Docker (Opcional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3001
CMD ["npm", "start"]
```

## Contribución

1. Fork el proyecto
2. Crear una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Crear un Pull Request

## Licencia

Este proyecto es propiedad de CNI Honduras.

## Soporte

Para soporte técnico, contactar al equipo de desarrollo de CNI.

---

**Última actualización:** Diciembre 2024  
**Versión:** 1.0.0  
**Autor:** Equipo de Desarrollo CNI