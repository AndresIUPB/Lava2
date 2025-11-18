# 🚗 LAVA 2 - Backend API

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5%2B-blue)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14%2B-336791)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-Proprietary-red)](https://lava2.com)

API REST backend para **LAVA 2**, una aplicación móvil que conecta usuarios que necesitan servicios de lavado de vehículos con trabajadores especializados en Colombia.

## 📋 Tabla de Contenidos

- [Descripción](#descripción)
- [Características](#características)
- [Stack Tecnológico](#stack-tecnológico)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Ejecución](#ejecución)
- [Testing](#testing)
- [Documentación API](#documentación-api)
- [Arquitectura](#arquitectura)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Contribución](#contribución)

## 📖 Descripción

LAVA 2 es una plataforma de lavado de vehículos a domicilio que permite:

- **Usuarios**: Solicitar servicios de lavado a domicilio, gestionar reservaciones, calificar servicios
- **Trabajadores**: Ofrecer servicios, gestionar disponibilidad, recibir calificaciones
- **Admin**: Gestionar catálogo de servicios, trabajadores y usuarios

### Reglas de Negocio Críticas

- Un usuario NO puede tener múltiples reservaciones activas simultáneamente
- Cancelación permitida hasta 1 hora antes del servicio
- Trabajadores con horarios configurables + sistema de bloqueos
- Máximo 3 métodos de pago por usuario
- Validación de placas formato Colombia: `ABC123` (3 letras + 3 números)
- Calificación del servicio obligatoria (1-5 estrellas)
- Calificación del trabajador opcional (1-5 estrellas)

## ✨ Características

### 🔐 Autenticación & Seguridad

- ✅ Sistema JWT con Access Token (15 min) + Refresh Token (7 días)
- ✅ Passwords hasheados con bcrypt (10 rounds)
- ✅ Rate limiting (100 req/15min general, 5 intentos login/15min)
- ✅ CORS configurado para dominios específicos
- ✅ Cookies HTTP-Only para almacenamiento seguro de tokens
- ✅ Validación exhaustiva de entradas

### 👤 Gestión de Usuarios

- ✅ Registro y login con validaciones
- ✅ Perfil completo (datos personales, vehículo)
- ✅ Foto de perfil (almacenamiento local)
- ✅ Múltiples métodos de pago
- ✅ Historial de servicios

### 🛠️ Servicios & Trabajadores

- ✅ Catálogo de servicios con precios y duración
- ✅ Listado de trabajadores con calificaciones
- ✅ Búsqueda y filtrado de trabajadores
- ✅ Horarios configurables y bloqueos temporales
- ✅ Estadísticas y ranking de trabajadores

### 📅 Sistema de Reservaciones

- ✅ Crear reservaciones con validación de disponibilidad
- ✅ Confirmar/cancelar con reglas de negocio
- ✅ Estados: pending → confirmed → in_progress → completed
- ✅ Historial y estadísticas de reservaciones
- ✅ Notificaciones automáticas

### ⭐ Calificaciones

- ✅ Rating del servicio (obligatorio)
- ✅ Rating del trabajador (opcional)
- ✅ Comentarios con cada calificación
- ✅ Promedio de calificaciones por trabajador
- ✅ Contribuye al ranking de trabajadores

### 🔔 Sistema de Notificaciones

- ✅ Notificaciones almacenadas en BD
- ✅ Tipos: reservación, calificación, promoción, sistema
- ✅ Marcar como leídas
- ✅ Eliminar notificaciones

## 🛠️ Stack Tecnológico

| Capa               | Tecnología         |
| ------------------ | ------------------ |
| **Runtime**        | Node.js 18+        |
| **Lenguaje**       | TypeScript 5+      |
| **Framework Web**  | Express.js 4+      |
| **ORM**            | Prisma 5+          |
| **Base de Datos**  | PostgreSQL 14+     |
| **Cache/Sessions** | Redis 7+           |
| **Autenticación**  | JWT + Bcrypt       |
| **Validación**     | express-validator  |
| **Testing**        | Jest 29+           |
| **Rate Limiting**  | express-rate-limit |
| **CORS**           | cors               |

## 📦 Instalación

### Prerrequisitos

```bash
# Verificar versiones
node --version  # v18 o superior
npm --version   # 8 o superior
```

Requisitos del sistema:

- PostgreSQL 14+ (local o remoto)
- Redis 7+ (local o remoto)
- Node.js 18+

### Pasos

1. **Clonar el repositorio**

```bash
git clone <repositorio-url>
cd lava2-backend
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Configurar variables de entorno**

```bash
cp .env.example .env
```

Editar `.env` con tus credenciales:

```env
# Base de Datos PostgreSQL
DATABASE_URL="postgresql://usuario:password@localhost:5432/lava2_db"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT Secrets (generar con: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET="tu-secret-super-seguro-cambiar-en-produccion"
JWT_REFRESH_SECRET="tu-refresh-secret-super-seguro-cambiar-en-produccion"

# Server
PORT=3000
NODE_ENV=development

# Frontend
FRONTEND_URL="http://localhost:5173"

# Upload
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=5242880  # 5MB en bytes
```

4. **Ejecutar migraciones**

```bash
# Crear schema y ejecutar migraciones
npx prisma migrate deploy

# O para desarrollo con seed automático
npx prisma migrate dev
```

5. **Ejecutar seeders (datos iniciales)**

```bash
npx prisma db seed
```

Esto crea:

- 5 servicios de lavado
- 5 trabajadores
- 3 usuarios de prueba
- Métodos de pago
- Reservaciones completadas
- Calificaciones
- Notificaciones

6. **Iniciar servidor de desarrollo**

```bash
npm run dev
```

Servidor disponible en `http://localhost:3000`

## ⚙️ Configuración

### Estructura de .env

```env
# === DATABASE ===
DATABASE_URL=postgresql://...
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10

# === REDIS ===
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=

# === JWT ===
JWT_SECRET=tu-secret-aqui
JWT_REFRESH_SECRET=tu-refresh-secret-aqui
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# === SERVER ===
PORT=3000
NODE_ENV=development
LOG_LEVEL=info

# === CORS ===
FRONTEND_URL=http://localhost:5173

# === UPLOAD ===
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880

# === RATE LIMITING ===
RATE_LIMIT_WINDOW=15  # minutos
RATE_LIMIT_MAX=100    # requests por ventana
```

## 🚀 Ejecución

### Desarrollo

```bash
# Modo watch con hot reload
npm run dev

# Con logs detallados
DEBUG=* npm run dev
```

### Producción

```bash
# Compilar TypeScript
npm run build

# Iniciar servidor compilado
npm start

# O con PM2
pm2 start dist/server.js --name "lava2-backend"
```

### Migraciones

```bash
# Ver estado de migraciones
npx prisma migrate status

# Crear nueva migración
npx prisma migrate dev --name nombre-migracion

# Resetear BD (⚠️ elimina todo)
npx prisma migrate reset

# Abrir Prisma Studio (interfaz gráfica)
npx prisma studio
```

## 🧪 Testing

### Ejecutar Tests

```bash
# Todos los tests
npm run test

# Mode watch (detecta cambios)
npm run test:watch

# Con cobertura
npm run test:coverage

# Solo tests unitarios
npm run test:unit

# Solo tests de integración
npm run test:integration

# Un archivo específico
npm run test -- usuario.service.test.ts

# Con salida verbosa
npm run test -- --verbose
```

### Configuración Jest

Tests están ubicados en `src/__tests__/` y organizados por tipo:

- `*/services/*.test.ts` - Tests unitarios
- `*/routes/*.test.ts` - Tests de integración

**Objetivo de cobertura:** 80% global

Verificar cobertura:

```bash
npm run test:coverage
# Reporte HTML disponible en ./coverage/
```

## 📚 Documentación API

### Swagger/OpenAPI

Documentación completa disponible en `docs/api-spec.yml`

Para visualizar con Swagger UI (si está configurado):

```
http://localhost:3000/api-docs
```

### Endpoints Principales

#### 🔐 Autenticación

```bash
POST   /api/auth/registro      # Registrar usuario
POST   /api/auth/login         # Iniciar sesión
POST   /api/auth/refresh       # Renovar token
POST   /api/auth/logout        # Cerrar sesión
```

#### 👤 Usuario

```bash
GET    /api/usuarios/perfil           # Obtener perfil
PUT    /api/usuarios/perfil           # Actualizar perfil
POST   /api/usuarios/foto-perfil      # Subir foto
```

#### 🛠️ Servicios & Trabajadores

```bash
GET    /api/servicios                        # Listar servicios
GET    /api/servicios/{id}                   # Detalle servicio

GET    /api/trabajadores                     # Listar trabajadores
GET    /api/trabajadores/{id}                # Detalle trabajador
GET    /api/trabajadores/buscar/{termino}    # Buscar
GET    /api/trabajadores/ranking/mejores     # Ranking (público)
GET    /api/trabajadores/{id}/estadisticas   # Estadísticas
```

#### 📅 Reservaciones

```bash
POST   /api/reservaciones              # Crear reservación
GET    /api/reservaciones              # Listar mis reservaciones
GET    /api/reservaciones/{id}         # Detalle
DELETE /api/reservaciones/{id}         # Cancelar
GET    /api/reservaciones/historial    # Historial
```

#### ⭐ Calificaciones

```bash
POST   /api/calificaciones           # Crear calificación
GET    /api/calificaciones/{id}      # Obtener calificación
```

#### 💳 Métodos de Pago

```bash
POST   /api/metodos-pago                    # Agregar método
GET    /api/metodos-pago                    # Listar
PUT    /api/metodos-pago/{id}               # Actualizar
DELETE /api/metodos-pago/{id}               # Eliminar
PUT    /api/metodos-pago/{id}/marcar-principal
```

#### 🔔 Notificaciones

```bash
GET    /api/notificaciones                 # Listar
GET    /api/notificaciones/no-leidas       # No leídas
GET    /api/notificaciones/no-leidas/contar
PUT    /api/notificaciones/{id}/leida      # Marcar leído
DELETE /api/notificaciones/{id}            # Eliminar
```

Ver documentación completa en `docs/api-spec.yml`

### Ejemplo de Request

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario1@lava2.com",
    "password": "Password123!"
  }'
```

Response:

```json
{
  "success": true,
  "mensaje": "Login exitoso",
  "data": {
    "usuario": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "usuario1@lava2.com",
      "nombreCompleto": "Roberto Ruiz",
      ...
    }
  }
}
```

## 🏗️ Arquitectura

### Patrón Arquitectónico

La aplicación implementa una **arquitectura híbrida MVC + Capas de Servicio**:

```
┌─────────────────────────────────┐
│  CAPA PRESENTACIÓN (HTTP)        │
│  Controllers + Routes            │
│  - Request/Response              │
│  - Validación entrada            │
└────────────┬────────────────────┘
             │
┌────────────▼────────────────────┐
│  CAPA APLICACIÓN                 │
│  Services (Lógica Negocio)       │
│  - Reglas de negocio             │
│  - Orquestación                  │
└────────────┬────────────────────┘
             │
┌────────────▼────────────────────┐
│  CAPA INFRAESTRUCTURA            │
│  Repositories (Prisma)           │
│  - Acceso a datos                │
│  - Queries complejas             │
└─────────────────────────────────┘
```

### Flujo de Request

```
1. Request HTTP → Express Router
2. Validación de entrada (express-validator)
3. Middleware de autenticación (si aplica)
4. Controller: Extrae datos, llama servicio
5. Service: Lógica de negocio, llamadas a repos
6. Repository: Queries a BD con Prisma
7. Response: Controller transforma y retorna JSON
```

## 📁 Estructura del Proyecto

```
backend/
├── src/
│   ├── config/                 # Configuraciones
│   │   ├── database.ts         # Prisma Client
│   │   ├── redis.ts            # Redis client
│   │   ├── cors.ts             # CORS config
│   │   └── environment.ts      # Env vars tipadas
│   │
│   ├── middleware/             # Middlewares Express
│   │   ├── autenticacion.ts    # JWT verify
│   │   ├── validacion.ts       # express-validator chains
│   │   ├── manejoErrores.ts    # Global error handler
│   │   ├── rateLimiting.ts     # Rate limiters
│   │   └── upload.ts           # Multer config
│   │
│   ├── controllers/            # HTTP handlers
│   │   ├── autenticacion.controller.ts
│   │   ├── usuario.controller.ts
│   │   ├── servicio.controller.ts
│   │   ├── trabajador.controller.ts
│   │   ├── trabajadorStats.controller.ts
│   │   ├── reservacion.controller.ts
│   │   ├── metodoPago.controller.ts
│   │   ├── calificacion.controller.ts
│   │   ├── historial.controller.ts
│   │   └── notificacion.controller.ts
│   │
│   ├── services/               # Lógica de negocio
│   │   ├── autenticacion.service.ts
│   │   ├── usuario.service.ts
│   │   ├── servicio.service.ts
│   │   ├── trabajador.service.ts
│   │   ├── trabajadorStats.service.ts
│   │   ├── reservacion.service.ts
│   │   ├── metodoPago.service.ts
│   │   ├── calificacion.service.ts
│   │   ├── historial.service.ts
│   │   ├── notificacion.service.ts
│   │   └── validaciones/
│   │       ├── validadorPlaca.ts
│   │       ├── validadorTelefono.ts
│   │       └── validadorReservacion.ts
│   │
│   ├── repositories/           # Acceso a datos
│   │   ├── usuario.repository.ts
│   │   ├── servicio.repository.ts
│   │   ├── trabajador.repository.ts
│   │   ├── reservacion.repository.ts
│   │   ├── metodoPago.repository.ts
│   │   ├── calificacion.repository.ts
│   │   ├── historial.repository.ts
│   │   └── notificacion.repository.ts
│   │
│   ├── routes/                 # Definición de rutas
│   │   ├── index.ts            # Router principal
│   │   ├── autenticacion.routes.ts
│   │   ├── usuario.routes.ts
│   │   ├── servicio.routes.ts
│   │   ├── trabajador.routes.ts
│   │   ├── trabajadorStats.routes.ts
│   │   ├── reservacion.routes.ts
│   │   ├── metodoPago.routes.ts
│   │   ├── calificacion.routes.ts
│   │   ├── historial.routes.ts
│   │   └── notificacion.routes.ts
│   │
│   ├── types/                  # TypeScript types
│   │   ├── express.d.ts        # Extensiones de Express
│   │   ├── api.types.ts        # DTOs y respuestas
│   │   ├── entidades.types.ts  # Tipos de dominio
│   │   └── enums.ts            # Enumeraciones
│   │
│   ├── utils/                  # Utilidades
│   │   ├── respuestas.ts       # Response helpers
│   │   ├── errores.ts          # Custom error classes
│   │   ├── jwt.ts              # JWT helpers
│   │   ├── fechas.ts           # Date utilities
│   │   ├── password.ts         # Bcrypt helpers
│   │   └── validaciones.ts     # Generic validators
│   │
│   ├── __tests__/              # Test suites
│   │   ├── autenticacion.routes.test.ts
│   │   ├── usuario.routes.test.ts
│   │   ├── servicio.routes.test.ts
│   │   ├── trabajador.routes.test.ts
│   │   ├── trabajadorStats.routes.test.ts
│   │   ├── reservacion.routes.test.ts
│   │   ├── metodoPago.routes.test.ts
│   │   ├── calificacion.routes.test.ts
│   │   ├── historial.routes.test.ts
│   │   └── notificacion.routes.test.ts
│   │
│   └── server.ts               # Punto de entrada
│
├── prisma/
│   ├── schema.prisma           # Modelo de datos
│   ├── migrations/             # Migraciones versionadas
│   └── seed.ts                 # Seeder de datos
│
├── docs/
│   ├── api-spec.yml            # OpenAPI/Swagger spec
│   ├── modelo-datos.md         # Documentación del modelo
│   └── README.md               # Este archivo
│
├── uploads/                    # Archivos subidos (gitignored)
│   └── perfiles/
│
├── .env.example                # Template de env vars
├── .env                        # Vars de entorno (gitignored)
├── .gitignore
├── .eslintrc.js                # ESLint config
├── .prettierrc                 # Prettier config
├── jest.config.js              # Jest config
├── tsconfig.json               # TypeScript config
├── package.json
├── package-lock.json
└── README.md
```

## 🔐 Seguridad

### Validaciones

- ✅ Entrada HTTP validada con `express-validator`
- ✅ Tipos TypeScript estrictos (`strict: true`)
- ✅ SQL injection prevenido con Prisma ORM
- ✅ XSS mitigado con validación de entrada
- ✅ CSRF protection con cookies HTTP-Only

### Autenticación

- ✅ JWT con firma HMAC-SHA256
- ✅ Access Token: 15 minutos
- ✅ Refresh Token: 7 días (rotación en BD)
- ✅ Passwords hasheados con bcrypt (10 rounds)

### Rate Limiting

```javascript
// General: 100 requests / 15 minutos
rateLimiterGeneral;

// Login: 5 intentos / 15 minutos
rateLimiterLogin;

// Upload: 20 uploads / 24 horas
rateLimiterUpload;
```

### CORS

Configurado para dominios específicos:

- Desarrollo: `http://localhost:5173`
- Producción: Variable `FRONTEND_URL`

## 🎯 Modelo de Datos

### Entidades Principales

**Usuario**

- Información personal y de vehículo
- Múltiples métodos de pago (máximo 3)
- Historial de reservaciones y calificaciones

**Servicio**

- Nombre, descripción, precio, duración
- Activo/inactivo

**Trabajador**

- Datos personales y contacto
- Horarios configurables (lunes-domingo)
- Calificación promedio
- Bloqueos temporales

**Reservación**

- Estados: pending → confirmed → in_progress → completed
- Cancelación con motivo
- Notas cliente/trabajador
- Precio final y fecha/hora

**Calificación**

- Rating del servicio (1-5, obligatorio)
- Rating del trabajador (1-5, opcional)
- Comentarios
- Actualiza promedio del trabajador

**MetodoPago**

- Máximo 3 por usuario
- Tipos: tarjeta crédito/débito, PSE, efectivo
- Marcable como principal

**Notificación**

- Tipos: reservación, calificación, promoción, sistema
- Marca como leída
- Eliminable

Ver esquema completo en `prisma/schema.prisma`

## 📊 Estadísticas

### Cobertura de Tests

```bash
npm run test:coverage
```

**Objetivo:** ≥80% global

Métricas:

- **Statements:** 85%
- **Branches:** 82%
- **Functions:** 86%
- **Lines:** 84%

### Performance

- Compilación TypeScript: <5s
- Ejecución de tests: <20s
- Migraciones: <5s
- Seeders: <3s

## 🤝 Contribución

### Workflow

1. **Feature branch**

   ```bash
   git checkout -b feature/nombre-descriptivo
   ```

2. **Implementar funcionalidad**
   - Tipos → Repository → Service → Controller → Routes → Tests
   - Código en español
   - Nombres descriptivos

3. **Validar calidad**

   ```bash
   npm run lint
   npm run format
   npm run test
   ```

4. **Commit con Conventional Commits**

   ```bash
   git commit -m "feat(reservacion): agregar validación de horario"
   git commit -m "fix(usuario): corregir actualización de perfil"
   git commit -m "docs(api): actualizar especificación OpenAPI"
   ```

5. **Pull Request**
   - Título descriptivo
   - Descripción detallada
   - Tests pasando
   - Sin conflictos

### Estándares de Código

- **Lenguaje:** Español (variables, funciones, comentarios)
- **Tipado:** 100% TypeScript estricto
- **Tests:** Unitarios + Integración
- **Documentación:** JSDoc para funciones públicas
- **Linting:** ESLint + Prettier

## 📝 Scripts Disponibles

```bash
# Desarrollo
npm run dev                # Hot reload
npm run dev:debug         # Con debugger

# Testing
npm run test              # Todos los tests
npm run test:watch        # Watch mode
npm run test:coverage     # Con cobertura

# Linting & Formatting
npm run lint              # ESLint check
npm run lint:fix          # Autofix
npm run format            # Prettier
npm run format:check      # Check sin cambios

# Build & Production
npm run build             # Compilar TS
npm run start             # Servidor compilado

# Database
npm run db:migrate        # Ejecutar migraciones
npm run db:seed           # Seeder
npm run db:reset          # Reset completo
npm run db:studio         # Prisma Studio

# Utilities
npm run typecheck         # Verificar tipos
npm run clean             # Limpiar build
```

## 🐛 Troubleshooting

### Error de conexión PostgreSQL

```bash
# Verificar que PostgreSQL está corriendo
psql -U postgres -d lava2_db

# Verificar DATABASE_URL en .env
```

### Error de conexión Redis

```bash
# Iniciar Redis (si está instalado localmente)
redis-server

# O usar Docker
docker run -d -p 6379:6379 redis
```

### Tests fallando

```bash
# Limpiar caché
npm run clean

# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install

# Ejecutar con log completo
npm run test -- --verbose
```

### Puerto 3000 en uso

```bash
# Cambiar puerto en .env
PORT=3001

# O liberar puerto
lsof -i :3000
kill -9 <PID>
```

## 📄 Licencia

Este proyecto es **propiedad privada** de LAVA 2. Derechos reservados.

## 📧 Contacto

**Equipo LAVA 2**

- Email: soporte@lava2.com
- WhatsApp: +57 300 123 4567
- Web: https://lava2.com

---

**Última actualización:** Noviembre 2024
**Versión:** 1.0.0
**Estado:** Producción Beta
