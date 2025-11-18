# 🚀 LAVA 2 Backend - Guía para el Siguiente Developer

Bienvenido al proyecto LAVA 2 Backend. Este documento te ayudará a navegar el código y continuar el desarrollo.

---

## 📖 Lectura Recomendada

### 1. **Empieza aquí** (10 min)

- [ ] `README.md` - Overview general, instalación, stack
- [ ] `PROJECT_SUMMARY.md` - Estadísticas y estado actual

### 2. **Entiende la arquitectura** (20 min)

- [ ] `docs/api-spec.yml` - Endpoints y esquemas
- [ ] `prisma/schema.prisma` - Modelo de datos completo
- [ ] `.github/copilot-instructions.md` - Principios de desarrollo

### 3. **Explora el código** (30 min)

- [ ] `src/services/` - Lógica de negocio (ejemplos: `reservacion.service.ts`)
- [ ] `src/controllers/` - Handlers HTTP (ejemplo: `reservacion.controller.ts`)
- [ ] `src/repositories/` - Acceso a datos (ejemplo: `reservacion.repository.ts`)

### 4. **Revisa los tests** (15 min)

- [ ] `src/__tests__/` - Test suites (nota el patrón: `.routes.test.ts`)
- [ ] `jest.config.js` - Configuración de testing

---

## 🎯 Quick Start para Desarrollo

### Setup Inicial

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar .env (copiar .env.example y editar)
cp .env.example .env
# Editar con tus credenciales locales

# 3. Ejecutar migraciones
npx prisma migrate dev

# 4. Cargar datos de prueba
npx prisma db seed

# 5. Iniciar servidor
npm run dev
```

### Flujo Típico de Desarrollo

```bash
# 1. Crear rama de feature
git checkout -b feature/mi-funcionalidad

# 2. Hacer cambios en src/

# 3. Escribir tests
npm run test:watch

# 4. Verificar calidad
npm run lint
npm run format

# 5. Commit
git commit -m "feat(dominio): descripción clara"

# 6. Push y Pull Request
git push origin feature/mi-funcionalidad
```

---

## 📁 Estructura Rápida

```
src/
├── controllers/      → Maneja HTTP requests
├── services/         → Lógica de negocio
├── repositories/     → Acceso a datos
├── routes/           → Definición de endpoints
├── middleware/       → Validación, autenticación
├── types/            → TypeScript interfaces
├── utils/            → Helpers (errores, JWT, etc)
└── __tests__/        → Test suites

prisma/
├── schema.prisma     → Modelo de datos (MODIFICAR AQUÍ para cambios de BD)
└── migrations/       → Historial de cambios

docs/
├── api-spec.yml      → Documentación OpenAPI (actualizar con nuevos endpoints)
└── modelo-datos.md   → Explicación del modelo
```

---

## 🔑 Conceptos Clave

### 1. **Patrón Repository**

Cada tabla tiene un repository:

```typescript
// src/repositories/usuario.repository.ts
export class UsuarioRepository {
  async obtenerUsuarioPorId(id: string) { ... }
  async crearUsuario(datos) { ... }
  // Cada método CRUD
}
```

**Cuándo modificar:** Cuando necesites nuevas queries complejas.

### 2. **Patrón Service**

Servicios orquestan repositories y aplican lógica:

```typescript
// src/services/usuario.service.ts
export class UsuarioService {
  private usuarioRepo = new UsuarioRepository();

