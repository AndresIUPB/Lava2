// ============================================
// TIPOS DE REQUEST/RESPONSE
// ============================================

// Autenticación
export interface RegistroRequestBody {
  email: string;
  password: string;
  nombreCompleto: string;
  telefono: string;
  tipoDocumento: string;
  numeroDocumento: string;
  ciudad: string;
  direccion: string;
  tipoVehiculo: string;
  placaVehiculo: string;
  cuidadoEspecial?: string;
}

export interface LoginRequestBody {
  email: string;
  password: string;
}

export interface RefreshTokenRequestBody {
  refreshToken: string;
}

// Usuario
export interface ActualizarPerfilRequestBody {
  nombreCompleto?: string;
  telefono?: string;
  ciudad?: string;
  direccion?: string;
  tipoVehiculo?: string;
  placaVehiculo?: string;
  cuidadoEspecial?: string;
}

// Respuestas genéricas
export interface RespuestaExito<T = any> {
  success: true;
  mensaje: string;
  data: T;
  meta?: any;
}

export interface RespuestaError {
  success: false;
  mensaje: string;
  error: {
    codigo: number;
    mensaje: string;
    detalles?: any;
  };
}
