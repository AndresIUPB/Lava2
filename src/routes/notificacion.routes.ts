import { Router } from 'express';
import { NotificacionController } from '../controllers/notificacion.controller';
import { verificarAutenticacion } from '../middleware/autenticacion';
import {
  validacionNoLeidas,
  validacionMarcarComoLeida,
  validacionObtenerPorTipo,
  validacionEliminarNotificacion,
  validacionObtenerNotificaciones,
} from '../middleware/validacionNotificacion';

const router = Router();
const notificacionController = new NotificacionController();

// RUTAS LITERALES PRIMERO (evitar conflictos con rutas dinámicas)

// GET /api/notificaciones/no-leidas/contar
router.get(
  '/no-leidas/contar',
  verificarAutenticacion,
  validacionNoLeidas,
  notificacionController.contarNoLeidas
);

// GET /api/notificaciones/no-leidas
router.get(
  '/no-leidas',
  verificarAutenticacion,
  validacionNoLeidas,
  notificacionController.obtenerNoLeidas
);

// PUT /api/notificaciones/marcar-todos-leido
router.put(
  '/marcar-todos-leido',
  verificarAutenticacion,
  validacionNoLeidas,
  notificacionController.marcarTodasComoLeidas
);

// DELETE /api/notificaciones/leidas/limpiar
router.delete(
  '/leidas/limpiar',
  verificarAutenticacion,
  validacionNoLeidas,
  notificacionController.eliminarLeidasUsuario
);

// RUTAS CON PARÁMETROS ESPECÍFICOS

// GET /api/notificaciones/tipo/:tipo
router.get(
  '/tipo/:tipo',
  verificarAutenticacion,
  validacionObtenerPorTipo,
  notificacionController.obtenerPorTipo
);

// RUTAS GENÉRICAS (al final)

// GET /api/notificaciones
router.get(
  '/',
  verificarAutenticacion,
  validacionObtenerNotificaciones,
  notificacionController.obtenerNotificaciones
);

// PUT /api/notificaciones/:id/leida
router.put(
  '/:id/leida',
  verificarAutenticacion,
  validacionMarcarComoLeida,
  notificacionController.marcarComoLeida
);

// DELETE /api/notificaciones/:id
router.delete(
  '/:id',
  verificarAutenticacion,
  validacionEliminarNotificacion,
  notificacionController.eliminarNotificacion
);

export default router;