  async registrarUsuario(datos) {
    // Validar
    // Hashear password
    // Llamar repository
    // Retornar resultado
  }
}
```

**Cuándo modificar:** Para agregar lógica de negocio.

### 3. **Patrón Controller**

Controllers transforman HTTP ↔ Services:

```typescript
// src/controllers/usuario.controller.ts
export class UsuarioController {
  crearUsuario = async (req, res, next) => {
    try {
      const datos = req.body; // Extrae
      const usuario = await this.usuarioService.registrarUsuario(datos); // Llama
      respuestaExito(res, usuario, "Creado", 201); // Responde
    } catch (error) {
      next(error); // Delega
    }
  };
}
```

**Cuándo modificar:** Raramente (solo para cambios HTTP).

### 4. **Rutas**

Conectan endpoints con controllers y validaciones:

```typescript
// src/routes/usuario.routes.ts
router.post(
  "/registro",
  validacionRegistro, // Express-validator
  usuarioController.crearUsuario
);
```

**Cuándo modificar:** Para agregar nuevos endpoints o cambiar validación.

---

## ✅ Tareas Comunes

### Agregar un Nuevo Endpoint

Ejemplo: Agregar POST `/usuarios/cambiar-password`

**Paso 1: Repository** (si necesitas nueva query)

```typescript
// src/repositories/usuario.repository.ts
async actualizarPassword(id: string, passwordHash: string) {
  return this.prisma.usuario.update({
    where: { id },
    data: { passwordHash }
  });
}
```

**Paso 2: Service**

```typescript
// src/services/usuario.service.ts
async cambiarPassword(usuarioId: string, passwordActual: string, passwordNueva: string) {
  const usuario = await this.usuarioRepo.obtenerUsuarioPorId(usuarioId);
  const valido = await compararPassword(passwordActual, usuario.passwordHash);
  if (!valido) throw new ErrorNoAutorizado('Contraseña actual incorrecta');

  const hash = await hashearPassword(passwordNueva);
  return await this.usuarioRepo.actualizarPassword(usuarioId, hash);
}
```

**Paso 3: Controller**

```typescript
// src/controllers/usuario.controller.ts
cambiarPassword = async (req, res, next) => {
  try {
    const { passwordActual, passwordNueva } = req.body;
    await this.usuarioService.cambiarPassword(
      req.usuario!.id,
      passwordActual,
      passwordNueva
    );
    respuestaExito(res, {}, "Contraseña actualizada");
  } catch (error) {
    next(error);
  }
};
```

**Paso 4: Validación**

```typescript
// src/middleware/validacion.ts
export const validacionCambiarPassword = [
  body("passwordActual")
    .notEmpty()
    .withMessage("Contraseña actual requerida")
    .isString()
    .withMessage("Debe ser texto"),
  body("passwordNueva")
    .notEmpty()
    .withMessage("Contraseña nueva requerida")
    .isLength({ min: 8 })
    .withMessage("Mínimo 8 caracteres"),
  validarResultado,
];
```

**Paso 5: Ruta**

```typescript
// src/routes/usuario.routes.ts
router.post(
  "/cambiar-password",
  verificarAutenticacion,
  validacionCambiarPassword,
  usuarioController.cambiarPassword
);
```

**Paso 6: Tests**

```typescript
// src/__tests__/usuario.routes.test.ts
describe("POST /cambiar-password", () => {
  it("debería cambiar contraseña exitosamente", async () => {
    const response = await request(app)
      .post("/api/usuarios/cambiar-password")
      .set("Cookie", [`accessToken=${validToken}`])
      .send({ passwordActual: "Password123!", passwordNueva: "NewPass456!" });

    expect(response.status).toBe(200);
  });
});
```

**Paso 7: Documentación**

```yaml
# docs/api-spec.yml
/usuarios/cambiar-password:
  post:
    tags: [Usuario]
    summary: Cambiar contraseña del usuario
    security:
      - cookieAuth: []
    requestBody: ...
    responses: ...
```

### Agregar un Campo a una Entidad

Ejemplo: Agregar `segundoNombre: String?` al Usuario

**Paso 1: Actualizar schema**

```prisma
# prisma/schema.prisma
model Usuario {
  id            String   @id @default(uuid())
  nombreCompleto String
  segundoNombre  String?  ← AGREGAR
  // ... resto
}
```

**Paso 2: Migración**

```bash
npx prisma migrate dev --name agregar_segundo_nombre_usuario
# Genera migration automáticamente
```

**Paso 3: Actualizar tipos** (si tienes DTO separado)

```typescript
interface ActualizarUsuarioDto {
  nombreCompleto?: string;
  segundoNombre?: string;  ← AGREGAR
}
```

**Paso 4: Actualizar servicio** (si aplica lógica)

```typescript
// Si hay validaciones especiales para segundoNombre
```

**Paso 5: Actualizar tests**

```typescript
it("debería aceptar segundoNombre", async () => {
  // Test aquí
});
```

---

## 🧪 Testing

### Ejecutar Tests

```bash
# Todos
npm run test

# Watch mode
npm run test:watch

# Específico
npm run test -- usuario.routes.test

