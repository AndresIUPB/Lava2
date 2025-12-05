import { Router } from 'express';
import { AutenticacionController } from '../controllers/autenticacion.controller';
import {
  validacionRegistro,
  validacionLogin,
  validacionRegistroInicial,
  validacionRefresh,
  validacionLogout,
} from '../middleware/validacion';

// ============================================
// RUTAS DE AUTENTICACIÓN
// ============================================

const router = Router();
const autenticacionController = new AutenticacionController();

/**
 * POST /auth/registro
 * Registrar nuevo usuario
 *
 * Body requerido:
 * {
 *   "email": "usuario@email.com",
 *   "password": "mipassword123",
 *   "nombreCompleto": "Juan Pérez",
 *   "telefono": "+57 300 123 4567",
 *   "tipoDocumento": "CC",
 *   "numeroDocumento": "1234567890",
 *   "ciudad": "Medellín",
 *   "direccion": "Calle 123 #45-67",
 *   "tipoVehiculo": "carro",
 *   "placaVehiculo": "ABC123",
 *   "cuidadoEspecial": "Llevar con cuidado" (opcional)
 * }
 *
 * Respuesta exitosa: 201 Created
 * {
 *   "success": true,
 *   "mensaje": "Usuario registrado exitosamente",
 *   "data": {
 *     "usuario": { ... },
 *     "accessToken": "...",
 *     "refreshToken": "..."
 *   }
 * }
 */
router.post(
  '/registro',
  validacionRegistro,
  autenticacionController.registrar
);

/**
 * POST /auth/registro-inicial
 * Registrar nuevo usuario (registro inicial)
 *
 * Body requerido:
 * {
 *   "email": "usuario@email.com",
 *   "password": "mipassword123"
 * }
 *
 * Respuesta exitosa: 201 Created
 * {
 *   "success": true,
 *   "mensaje": "Usuario registrado exitosamente",
 *   "data": {
 *     "usuario": { ... },
 *     "accessToken": "...",
 *     "refreshToken": "..."
 *   }
 * }
 */
router.post(
  '/registro-inicial',
  validacionRegistroInicial,
  autenticacionController.registrarInicial
);

/**
 * POST /auth/login
 * Iniciar sesión
 *
 * Body requerido:
 * {
 *   "email": "usuario@email.com",
 *   "password": "mipassword123"
 * }
 *
 * Respuesta exitosa: 200 OK
 * {
 *   "success": true,
 *   "mensaje": "Inicio de sesión exitoso",
 *   "data": {
 *     "usuario": { ... },
 *     "accessToken": "...",
 *     "refreshToken": "..."
 *   }
 * }
 */
router.post('/login', validacionLogin, autenticacionController.iniciarSesion);

/**
 * POST /auth/refresh
 * Renovar access token
 *
 * Body requerido:
 * {
 *   "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 * }
 *
 * Respuesta exitosa: 200 OK
 * {
 *   "success": true,
 *   "mensaje": "Token renovado exitosamente",
 *   "data": {
 *     "accessToken": "..."
 *   }
 * }
 */
router.post(
  '/refresh',
  validacionRefresh,
  autenticacionController.renovarToken
);

// Alias para compatibilidad con frontend
router.post(
  '/refresh-token',
  validacionRefresh,
  autenticacionController.renovarToken
);

/**
 * POST /auth/logout
 * Cerrar sesión y revocar refresh token
 *
 * Body requerido:
 * {
 *   "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 * }
 *
 * Respuesta exitosa: 200 OK
 * {
 *   "success": true,
 *   "mensaje": "Sesión cerrada exitosamente",
 *   "data": null
 * }
 */
router.post(
  '/logout',
  validacionLogout,
  autenticacionController.cerrarSesion
);

export default router;
