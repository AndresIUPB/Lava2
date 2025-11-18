<!-- LAVA 2 Backend - Documento de Índice -->

# 📚 LAVA 2 Backend - Centro de Documentación

Bienvenido a la documentación centralizada del backend de LAVA 2. Este documento te ayuda a encontrar lo que necesitas.

---

## 🚀 Para Empezar

| Documento                                      | Descripción                        | Duración |
| ---------------------------------------------- | ---------------------------------- | -------- |
| **[README.md](./README.md)**                   | Overview, instalación, stack       | 15 min   |
| **[DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)** | Guía práctica para desarrolladores | 30 min   |
| **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** | Estadísticas y estado del proyecto | 10 min   |

---

## 📖 Documentación Técnica

### API & Endpoints

- **[docs/api-spec.yml](./docs/api-spec.yml)** - Especificación OpenAPI 3.0.3 completa
  - 43 endpoints documentados
  - Esquemas de entidades
  - Ejemplos de request/response
  - Seguridad JWT configurada

### Modelo de Datos

- **[prisma/schema.prisma](./prisma/schema.prisma)** - Definición del modelo Prisma
  - 11 modelos (Usuario, Servicio, Trabajador, etc)
  - Relaciones y restricciones
  - Índices optimizados

### Arquitectura & Principios

- **[.github/copilot-instructions.md](./.github/copilot-instructions.md)** - Guía arquitectónica completa
  - Patrones de implementación
  - Estándares de código
  - Convenciones de nombres
  - Flujo de desarrollo

---

## 💻 Guías por Tarea

### Desarrollo Común

