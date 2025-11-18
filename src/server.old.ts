import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { corsOptions } from './config/cors';
import { manejadorErrores } from './middleware/manejoErrores';
import './config/redis'; // Inicializar Redis

// ============================================
// CONFIGURACIÓN INICIAL
// ============================================

// Cargar variables de entorno
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ============================================
// MIDDLEWARES GLOBALES (en orden)
// ============================================

// CORS - Protección contra requests de orígenes no autorizados
app.use(cors(corsOptions));

// Parsers de solicitudes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ============================================
// RUTAS DE LA API
// ============================================

// Health check - verificar que el servidor está funcionando
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    mensaje: '✅ Servidor LAVA 2 funcionando correctamente',
    timestamp: new Date().toISOString(),
    ambiente: NODE_ENV,
  });
});

// Lazy load de rutas para evitar problemas de inicialización
(async () => {
  try {
    const { default: autenticacionRoutes } = await import('./routes/autenticacion.routes');
    const { default: servicioRoutes } = await import('./routes/servicio.routes');
    const { default: trabajadorRoutes } = await import('./routes/trabajador.routes');
    const { default: trabajadorStatsRoutes } = await import('./routes/trabajadorStats.routes');
    const { default: metodoPagoRoutes } = await import('./routes/metodoPago.routes');
    const { default: reservacionRoutes } = await import('./routes/reservacion.routes');
    const { default: calificacionRoutes } = await import('./routes/calificacion.routes');
    const { default: historialRoutes } = await import('./routes/historial.routes');
    const { default: notificacionRoutes } = await import('./routes/notificacion.routes');

    // Rutas de autenticación (público)
    app.use('/api/auth', autenticacionRoutes);

    // Rutas de servicios (público)
    app.use('/api/servicios', servicioRoutes);

    // Rutas de trabajadores (público)
    app.use('/api/trabajadores', trabajadorRoutes);

    // Rutas de estadísticas de trabajadores (públicas)
    app.use('/api/trabajadores', trabajadorStatsRoutes);

    // Rutas de métodos de pago (protegido)
    app.use('/api/metodos-pago', metodoPagoRoutes);

    // Rutas de reservaciones (protegido)
    app.use('/api/reservaciones', reservacionRoutes);

    // Rutas de calificaciones (protegido)
    app.use('/api/calificaciones', calificacionRoutes);

    // Rutas de historial (protegido)
    app.use('/api/historial', historialRoutes);

    // Rutas de notificaciones (protegido)
    app.use('/api/notificaciones', notificacionRoutes);
  } catch (error) {
    console.error('Error loading routes:', error);
  }
})();

// ============================================
// MANEJO DE RUTAS NO ENCONTRADAS
// ============================================

/**
 * Middleware que retorna 404 para cualquier ruta no definida.
 * Debe estar ANTES que el manejador de errores.
 */
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    mensaje: 'Ruta no encontrada',
    error: {
      codigo: 404,
      mensaje: 'La ruta solicitada no existe',
    },
  });
});

// ============================================
// MIDDLEWARE DE MANEJO DE ERRORES (SIEMPRE AL FINAL)
// ============================================

app.use(manejadorErrores);

// ============================================
// FUNCIONES DE SERVIDOR
// ============================================

/**
 * Inicia el servidor Express en el puerto configurado.
 * Registra logs de estado en la consola.
 */
export const iniciarServidor = (): void => {
  const server = app.listen(PORT, () => {
    console.log('');
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║     🚀 SERVIDOR LAVA 2 INICIADO CORRECTAMENTE         ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log('');
    console.log(`📍 URL:       http://localhost:${PORT}`);
    console.log(`🔧 Ambiente:  ${NODE_ENV}`);
    console.log(`⏱️  Hora:     ${new Date().toLocaleString('es-CO')}`);
    console.log('');
    console.log('📚 Documentación: http://localhost:3000/api-docs');
    console.log('🏥 Health Check:  http://localhost:3000/health');
    console.log('');
  });

  // Mantener el servidor activo
  server.on('error', (error) => {
    console.error('❌ Error del servidor:', error);
  });
};

// ============================================
// EXPORTAR APLICACIÓN
// ============================================

export { app };

// ============================================
// INICIAR SERVIDOR
// ============================================

// Iniciar servidor directamente
iniciarServidor();

