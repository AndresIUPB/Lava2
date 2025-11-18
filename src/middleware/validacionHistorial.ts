import { query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { respuestaError } from '../utils/respuestas';

/**
 * Middleware para validar resultados de express-validator
 */
export const validarResultado = (req: Request, res: Response, next: NextFunction): void => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    respuestaError(res, 'Error de validación', 400, errores.array());
    return;
  }
  next();
};

/**
 * Validación para obtener estadísticas generales
 * GET /api/historial/estadisticas
 */
export const validacionEstadisticas = [
  query('fechaInicio')
    .optional()
    .isISO8601()
    .withMessage('fechaInicio debe ser una fecha válida en formato ISO 8601'),

  query('fechaFin')
    .optional()
    .isISO8601()
    .withMessage('fechaFin debe ser una fecha válida en formato ISO 8601'),

  query('periodo')
    .optional()
    .isIn(['mes', 'trimestre', 'año'])
    .withMessage('periodo debe ser: mes, trimestre o año'),

  validarResultado,
];

/**
 * Validación para obtener estadísticas mensuales
 * GET /api/historial/estadisticas/mensuales
 */
export const validacionEstadisticasMensuales = [
  query('meses')
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage('meses debe estar entre 1 y 12'),

  validarResultado,
];

/**
 * Validación para obtener historial filtrado
 * GET /api/historial/filtrado
 */
export const validacionHistorialFiltrado = [
  query('estado')
    .optional()
    .isIn(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'])
    .withMessage('estado debe ser: pending, confirmed, in_progress, completed o cancelled'),

  query('servicioId')
    .optional()
    .isUUID()
    .withMessage('servicioId debe ser un UUID válido'),

  query('trabajadorId')
    .optional()
    .isUUID()
    .withMessage('trabajadorId debe ser un UUID válido'),

  query('fechaInicio')
    .optional()
    .isISO8601()
    .withMessage('fechaInicio debe ser una fecha válida en formato ISO 8601'),

  query('fechaFin')
    .optional()
    .isISO8601()
    .withMessage('fechaFin debe ser una fecha válida en formato ISO 8601'),

  query('pagina')
    .optional()
    .isInt({ min: 1 })
    .withMessage('pagina debe ser mayor a 0'),

  query('limite')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('límite debe estar entre 1 y 100'),

  validarResultado,
];

/**
 * Validación para obtener resumen
 * GET /api/historial/resumen
 * No requiere validaciones especiales - solo autenticación
 */
export const validacionResumen = [validarResultado];
