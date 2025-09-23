# 🏖️ Sistema de Gestión de Vacaciones CNI Honduras

Sistema integral para la gestión de solicitudes de vacaciones de empleados, desarrollado con tecnologías modernas y enfoque en la experiencia del usuario.

## 📋 Descripción

Este sistema permite a los empleados solicitar vacaciones de manera digital, mientras que los administradores y recursos humanos pueden revisar, aprobar o rechazar estas solicitudes de forma eficiente. Incluye validación automática de días laborables, cálculo de días disponibles y notificaciones en tiempo real.

## 🚀 Características Principales

### Para Empleados
- ✅ **Solicitud de Vacaciones**: Interfaz intuitiva para crear nuevas solicitudes
- 📅 **Validación Automática**: Verificación de días laborables y disponibilidad
- 📊 **Historial Personal**: Visualización de todas las solicitudes realizadas
- 🔔 **Notificaciones**: Alertas sobre el estado de las solicitudes
- 📱 **Diseño Responsivo**: Funciona perfectamente en móviles y tablets

### Para Administradores
- 🏢 **Dashboard Completo**: Vista general de todas las solicitudes
- ⚡ **Gestión Rápida**: Aprobación/rechazo con un solo clic
- 👥 **Gestión de Empleados**: CRUD completo de usuarios
- 📈 **Estadísticas**: Reportes y métricas del sistema
- 🔐 **Control de Acceso**: Sistema de roles y permisos

### Características Técnicas
- 🔒 **Autenticación JWT**: Seguridad robusta con tokens
- 🎨 **UI Moderna**: Interfaz con Tailwind CSS y DaisyUI
- ⚡ **Rendimiento**: Aplicación rápida y optimizada
- 🌐 **API RESTful**: Backend escalable y documentado

## 🛠️ Tecnologías Utilizadas

### Frontend
- **Astro** `v5.13.8` - Framework web moderno
- **React** `v19.1.1` - Biblioteca para UI interactiva
- **TypeScript** - Tipado estático para mayor robustez
- **Tailwind CSS** `v4.1.13` - Framework CSS utilitario
- **DaisyUI** `v5.1.13` - Componentes preconstruidos
- **SweetAlert2** `v11.23.0` - Notificaciones elegantes
- **Axios** `v1.12.2` - Cliente HTTP para APIs

### Backend
- **Node.js** - Runtime de JavaScript
- **Express.js** `v5.1.0` - Framework web para Node.js
- **TypeScript** - Desarrollo tipado del servidor
- **PostgreSQL** - Base de datos relacional (Neon)
- **JWT** `v9.0.2` - Autenticación con tokens
- **bcrypt** `v6.0.0` - Encriptación de contraseñas
- **Helmet** `v8.1.0` - Seguridad HTTP
- **CORS** `v2.8.5` - Manejo de origen cruzado
- **Morgan** `v1.10.1` - Logging de requests

## 📁 Estructura del Proyecto

```
vacaciones/
├── 📁 backend/                 # API y lógica del servidor
│   ├── 📁 src/
│   │   ├── 📁 config/         # Configuración de DB y JWT
│   │   ├── 📁 controllers/    # Lógica de negocio
│   │   ├── 📁 middleware/     # Autenticación y validación
│   │   ├── 📁 models/         # Modelos de datos
│   │   ├── 📁 routes/         # Rutas de la API
│   │   ├── 📁 types/          # Definiciones TypeScript
│   │   └── 📄 app.ts          # Servidor principal
│   ├── 📄 package.json
│   └── 📄 .env                # Variables de entorno
├── 📁 frontend/               # Interfaz de usuario
│   ├── 📁 src/
│   │   ├── 📁 components/     # Componentes React
│   │   ├── 📁 pages/          # Páginas de Astro
│   │   ├── 📁 services/       # Servicios API
│   │   └── 📁 context/        # Contextos React
│   ├── 📄 package.json
│   └── 📄 astro.config.mjs
└── 📄 README.md               # Este archivo
```

## 🔧 Instalación y Configuración

### Prerrequisitos
- **Node.js** v18+ 
- **npm** o **yarn**
- **PostgreSQL** (o cuenta en Neon)
- **Git**

### 1. Clonar el Repositorio
```bash
git clone https://github.com/luis14mc/vacaciones.git
cd vacaciones
```

### 2. Configurar el Backend

```bash
# Navegar al directorio del backend
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de base de datos
```

#### Variables de Entorno (.env)
```env
# Base de datos (Neon PostgreSQL)
DATABASE_URL=postgresql://usuario:password@host/database

# JWT Secret
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui

# Puerto del servidor
PORT=3000

# Entorno
NODE_ENV=development
```

```bash
# Ejecutar migraciones (crear tablas)
npm run migrate

# Iniciar servidor en desarrollo
npm run dev
```

### 3. Configurar el Frontend

```bash
# Navegar al directorio del frontend (nueva terminal)
cd frontend

# Instalar dependencias
npm install

# Instalar SweetAlert2 (desde la raíz del proyecto)
cd ..
npm install

# Volver al frontend e iniciar desarrollo
cd frontend
npm run dev
```

