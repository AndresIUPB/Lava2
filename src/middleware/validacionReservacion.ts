import { body, param, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { respuestaError } from '../utils/respuestas';

export const validarResultado = (req: Request, res: Response, next: NextFunction): void => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    respuestaError(res, 'Error de validación', 400, errores.array());
    return;
  }
  next();
};

export const validacionCrearReservacion = [
  body('servicioId')
    .notEmpty()
    .withMessage('El ID del servicio es obligatorio')
    .isUUID()
    .withMessage('El ID del servicio debe ser un UUID válido'),

  body('trabajadorId')
    .optional()
    .isUUID()
    .withMessage('El ID del trabajador debe ser un UUID válido'),

  body('fechaHoraInicio')
    .notEmpty()
    .withMessage('La fecha y hora de inicio es obligatoria')
    .isISO8601()
    .withMessage('La fecha debe estar en formato ISO 8601')
    .custom((valor) => {
      const fecha = new Date(valor);
      if (isNaN(fecha.getTime())) {
        throw new Error('La fecha no es válida');
      }
      return true;
    }),

  body('direccionServicio')
    .notEmpty()
    .withMessage('La dirección del servicio es obligatoria')
    .isString()
    .isLength({ min: 10, max: 200 })
    .withMessage('La dirección debe tener entre 10 y 200 caracteres'),

  body('notasCliente')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage('Las notas no pueden exceder 500 caracteres'),

  validarResultado,
];

export const validacionObtenerReservacion = [
  param('id')
    .notEmpty()
    .withMessage('El ID de la reservación es obligatorio')
    .isUUID()
    .withMessage('El ID de la reservación debe ser un UUID válido'),

  validarResultado,
];

export const validacionCancelarReservacion = [
  param('id')
    .notEmpty()
    .withMessage('El ID de la reservación es obligatorio')
    .isUUID()
    .withMessage('El ID de la reservación debe ser un UUID válido'),

  validarResultado,
];

export const validacionListarReservaciones = [
  query('estado')
    .optional()
    .isIn(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'])
    .withMessage('El estado debe ser uno de: pending, confirmed, in_progress, completed, cancelled'),

  query('pagina')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un entero mayor a 0'),

  query('limite')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe estar entre 1 y 100'),

  validarResultado,
];

export const validacionHistorialReservaciones = [
  query('pagina')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un entero mayor a 0'),

  query('limite')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe estar entre 1 y 100'),

  validarResultado,
];
