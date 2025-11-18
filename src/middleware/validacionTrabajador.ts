import { param, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { respuestaError } from '../utils/respuestas';

/**
 * Valida el resultado de las cadenas de validación de express-validator.
 * Si hay errores, responde con 400 y los detalles de validación.
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
 * Validación de parámetros para obtener un trabajador por ID.
 */
export const validacionObtenerTrabajador = [
  param('id')
    .notEmpty()
    .withMessage('El ID del trabajador es obligatorio')
    .isUUID()
    .withMessage('El ID del trabajador debe ser un UUID válido'),

  validarResultado,
];

/**
 * Validación de parámetros para búsqueda de trabajadores.
 */
export const validacionBuscarTrabajador = [
  param('termino')
    .notEmpty()
    .withMessage('El término de búsqueda es obligatorio')
    .isString()
    .trim()
    .isLength({ min: 2 })
    .withMessage('El término de búsqueda debe tener al menos 2 caracteres')
    .isLength({ max: 100 })
    .withMessage('El término de búsqueda no puede exceder 100 caracteres'),

  query('pagina')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número entero mayor a 0')
    .toInt(),

  query('limite')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe estar entre 1 y 100')
    .toInt(),

  validarResultado,
];

/**
 * Validación de query parameters para listar trabajadores con paginación.
 */
export const validacionListarTrabajadores = [
  query('pagina')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número entero mayor a 0')
    .toInt(),

  query('limite')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe estar entre 1 y 100')
    .toInt(),

  validarResultado,
];

/**
 * Validación para obtener trabajadores con calificación mínima.
 */
export const validacionCalificacionMinima = [
  param('minima')
    .notEmpty()
    .withMessage('La calificación mínima es obligatoria')
    .isFloat({ min: 1, max: 5 })
    .withMessage('La calificación mínima debe estar entre 1 y 5')
    .toFloat(),

  validarResultado,
];