## 🚀 Uso del Sistema

### 1. Iniciar los Servidores

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Servidor API corriendo en http://localhost:3000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Aplicación web en http://localhost:4321
```

### 2. Acceso al Sistema

1. **Registro/Login**: Crear cuenta o iniciar sesión
2. **Dashboard**: Según tu rol (empleado/admin) verás diferentes opciones
3. **Solicitar Vacaciones**: Los empleados pueden crear nuevas solicitudes
4. **Gestionar Solicitudes**: Los admins pueden aprobar/rechazar

### Usuarios de Prueba
```
Admin:
- Email: admin@cni.hn
- Password: admin123

Empleado:
- Email: empleado@cni.hn  
- Password: empleado123
```

## 📡 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `GET /api/auth/verify` - Verificar token

### Vacaciones
- `GET /api/vacations` - Listar solicitudes
- `POST /api/vacations` - Crear solicitud
- `PUT /api/vacations/:id` - Actualizar solicitud
- `DELETE /api/vacations/:id` - Eliminar solicitud
- `PUT /api/vacations/:id/status` - Cambiar estado

### Usuarios (Solo Admin)
- `GET /api/users` - Listar empleados
- `POST /api/users` - Crear empleado
- `PUT /api/users/:id` - Actualizar empleado
- `DELETE /api/users/:id` - Eliminar empleado

## 🎯 Características del Sistema

### Validaciones Automáticas
- ✅ **Días Laborables**: Solo permite seleccionar días de lunes a viernes
- ✅ **Días Disponibles**: Verifica que el empleado tenga días suficientes
- ✅ **Fechas Válidas**: La fecha de inicio debe ser posterior a hoy
- ✅ **Rango de Fechas**: La fecha de fin debe ser posterior al inicio

### Estados de Solicitud
- 🟡 **Pendiente**: Recién creada, esperando revisión
- 🟢 **Aprobada**: Autorizada por el supervisor
- 🔴 **Rechazada**: No autorizada con motivo especificado

### Notificaciones
- 🔔 **Éxito**: Confirmación de acciones realizadas
- ⚠️ **Advertencias**: Validaciones y límites
- ❌ **Errores**: Problemas en el procesamiento

## 🔒 Seguridad

- **JWT Tokens**: Autenticación sin estado
- **Bcrypt**: Encriptación de contraseñas
- **Helmet**: Headers de seguridad HTTP
- **Rate Limiting**: Protección contra spam
- **CORS**: Control de origen cruzado
- **Validación**: Sanitización de datos de entrada

## 📱 Responsive Design

El sistema está completamente optimizado para:
- 📱 **Móviles**: iPhone, Android (375px+)
- 📱 **Tablets**: iPad, tablets Android (768px+)
- 💻 **Desktop**: Pantallas grandes (1024px+)
- 🖥️ **Ultra-wide**: Monitores 4K y ultrawide

## 🚀 Deployment

### Backend (Railway/Heroku)
```bash
# Build del proyecto
npm run build

# Iniciar en producción
npm start
```

### Frontend (Vercel/Netlify)
```bash
# Build estático
npm run build

# Preview local
npm run preview
```

## 🤝 Contribución

1. **Fork** el repositorio
2. **Crea** una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. **Commit** tus cambios (`git commit -m 'Añadir nueva funcionalidad'`)
4. **Push** a la rama (`git push origin feature/nueva-funcionalidad`)
5. **Abre** un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver `LICENSE` para más detalles.

## 👥 Equipo de Desarrollo

- **Backend**: API RESTful con Express.js y TypeScript
- **Frontend**: Interfaz moderna con Astro + React
- **Base de Datos**: PostgreSQL con esquema optimizado
- **UI/UX**: Diseño responsivo con Tailwind CSS

## 📞 Soporte

Para reportar bugs o solicitar nuevas características:

1. **Issues**: Usa el sistema de issues de GitHub
2. **Email**: Contacta al equipo de desarrollo
3. **Documentación**: Consulta este README y comentarios en el código

---

## 🚀 Comenzar Ahora

```bash
# Clonar repositorio
git clone https://github.com/luis14mc/vacaciones.git

# Instalar y ejecutar
cd vacaciones
cd backend && npm install && npm run dev &
cd ../frontend && npm install && npm run dev
```

**¡El sistema estará disponible en http://localhost:4321!** 🎉

---

<div align="center">

**Desarrollado con ❤️ para CNI Honduras**

[![Astro](https://img.shields.io/badge/Astro-5.13.8-FF5D01?logo=astro)](https://astro.build)
[![React](https://img.shields.io/badge/React-19.1.1-61DAFB?logo=react)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-blue?logo=typescript)](https://typescriptlang.org)
[![Express](https://img.shields.io/badge/Express-5.1.0-000000?logo=express)](https://expressjs.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?logo=postgresql&logoColor=white)](https://postgresql.org)

</div>