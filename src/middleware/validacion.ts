import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { respuestaError } from '../utils/respuestas';

// ============================================
// VALIDADOR DE RESULTADOS
// ============================================

/**
 * Middleware que valida y retorna los resultados de express-validator.
 * Si hay errores, los retorna en la respuesta HTTP.
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

// ============================================
// VALIDACIONES DE AUTENTICACIÓN
// ============================================

/**
 * Validaciones para el endpoint POST /auth/registro
 * Valida todos los campos necesarios para registro de usuario
 */
export const validacionRegistro = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('El email es obligatorio')
    .isEmail()
    .withMessage('El email debe tener un formato válido'),

  body('password')
    .notEmpty()
    .withMessage('La contraseña es obligatoria')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres'),

  body('nombreCompleto')
    .trim()
    .notEmpty()
    .withMessage('El nombre completo es obligatorio')
    .isLength({ min: 3, max: 100 })
    .withMessage('El nombre completo debe tener entre 3 y 100 caracteres'),

  body('telefono')
    .trim()
    .notEmpty()
    .withMessage('El teléfono es obligatorio')
    .matches(/^\+?57\s?3\d{2}\s?\d{3}\s?\d{4}$|^\+573\d{9}$/)
    .withMessage(
      'El teléfono debe tener formato colombiano válido (ej: +57 300 123 4567)'
    ),

  body('tipoDocumento')
    .notEmpty()
    .withMessage('El tipo de documento es obligatorio')
    .isIn(['CC', 'CE', 'Pasaporte'])
    .withMessage('El tipo de documento debe ser CC, CE o Pasaporte'),

  body('numeroDocumento')
    .trim()
    .notEmpty()
    .withMessage('El número de documento es obligatorio')
    .matches(/^\d+$/)
    .withMessage('El número de documento solo puede contener números'),

  body('ciudad')
    .trim()
    .notEmpty()
    .withMessage('La ciudad es obligatoria')
    .isLength({ min: 2, max: 50 })
    .withMessage('La ciudad debe tener entre 2 y 50 caracteres'),

  body('direccion')
    .trim()
    .notEmpty()
    .withMessage('La dirección es obligatoria')
    .isLength({ min: 10, max: 200 })
    .withMessage('La dirección debe tener entre 10 y 200 caracteres'),

  body('tipoVehiculo')
    .notEmpty()
    .withMessage('El tipo de vehículo es obligatorio')
    .isIn(['carro', 'moto', 'camioneta'])
    .withMessage('El tipo de vehículo debe ser carro, moto o camioneta'),

  body('placaVehiculo')
    .trim()
    .toUpperCase()
    .notEmpty()
    .withMessage('La placa del vehículo es obligatoria')
    .matches(/^[A-Z]{3}\d{3}$/)
    .withMessage(
      'La placa debe tener formato colombiano: 3 letras seguidas de 3 números (ej: ABC123)'
    ),

  body('cuidadoEspecial')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('El cuidado especial no puede exceder 200 caracteres'),

  validarResultado,
];

/**
 * Validación mínima para registro inicial: sólo email + password
 */
export const validacionRegistroInicial = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('El email es obligatorio')
    .isEmail()
    .withMessage('El email debe tener un formato válido'),

  body('password')
    .notEmpty()
    .withMessage('La contraseña es obligatoria')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres'),

  validarResultado,
];

/**
 * Validaciones para el endpoint POST /auth/login
 * Valida email y contraseña para inicio de sesión
 */
export const validacionLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('El email es obligatorio')
    .isEmail()
    .withMessage('El email debe tener un formato válido'),

  body('password')
    .notEmpty()
    .withMessage('La contraseña es obligatoria'),

  validarResultado,
];

/**
 * Validaciones para el endpoint POST /auth/refresh
 * Valida que el refresh token sea proporcionado
 */
export const validacionRefresh = [
  body('refreshToken')
    .notEmpty()
    .withMessage('El refresh token es obligatorio')
    .isString()
    .withMessage('El refresh token debe ser una cadena de texto'),

  validarResultado,
];

/**
 * Validaciones para el endpoint POST /auth/logout
 * Valida que el refresh token sea proporcionado para logout
 */
export const validacionLogout = [
  body('refreshToken')
    .notEmpty()
    .withMessage('El refresh token es obligatorio')
    .isString()
    .withMessage('El refresh token debe ser una cadena de texto'),

  validarResultado,
];