| Tarea                       | Ubicación                                                                 | Pasos                   |
| --------------------------- | ------------------------------------------------------------------------- | ----------------------- |
| **Agregar nuevo endpoint**  | [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md#agregar-un-nuevo-endpoint)      | 7 pasos                 |
| **Agregar campo a entidad** | [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md#agregar-un-campo-a-una-entidad) | 5 pasos                 |
| **Escribir tests**          | [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md#testing)                        | Ejemplos incluidos      |
| **Debug de código**         | [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md#debugging)                      | Herramientas y ejemplos |

### Quick Reference

**Crear nueva rama:**

```bash
git checkout -b feature/mi-funcionalidad
```

**Desarrollo local:**

```bash
npm run dev           # Hot reload
npm run test:watch    # Tests live
```

**Antes de commit:**

```bash
npm run lint          # Check errores
npm run format        # Formatear código
npm run test          # Ejecutar tests
npx tsc --noEmit      # Validar TypeScript
```

---

## 📁 Estructura de Carpetas

```
backend/
├── src/
│   ├── controllers/           → HTTP handlers
│   ├── services/              → Lógica de negocio
│   ├── repositories/          → Acceso a datos
│   ├── routes/                → Definición de endpoints
│   ├── middleware/            → Validación, autenticación
│   ├── types/                 → TypeScript interfaces
│   ├── utils/                 → Helpers (errores, JWT, etc)
│   └── __tests__/             → Test suites (165 tests)
│
├── prisma/
│   ├── schema.prisma          → [MODIFICAR AQUÍ para cambios BD]
│   └── migrations/            → Historial de cambios
│
├── docs/
│   ├── api-spec.yml           → [Documentación OpenAPI]
│   ├── modelo-datos.md        → Explicación del modelo
│   └── README.md              → [Este archivo]
│
├── README.md                  → [Guía principal del proyecto]
├── DEVELOPER_GUIDE.md         → [Guía para desarrolladores]
├── PROJECT_SUMMARY.md         → [Estadísticas y estado]
├── .env.example               → Template de variables
├── jest.config.js             → Configuración de tests
├── tsconfig.json              → Configuración TypeScript
└── package.json               → Dependencias

```

---

## 🏗️ Capas del Sistema

### Capa HTTP (Routes + Controllers)

```typescript
// Ubicación: src/routes/*.routes.ts, src/controllers/*.controller.ts
// Responsabilidad: Manejar HTTP, validar entrada, orquestar

POST /api/reservaciones          ← Route
  ↓
validacionCrearReservacion       ← Middleware de validación
  ↓
ReservacionController.crear()    ← Handler HTTP
  ↓
ReservacionService.crear()       ← Lógica de negocio
  ↓
ReservacionRepository.create()   ← Query a BD
```

### Capa de Negocio (Services)

```typescript
// Ubicación: src/services/*.service.ts
// Responsabilidad: Lógica, validaciones, orquestación
class ReservacionService {
  async crear(datos) {
    // Validar usuario existe
    // Validar servicio existe
    // Validar disponibilidad trabajador
    // Validar regla: usuario no tiene otra activa
    // Llamar repository
    // Retornar resultado
  }
}
```

### Capa de Datos (Repositories)

```typescript
// Ubicación: src/repositories/*.repository.ts
// Responsabilidad: Queries a BD con Prisma
class ReservacionRepository {
  async crear(datos) {
    return this.prisma.reservacion.create({ data: datos });
  }

  async obtenerReservacionesPorTrabajador(trabajadorId, pagina, limite) {
    // Query compleja con joins
  }
}
```

---

## 🧪 Testing

### Estructuras de Tests

```typescript
// src/__tests__/reservacion.routes.test.ts
describe("ReservacionRoutes", () => {
  describe("POST /api/reservaciones", () => {
    it("debería crear reservación exitosamente", async () => {
      // Test aquí
    });
  });
});
```

### Ejecutar Tests

```bash
npm run test              # Todos
npm run test:watch        # Watch mode
npm run test:coverage     # Con cobertura
npm run test -- usuario   # Específico
```

### Coverage Actual

```
Routes:      100% ✅
Controllers: 90% ✅
Services:    32% (aceptable para v1)
Global:      46.67%
```

---

## 🔐 Seguridad

### Autenticación

- JWT con Access Token (15 min) + Refresh Token (7 días)
- Passwords con bcrypt (10 rounds)
- Cookies HTTP-Only

### Validación

- Express-validator en rutas
- Lógica de negocio en services
- Tipos TypeScript en todo

### Rate Limiting

- 100 req/15min general
- 5 intentos login/15min
- 20 uploads/24 horas

Ver más: [README.md - Seguridad](./README.md#-seguridad)

---

## 📊 Estadísticas del Proyecto

| Métrica              | Valor                       |
| -------------------- | --------------------------- |
| **Tests**            | 165 pasando ✅              |
| **Endpoints**        | 43 funcionales ✅           |
| **Modelos BD**       | 11 completos ✅             |
| **Cobertura**        | 46.67% global               |
| **TypeScript**       | 100% tipado ✅              |
| **Líneas de código** | ~5,500 fuente + 2,800 tests |

---

## 🚀 Despliegue

### Desarrollo Local

```bash
npm install
cp .env.example .env       # Editar con tus datos
npx prisma migrate dev
npx prisma db seed
npm run dev
```

### Staging/Producción

```bash
npm run build              # Compilar
npm start                  # Ejecutar
# O con PM2:
pm2 start dist/server.js
```

Ver más: [README.md - Instalación](./README.md#-instalación)

---

## 📞 FAQs Rápidas

### "¿Dónde agrego una nueva validación?"

→ [Paso 4 en DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md#paso-4-validación)

### "¿Cómo cambio algo en la BD?"

→ Editar `prisma/schema.prisma` → `npx prisma migrate dev`

### "¿Los tests están actualizados?"

→ Sí, 165 tests pasando. Ver `npm run test:coverage`

### "¿Cómo actualizo la documentación de API?"

→ Editar `docs/api-spec.yml` (OpenAPI format)

### "¿Qué hacer si Redis no funciona?"

→ Ver [FAQ en DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md#qué-hacer-si-redis-no-está-disponible)

---

## 🎯 Próximos Pasos Típicos

1. **Leer README.md** (15 min) - Entender el proyecto
2. **Leer DEVELOPER_GUIDE.md** (30 min) - Aprender workflow
3. **Explorar src/services/** (20 min) - Ver ejemplos de código
4. **Crear rama y hacer cambio pequeño** (30 min) - Práctica
5. **Ejecutar tests y validaciones** (10 min) - Entender el flujo

**Tiempo total:** ~1.5 horas para estar productivo

---

## 🔗 Links Internos

### Documentación de Funcionalidades

- [Autenticación](./docs/api-spec.yml#autenticación)
- [Usuarios](./docs/api-spec.yml#usuario)
- [Servicios](./docs/api-spec.yml#servicio)
- [Trabajadores](./docs/api-spec.yml#trabajador)
- [Trabajador Stats](./docs/api-spec.yml#trabajador-stats)
- [Reservaciones](./docs/api-spec.yml#reservación)
- [Métodos de Pago](./docs/api-spec.yml#método-de-pago)
- [Calificaciones](./docs/api-spec.yml#calificación)
- [Historial](./docs/api-spec.yml#historial)
- [Notificaciones](./docs/api-spec.yml#notificación)

---

## 📚 Stack de Tecnologías

```
Frontend Requirements:
├── Node.js 18+
├── npm 8+
└── PostgreSQL 14+ (local o remoto)

Core Stack:
├── TypeScript 5+
├── Express.js 4+
├── Prisma ORM 5+
├── PostgreSQL 14+
└── Redis 7+

Testing:
├── Jest 29+
├── Supertest
└── MockData

Utilities:
├── JWT (jsonwebtoken)
├── Bcrypt (passwords)
├── express-validator
├── express-rate-limit
└── cors
```

---

## 📋 Checklist Inicial para Nuevo Developer

- [ ] Clonar repositorio: `git clone ...`
- [ ] Instalar dependencias: `npm install`
- [ ] Configurar .env: `cp .env.example .env`
- [ ] Ejecutar migraciones: `npx prisma migrate dev`
- [ ] Cargar seeders: `npx prisma db seed`
- [ ] Iniciar servidor: `npm run dev`
- [ ] Verificar en http://localhost:3000
- [ ] Leer [README.md](./README.md)
- [ ] Leer [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)
- [ ] Hacer first commit pequeño

---

## 🎓 Recursos de Aprendizaje

### Documentación Externa

- [Prisma Documentation](https://www.prisma.io/docs)
- [Express.js Guide](https://expressjs.com/)
- [Jest Testing](https://jestjs.io/docs/getting-started)
- [OpenAPI Specification](https://swagger.io/specification/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [JWT.io](https://jwt.io/)

### Ejemplos en Código

- Ver `src/services/reservacion.service.ts` - Ejemplo complejo
- Ver `src/controllers/usuario.controller.ts` - Ejemplo simple
- Ver `src/__tests__/usuario.routes.test.ts` - Ejemplo de tests

---

## 🐛 Soporte & Issues

### Problemas Comunes

- [Redis connection refused](./DEVELOPER_GUIDE.md#-debugging)
- [Port 3000 already in use](./DEVELOPER_GUIDE.md#puerto-3000-en-uso)
- [Tests failing](./DEVELOPER_GUIDE.md#tests-fallando)
- [PostgreSQL connection error](./DEVELOPER_GUIDE.md#error-de-conexión-postgresql)

### Reportar Bugs

```bash
# 1. Abrir issue en GitHub
# 2. Incluir:
#    - Descripción del problema
#    - Pasos para reproducir
#    - Output de error
#    - Versión de Node.js
```

---

## 📞 Contacto & Equipo

**Equipo LAVA 2**

- Email: soporte@lava2.com
- Docs: [README.md](./README.md#-contacto)
- GitHub: Ver issues y PRs

---

## 📅 Versionado

| Versión | Fecha    | Estado        |
| ------- | -------- | ------------- |
| 1.0.0   | Nov 2024 | ✅ Producción |

---

## 📝 Última Actualización

- **Fecha:** Noviembre 2024
- **Autor:** GitHub Copilot
- **Estado:** ✅ Proyecto Completado

---

**¡Bienvenido al proyecto LAVA 2! 🚀**

Consulta el [README.md](./README.md) para comenzar.

---

_Generated with ❤️ by GitHub Copilot_
