import { Request, Response, NextFunction } from 'express';
import { ErrorBase } from '../utils/errores';
import { respuestaError } from '../utils/respuestas';

// ============================================
// MIDDLEWARE DE MANEJO DE ERRORES CENTRALIZADO
// ============================================

/**
 * Middleware centralizado para el manejo de todas las excepciones de la aplicación.
 *
 * Distingue entre errores controlados (ErrorBase) y no controlados,
 * aplicando el logging y formato de respuesta apropiado según el ambiente.
 *
 * En desarrollo:
 * - Muestra stack trace completo
 * - Detalles de validación incluidos
 *
 * En producción:
 * - Mensajes genéricos (no expone detalles internos)
 * - Stack trace oculto
 *
 * **IMPORTANTE**: Este middleware DEBE ser registrado al final de todas las rutas:
 * ```typescript
 * app.use(manejadorErrores);
 * ```
 *
 * @param error - Error capturado
 * @param _req - Request de Express (no se usa)
 * @param res - Response de Express
 * @param _next - NextFunction (no se usa)
 */
export const manejadorErrores = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const esDesarrollo = process.env.NODE_ENV === 'development';

  // ============================================
  // MANEJO DE ERRORES CONTROLADOS (ErrorBase)
  // ============================================
  if (error instanceof ErrorBase) {
    // Log del error en desarrollo
    if (esDesarrollo) {
      console.error(`[ERROR ${error.codigoEstado}] ${error.message}`);
      if (error.stack) {
        console.error('Stack:', error.stack);
      }
    }

    // En producción, solo log del mensaje sin stack trace
    if (!esDesarrollo && !error.esOperacional) {
      // Error no operacional en producción: log para revisión posterior
      console.error(`[ERROR CRÍTICO ${error.codigoEstado}] ${error.message}`);
    }

    // Retornar respuesta de error controlado
    respuestaError(res, error.message, error.codigoEstado);
    return;
  }

  // ============================================
  // MANEJO DE ERRORES NO CONTROLADOS
  // ============================================

  // Log completo en desarrollo
  if (esDesarrollo) {
    console.error('❌ Error no controlado capturado:');
    console.error('Tipo:', error.name);
    console.error('Mensaje:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }

    // Retornar con detalles para debugging
    respuestaError(res, error.message || 'Error interno del servidor', 500, {
      tipo: error.name,
      stack: error.stack,
    });
    return;
  }

  // En producción: mensaje genérico y log del error
  console.error(`[ERROR INTERNO] ${error.message || 'Error no controlado'}`);
  if (error.stack) {
    console.error('Stack:', error.stack);
  }

  respuestaError(res, 'Error interno del servidor', 500);
};

