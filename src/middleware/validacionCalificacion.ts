import { body, param, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { respuestaError } from '../utils/respuestas';

/**
 * Middleware para validar resultados de express-validator
 */
export const validarResultado = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    respuestaError(res, 'Error de validación', 400, errores.array());
    return;
  }
  next();
};

/**
 * Validación para crear calificación
 */
export const validacionCrearCalificacion = [
  body('reservacionId')
    .notEmpty()
    .withMessage('El ID de la reservación es obligatorio')
    .isUUID()
    .withMessage('El ID de la reservación debe ser un UUID válido'),

  body('calificacionServicio')
    .notEmpty()
    .withMessage('La calificación del servicio es obligatoria')
    .isInt({ min: 1, max: 5 })
    .withMessage('La calificación del servicio debe ser un número entero entre 1 y 5'),

  body('calificacionTrabajador')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('La calificación del trabajador debe ser un número entero entre 1 y 5'),

  body('comentarioServicio')
    .optional()
    .isString()
    .isLength({ max: 1000 })
    .withMessage('El comentario del servicio no puede exceder 1000 caracteres'),

  body('comentarioTrabajador')
    .optional()
    .isString()
    .isLength({ max: 1000 })
    .withMessage('El comentario del trabajador no puede exceder 1000 caracteres'),

  validarResultado,
];

/**
 * Validación para obtener calificación por ID
 */
export const validacionObtenerCalificacion = [
  param('id')
    .isUUID()
    .withMessage('El ID debe ser un UUID válido'),

  validarResultado,
];

/**
 * Validación para actualizar calificación
 */
export const validacionActualizarCalificacion = [
  param('id')
    .isUUID()
    .withMessage('El ID debe ser un UUID válido'),

  body('calificacionServicio')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('La calificación del servicio debe ser un número entero entre 1 y 5'),

  body('calificacionTrabajador')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('La calificación del trabajador debe ser un número entero entre 1 y 5'),

  body('comentarioServicio')
    .optional()
    .isString()
    .isLength({ max: 1000 })
    .withMessage('El comentario del servicio no puede exceder 1000 caracteres'),

  body('comentarioTrabajador')
    .optional()
    .isString()
    .isLength({ max: 1000 })
    .withMessage('El comentario del trabajador no puede exceder 1000 caracteres'),

  validarResultado,
];

/**
 * Validación para listar calificaciones con paginación
 */
export const validacionListarCalificaciones = [
  query('pagina')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser mayor a 0'),

  query('limite')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe estar entre 1 y 100'),

  validarResultado,
];

/**
 * Validación para obtener calificaciones de trabajador
 */
export const validacionCalificacionesTrabajador = [
  param('trabajadorId')
    .isUUID()
    .withMessage('El ID del trabajador debe ser un UUID válido'),

  query('pagina')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser mayor a 0'),

  query('limite')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe estar entre 1 y 100'),

  validarResultado,
];

/**
 * Validación para obtener estadísticas de servicio
 */
export const validacionEstadisticasServicio = [
  param('servicioId')
    .isUUID()
    .withMessage('El ID del servicio debe ser un UUID válido'),

  validarResultado,
];
