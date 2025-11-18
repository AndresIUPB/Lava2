import { Response } from 'express';

// ============================================
// HELPERS DE RESPUESTAS HTTP
// ============================================

export const respuestaExito = (
  res: Response,
  data: any,
  mensaje: string = 'Operación exitosa',
  codigo: number = 200
): void => {
  res.status(codigo).json({
    success: true,
    mensaje,
    data
  });
};

export const respuestaError = (
  res: Response,
  mensaje: string,
  codigo: number = 500,
  detalles?: any
): void => {
  const respuesta: any = {
    success: false,
    mensaje,
    error: {
      codigo,
      mensaje
    }
  };

  // Solo incluir detalles en desarrollo
  if (process.env.NODE_ENV === 'development' && detalles) {
    respuesta.error.detalles = detalles;
  }

  res.status(codigo).json(respuesta);
};
