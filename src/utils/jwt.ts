import jwt from 'jsonwebtoken';
import { ErrorNoAutorizado } from './errores';

// ============================================
// HELPERS JWT
// ============================================

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

export interface PayloadToken {
  id: string;
  email: string;
}

/**
 * Genera un access token JWT con duración de 15 minutos
 */
export const generarAccessToken = (payload: PayloadToken): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
};

/**
 * Genera un refresh token JWT con duración de 7 días
 */
export const generarRefreshToken = (payload: PayloadToken): string => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

/**
 * Verifica y decodifica un access token
 */
export const verificarAccessToken = (token: string): PayloadToken => {
  try {
    return jwt.verify(token, JWT_SECRET) as PayloadToken;
  } catch (error) {
    throw new ErrorNoAutorizado('Token inválido o expirado');
  }
};

/**
 * Verifica y decodifica un refresh token
 */
export const verificarRefreshToken = (token: string): PayloadToken => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as PayloadToken;
  } catch (error) {
    throw new ErrorNoAutorizado('Refresh token inválido o expirado');
  }
};
