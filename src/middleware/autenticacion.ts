import { Request, Response, NextFunction } from 'express';
import { verificarAccessToken } from '../utils/jwt';
import { ErrorNoAutorizado } from '../utils/errores';

// ============================================
// MIDDLEWARE DE AUTENTICACIÓN JWT
// ============================================

/**
 * Middleware que verifica la autenticación del usuario mediante JWT.
 *
 * Extrae el access token de las cookies HTTP-Only, valida su firma,
 * decodifica el payload y adjunta la información del usuario al request.
 *
 * Si el token es inválido, expirado o está ausente, lanza un ErrorNoAutorizado.
 *
 * Uso en rutas:
 * ```
 * router.get('/perfil', verificarAutenticacion, obtenerPerfil);
 * ```
 *
 * @param req - Request de Express
 * @param res - Response de Express
 * @param next - Función para pasar control al siguiente middleware
 * @throws {ErrorNoAutorizado} Si no hay token, es inválido o ha expirado
 */
export const verificarAutenticacion = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extraer token de cookie o header Authorization
    let token = req.cookies.accessToken;
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    // Validar que el token fue proporcionado
    if (!token) {
      throw new ErrorNoAutorizado('Token de acceso no proporcionado. Por favor inicia sesión.');
    }

    // Verificar y decodificar el token
    const payload = verificarAccessToken(token);

    // Adjuntar información del usuario al request
    req.usuario = payload;

    // Pasar control al siguiente middleware
    next();
  } catch (error) {
    // Si el error es nuestro ErrorNoAutorizado, pasarlo tal cual
    if (error instanceof ErrorNoAutorizado) {
      next(error);
      return;
    }

    // Si es otro error, convertirlo a ErrorNoAutorizado
    next(
      new ErrorNoAutorizado('Token inválido o expirado. Por favor inicia sesión nuevamente.')
    );
  }
};
