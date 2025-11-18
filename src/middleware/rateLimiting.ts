import rateLimit from 'express-rate-limit';

// ============================================
// CONFIGURACIÓN DE RATE LIMITERS
// ============================================

/**
 * Rate limiter general para todas las rutas.
 * Límite: 100 requests por 15 minutos por IP.
 */
export const rateLimiterGeneral = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests por ventana
  message:
    'Demasiadas solicitudes desde esta IP. Por favor intenta nuevamente más tarde.',
  standardHeaders: true, // Retornar la información del rate limit en el header `RateLimit-*`
  legacyHeaders: false, // Deshabilitar el header `X-RateLimit-*`
  statusCode: 429, // Código HTTP para "Too Many Requests"
});

/**
 * Rate limiter más restrictivo para login.
 * Límite: 5 intentos por 15 minutos por IP.
 * Solo cuenta intentos fallidos (skipSuccessfulRequests = true).
 */
export const rateLimiterLogin = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos por ventana
  message:
    'Demasiados intentos de inicio de sesión. Por favor intenta nuevamente más tarde.',
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: 429,
  skipSuccessfulRequests: true, // No contar intentos exitosos
});

/**
 * Rate limiter para registro.
 * Límite: 3 registros por hora por IP.
 * Previene creación masiva de cuentas.
 */
export const rateLimiterRegistro = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // 3 registros por hora
  message:
    'Demasiados registros desde esta IP. Por favor intenta nuevamente más tarde.',
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: 429,
});

/**
 * Rate limiter para uploads de archivos.
 * Límite: 20 uploads por día por usuario.
 */
export const rateLimiterUpload = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 horas
  max: 20, // 20 uploads por día
  message:
    'Límite de subida de archivos alcanzado por hoy. Intenta nuevamente mañana.',
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: 429,
});
