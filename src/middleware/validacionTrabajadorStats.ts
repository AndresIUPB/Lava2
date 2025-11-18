import { param, query, validationResult } from 'express-validator';
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
 * Validación para obtener estadísticas generales de trabajador
 * GET /api/trabajadores/:id/estadisticas
 */
export const validacionEstadisticas = [
  param('id')
    .isUUID()
    .withMessage('ID debe ser un UUID válido'),

  query('fechaInicio')
    .optional()
    .isISO8601()
    .withMessage('fechaInicio debe estar en formato ISO8601'),

  query('fechaFin')
    .optional()
    .isISO8601()
    .withMessage('fechaFin debe estar en formato ISO8601'),

  validarResultado,
];

/**
 * Validación para obtener estadísticas mensuales
 * GET /api/trabajadores/:id/estadisticas/mensuales
 */
export const validacionEstadisticasMensuales = [
  param('id')
    .isUUID()
    .withMessage('ID debe ser un UUID válido'),

  query('meses')
    .optional()
    .isInt({ min: 1, max: 24 })
    .withMessage('meses debe estar entre 1 y 24'),

  validarResultado,
];

/**
 * Validación para obtener mejores trabajadores
 * GET /api/trabajadores/ranking/mejores
 */
export const validacionMejoresTrabajadores = [
  query('limite')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('límite debe estar entre 1 y 100'),

  validarResultado,
];
