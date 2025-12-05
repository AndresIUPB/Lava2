import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { corsOptions } from './config/cors';
import { manejadorErrores } from './middleware/manejoErrores';
import { rateLimiterGeneral } from './middleware/rateLimiting';
import autenticacionRoutes from './routes/autenticacion.routes';
import servicioRoutes from './routes/servicio.routes';
import trabajadorRoutes from './routes/trabajador.routes';
import trabajadorStatsRoutes from './routes/trabajadorStats.routes';
import metodoPagoRoutes from './routes/metodoPago.routes';
import reservacionRoutes from './routes/reservacion.routes';
import calificacionRoutes from './routes/calificacion.routes';
import historialRoutes from './routes/historial.routes';
import notificacionRoutes from './routes/notificacion.routes';
import usuarioRoutes from './routes/usuario.routes';
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

// Rate limiting - Protección contra abuso
try {
  app.use(rateLimiterGeneral);
} catch (error) {
  console.warn('⚠️  Rate limiter no disponible. Continuando sin él.');
}

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

// Rutas de usuarios (completar perfil)
app.use('/api/usuarios', usuarioRoutes);


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
  app.listen(PORT, () => {
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

