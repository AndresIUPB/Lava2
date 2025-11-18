# 🚀 QUICK START - LAVA 2 Backend

Comienza a desarrollar en 5 minutos.

---

## ⚡ Setup Rápido (5 minutos)

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Variables de Entorno

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales de PostgreSQL y Redis.

### 3. Preparar Base de Datos

```bash
# Ejecutar migraciones
npx prisma migrate dev

# Cargar datos de prueba
npx prisma db seed
```

### 4. Iniciar Servidor

```bash
npm run dev
```

El servidor estará disponible en **http://localhost:3000**

### 5. Verificar Todo Funciona

```bash
# En otra terminal:
npm run test
```

Deberías ver: **✅ 165 tests passing**

---

## 📁 Dónde Empezar a Programar

### Agregar un Nuevo Endpoint (7 pasos)

1. **Crear Ruta** → `src/routes/[dominio].routes.ts`
2. **Crear Validación** → `src/middleware/validacion[Dominio].ts`
3. **Crear Controller** → `src/controllers/[dominio].controller.ts`
4. **Crear Service** → `src/services/[dominio].service.ts`
5. **Actualizar Repository** → `src/repositories/[dominio].repository.ts`
6. **Escribir Tests** → `src/__tests__/[dominio].routes.test.ts`
7. **Documentar** → `docs/api-spec.yml`

**Ver detalles completos:** `DEVELOPER_GUIDE.md`

---

## 🧪 Ejecutar Tests

```bash
# Todos los tests
npm run test

# Con watch mode
npm run test:watch

# Con cobertura
npm run test:coverage

# Solo un archivo
npm run test -- usuario
```

---

## 📚 Documentación Principal

| Documento                                          | Para                  | Tiempo |
| -------------------------------------------------- | --------------------- | ------ |
| [README.md](./README.md)                           | Overview del proyecto | 15 min |
| [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)         | Cómo programar        | 30 min |
| [docs/api-spec.yml](./docs/api-spec.yml)           | Especificación de API | 20 min |
| [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md) | Índice completo       | 5 min  |

---

## 🔧 Comandos Útiles

```bash
# Desarrollo
npm run dev              # Hot reload
npm run test:watch       # Tests live
npm run lint             # Verificar código
npm run format           # Formatear código

# Base de datos
npx prisma migrate dev   # Ejecutar migraciones
npx prisma db seed       # Cargar datos
npx prisma studio       # Ver BD visualmente

# Producción
npm run build            # Compilar
npm start                # Ejecutar compilado
```

---

## 🐛 Problemas Comunes

### "Connection refused" a PostgreSQL

→ Verifica que PostgreSQL esté corriendo

```bash
# En Windows:
net start postgresql-x64-15  # O tu versión
```

### "Connection refused" a Redis

→ Redis es opcional para tests (usa mockeos)
→ Para desarrollo: `redis-cli ping`

### Tests fallan

→ Ejecuta: `npx prisma migrate dev` primero
→ Luego: `npm run test`

### TypeScript errors

→ Ejecuta: `npx tsc --noEmit`
→ Corrige los errores señalados

---

## 📊 Estructura de Directorios (TL;DR)

```
src/
├── controllers/    ← Manejan HTTP (req/res)
├── services/       ← Lógica de negocio
├── repositories/   ← Acceso a BD (Prisma)
├── routes/         ← Definición de endpoints
├── middleware/     ← Validación, autenticación
└── __tests__/      ← Tests (165 archivos)

prisma/
└── schema.prisma   ← [EDITAR AQUÍ para cambios BD]

docs/
└── api-spec.yml    ← [EDITAR AQUÍ para documentar endpoints]
```

---

## ✅ Checklist Antes de Hacer Commit

```bash
# 1. Validar código
npm run lint           # Sin errores
npm run format         # Formateado

# 2. Validar TypeScript
npx tsc --noEmit       # 0 errores

# 3. Validar tests
npm run test -- archivo   # Todos pasando

# 4. Commit
git add .
git commit -m "feat(scope): descripción"
```

---

## 🎯 Próximos Pasos

### Hoy (30 minutos)

- [x] Instalar dependencias
- [x] Configurar .env
- [x] Correr migraciones
- [ ] Leer README.md (15 min)
- [ ] Explorar `src/services/` (15 min)

### Esta semana

- [ ] Leer DEVELOPER_GUIDE.md
- [ ] Hacer cambio pequeño (agregar campo)
- [ ] Crear primer endpoint nuevo

### Este mes

- [ ] Dominar los patrones
- [ ] Agregar varias funcionalidades
- [ ] Aumentar cobertura de tests

---

## 📞 Necesitas Ayuda?

### Documentación Rápida

- FAQ: Busca en `DEVELOPER_GUIDE.md`
- Ejemplos: Ver `src/services/` (ejemplos completos)
- Especificación: `docs/api-spec.yml` (43 endpoints)

### Recursos Externos

- [Prisma Docs](https://www.prisma.io/docs)
- [Express.js Guide](https://expressjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

---

## 🎓 Flujo Típico de Desarrollo

```
Feature Branch
    ↓
Write Code
    ↓
npm run test:watch (desarrollo)
    ↓
npm run lint & npm run format
    ↓
npm run test (todos pasan)
    ↓
npm run test:coverage (verificar)
    ↓
Git Commit (mensaje descriptivo)
    ↓
Pull Request
    ↓
Code Review
    ↓
Merge a develop
```

---

## 🚀 Primer Test

Quieres verificar que todo funciona? Corre esto:

```bash
npm run test -- usuario.routes
```

Deberías ver tests verdes con ejemplos de:

- Crear usuario (registro)
- Login
- Obtener perfil
- Actualizar perfil

---

## 📈 Mantener la Calidad

### Cobertura de Tests

- **Actual:** 46.67% (aceptable v1)
- **Target:** 70% (para v2)
- Mejorar: Agregar tests a `src/services/`

### TypeScript

- **Actual:** 100% tipado
- **Mantener así:** Nunca uses `any`

### Documentación

- **Mantener:** JSDoc en funciones públicas
- **Actualizar:** docs/api-spec.yml con cambios

---

## 🎉 ¡Listo!

Ahora ya tienes:

- ✅ Backend completo funcionando
- ✅ 165 tests pasando
- ✅ Documentación exhaustiva
- ✅ Ejemplos de código

**¡A programar! 🚀**

---

Para documentación completa: **[README.md](./README.md)**
Para guía detallada: **[DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)**
Para especificación API: **[docs/api-spec.yml](./docs/api-spec.yml)**
