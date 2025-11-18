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
 * Validación para obtener notificaciones
 * GET /api/notificaciones
 */
export const validacionObtenerNotificaciones = [
  query('pagina')
    .optional()
    .isInt({ min: 1 })
    .withMessage('pagina debe ser mayor a 0'),

  query('limite')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('límite debe estar entre 1 y 100'),

  query('leida')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('leida debe ser true o false'),

  validarResultado,
];

/**
 * Validación para marcar como leída
 * PUT /api/notificaciones/:id/leida
 */
export const validacionMarcarComoLeida = [
  param('id')
    .isUUID()
    .withMessage('ID debe ser un UUID válido'),

  validarResultado,
];

/**
 * Validación para obtener por tipo
 * GET /api/notificaciones/tipo/:tipo
 */
export const validacionObtenerPorTipo = [
  param('tipo')
    .isIn(['reservacion', 'calificacion', 'promocion', 'sistema'])
    .withMessage('tipo debe ser: reservacion, calificacion, promocion o sistema'),

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
 * Validación para eliminar notificación
 * DELETE /api/notificaciones/:id
 */
export const validacionEliminarNotificacion = [
  param('id')
    .isUUID()
    .withMessage('ID debe ser un UUID válido'),

  validarResultado,
];

/**
 * Validación para obtener no leídas y contar
 * No requiere validaciones especiales - solo autenticación
 */
export const validacionNoLeidas = [validarResultado];
