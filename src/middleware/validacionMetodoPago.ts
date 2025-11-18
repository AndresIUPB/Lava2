import { body, param, validationResult } from 'express-validator';
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

export const validacionCrearMetodoPago = [
  body('tipo')
    .notEmpty()
    .withMessage('El tipo de método de pago es obligatorio')
    .isIn(['tarjeta_credito', 'tarjeta_debito', 'pse', 'efectivo'])
    .withMessage('El tipo debe ser uno de: tarjeta_credito, tarjeta_debito, pse, efectivo'),

  body('ultimos4Digitos')
    .if(() => {
      // Validación condicional: solo si el tipo es tarjeta
      return false; // Se valida en el service
    })
    .optional()
    .isLength({ min: 4, max: 4 })
    .withMessage('Los últimos 4 dígitos deben tener exactamente 4 caracteres'),

  body('nombreTitular')
    .if(() => false) // Se valida en el service
    .optional()
    .isLength({ min: 3, max: 100 })
    .withMessage('El nombre del titular debe tener entre 3 y 100 caracteres'),

  body('fechaExpiracion')
    .if(() => false) // Se valida en el service
    .optional()
    .matches(/^\d{2}\/\d{2}$/)
    .withMessage('La fecha de expiración debe estar en formato MM/YY'),

  body('marca')
    .if(() => false) // Se valida en el service
    .optional()
    .isIn(['Visa', 'Mastercard', 'American Express', 'Diners'])
    .withMessage('La marca debe ser una de: Visa, Mastercard, American Express, Diners'),

  validarResultado,
];

export const validacionObtenerMetodoPago = [
  param('id')
    .notEmpty()
    .withMessage('El ID del método de pago es obligatorio')
    .isUUID()
    .withMessage('El ID del método de pago debe ser un UUID válido'),

  validarResultado,
];

export const validacionDesactivarMetodoPago = [
  param('id')
    .notEmpty()
    .withMessage('El ID del método de pago es obligatorio')
    .isUUID()
    .withMessage('El ID del método de pago debe ser un UUID válido'),

  validarResultado,
];

export const validacionMarcarPrincipal = [
  param('id')
    .notEmpty()
    .withMessage('El ID del método de pago es obligatorio')
    .isUUID()
    .withMessage('El ID del método de pago debe ser un UUID válido'),

  validarResultado,
];
