/**
 * Validaciones de Servicios
 * Validaciones específicas para endpoints de servicios
 */

import { param, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { respuestaError } from '../utils/respuestas';

/**
 * Middleware que valida y retorna los resultados de express-validator
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
 * Validación de ID de servicio en parámetros de ruta
 * Uso: GET /api/servicios/:id
 */
export const validacionIdServicio = [
  param('id')
    .notEmpty()
    .withMessage('El ID del servicio es obligatorio')
    .isUUID()
    .withMessage('El ID del servicio debe ser un UUID válido'),

  validarResultado,
];

/**
 * Validación de término de búsqueda
 * Uso: GET /api/servicios/buscar/:termino
 */
export const validacionTerminoBusqueda = [
  param('termino')
    .notEmpty()
    .withMessage('El término de búsqueda es obligatorio')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El término debe tener entre 2 y 50 caracteres'),

  validarResultado,
];

/**
 * Validación de parámetros de paginación
 * Uso: GET /api/servicios?pagina=1&limite=20
 */
export const validacionPaginacion = [
  query('pagina')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número entero mayor a 0'),

  query('limite')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe estar entre 1 y 100'),

  validarResultado,
];
