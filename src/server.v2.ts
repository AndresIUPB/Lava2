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

// Cargar rutas dinámicamente (comentadas por ahora para testing)
setImmediate(async () => {
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

    app.use('/api/auth', autenticacionRoutes);
    app.use('/api/servicios', servicioRoutes);
    app.use('/api/trabajadores', trabajadorRoutes);
    app.use('/api/trabajadores', trabajadorStatsRoutes);
    app.use('/api/metodos-pago', metodoPagoRoutes);
    app.use('/api/reservaciones', reservacionRoutes);
    app.use('/api/calificaciones', calificacionRoutes);
    app.use('/api/historial', historialRoutes);
    app.use('/api/notificaciones', notificacionRoutes);

    console.log('✅ Todas las rutas cargadas exitosamente');
  } catch (error) {
    console.error('⚠️  Error al cargar rutas:', error instanceof Error ? error.message : error);
  }
});

// ============================================
// MANEJO DE RUTAS NO ENCONTRADAS
// ============================================

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
// MIDDLEWARE DE MANEJO DE ERRORES
// ============================================

app.use(manejadorErrores);

// ============================================
// INICIAR SERVIDOR
// ============================================

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

server.on('error', (error) => {
  console.error('❌ Error del servidor:', error);
  process.exit(1);
});

// Mantener el servidor activo
process.on('SIGINT', () => {
  console.log('\n🛑 Servidor detenido');
  server.close(() => {
    process.exit(0);
  });
});

// ============================================
// EXPORTAR APLICACIÓN
// ============================================

export { app };
export const iniciarServidor = () => { /* Ya se ejecutó arriba */ };