# Con cobertura
npm run test:coverage
```

### Estructura de Test

```typescript
describe("UsuarioRoutes - Integration Tests", () => {
  let accessToken: string;
  let usuarioId: string;

  beforeAll(() => {
    accessToken = generarAccessToken({ id: "test-id", email: "test@test.com" });
  });

  describe("POST /usuarios/cambiar-password", () => {
    it("debería cambiar contraseña correctamente", async () => {
      // Arrange
      const request = { passwordActual: "...", passwordNueva: "..." };

      // Act
      const response = await request(app)
        .post("/api/usuarios/cambiar-password")
        .set("Cookie", [`accessToken=${accessToken}`])
        .send(request);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
```

---

## 🐛 Debugging

### Ver logs en desarrollo

```bash
DEBUG=* npm run dev  # Todos los logs
npm run dev          # Solo console.log/error
```

### Abrir Prisma Studio

```bash
npx prisma studio
# Abre http://localhost:5555 - interfaz gráfica para BD
```

### Revisar queries en BD

```bash
# Conectar con psql
psql postgresql://user:password@localhost:5432/lava2_db

# Ver tablas
\dt

# Ver datos de usuario
SELECT * FROM usuarios LIMIT 5;
```

### Debugger de Node

```bash
# Agregar breakpoint en código
debugger;

# Ejecutar con inspección
node --inspect dist/server.js
# Abre chrome://inspect en Chrome
```

---

## 📋 Checklist Antes de Hacer Commit

- [ ] Tests nuevos escribidos
- [ ] Todos los tests pasan: `npm run test`
- [ ] Código formateado: `npm run format`
- [ ] Sin errores de lint: `npm run lint`
- [ ] TypeScript compila: `npx tsc --noEmit`
- [ ] Documentación actualizada (OpenAPI, README, JSDoc)
- [ ] Mensaje de commit descriptivo
- [ ] Sin `any` types o `console.log` innecesarios

---

## 🤔 Preguntas Frecuentes

### ¿Cómo agrego un nuevo tipo de usuario/rol?

Actualmente no hay sistema de roles. Para agregarlo:

1. Agregar campo `rol: String` a Usuario en Prisma
2. Crear enum `Rol { ADMIN, TRABAJADOR, CLIENTE }`
3. Agregar middleware de autorización: `verificarRol(['ADMIN'])`
4. Proteger endpoints sensibles

### ¿Cómo cambio la duración del JWT?

```typescript
// src/utils/jwt.ts
export const generarAccessToken = (payload: PayloadToken): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" }); // Cambiar aquí
};
```

### ¿Qué hacer si Redis no está disponible?

Actualmente el proyecto usa Redis para rate limiting. Sin Redis:

1. Cambiar `RateLimiterRedis` a `RateLimiterMemory` en `rateLimiting.ts`
2. Nota: Pierde persistencia en crash, solo para desarrollo

### ¿Cómo ejecutar solo tests de un módulo?

```bash
npm run test -- usuario.routes.test.ts
npm run test -- --testNamePattern="cambiar-password"
```

---

## 🔗 Links Útiles

- **Prisma Docs:** https://www.prisma.io/docs
- **Express Guide:** https://expressjs.com/
- **Jest Guide:** https://jestjs.io/docs/getting-started
- **OpenAPI Spec:** https://swagger.io/specification/
- **TypeScript Handbook:** https://www.typescriptlang.org/docs/

---

## 👥 Equipo & Contacto

- **Documentación:** Ver README.md
- **Issues/Bugs:** Reportar en GitHub Issues
- **Features:** Discutir en Pull Requests
- **Arquitectura:** Ver `.github/copilot-instructions.md`

---

## 🎓 Próximas Funcionalidades Sugeridas

### High Priority

1. **Admin endpoints** - CRUD de servicios, trabajadores
2. **Pasarelas de pago** - Integración real (Stripe, Paypal)
3. **Push notifications** - Firebase Cloud Messaging
4. **Payment webhooks** - Actualizar estado de pago

### Medium Priority

1. **Reportes** - Analytics y estadísticas avanzadas
2. **Promociones** - Sistema de cupones/descuentos
3. **Soporte multiidioma** - i18n
4. **Búsqueda avanzada** - Elasticsearch

### Nice to Have

1. **Admin dashboard web** - Gestión completa
2. **Migraciones a otros países** - Formato de placa, teléfono, etc
3. **Escalabilidad** - DB sharding, caching distribuido
4. **API v2** - GraphQL en paralelo a REST

---

## 📝 Template para Pull Request

```markdown
## Descripción

Breve descripción de qué cambia.

## Tipo de cambio

- [ ] Bug fix
- [ ] Nueva feature
- [ ] Breaking change
- [ ] Documentación

## Cambios

- Cambio 1
- Cambio 2

## Tests

- [x] Tests nuevos escritos
- [x] Todos los tests pasan
- [x] Cobertura ≥70%

## Checklist

- [x] Código formateado
- [x] Sin errores de lint
- [x] Documentación actualizada
- [x] Mensaje de commit descriptivo
```

---

**¡Bienvenido al equipo! Happy coding! 🚀**

_Última actualización: Noviembre 2024_
