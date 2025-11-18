import { Router } from 'express';
import { ReservacionController } from '../controllers/reservacion.controller';
import { verificarAutenticacion } from '../middleware/autenticacion';
import {
  validacionCrearReservacion,
  validacionObtenerReservacion,
  validacionCancelarReservacion,
  validacionListarReservaciones,
  validacionHistorialReservaciones,
} from '../middleware/validacionReservacion';

const router = Router();
const reservacionController = new ReservacionController();

// ⚠️ Rutas específicas (ANTES de dinámicas con :id)
router.get('/pendientes-calificacion', verificarAutenticacion, reservacionController.obtenerReservacionesPendientesCalificacion);
router.get('/historial', verificarAutenticacion, validacionHistorialReservaciones, reservacionController.obtenerHistorial);
router.get('/estadisticas', verificarAutenticacion, reservacionController.obtenerEstadisticas);

// Rutas generales
router.get('/', verificarAutenticacion, validacionListarReservaciones, reservacionController.obtenerReservaciones);

router.post('/', verificarAutenticacion, validacionCrearReservacion, reservacionController.crearReservacion);

// Rutas dinámicas (DESPUÉS de específicas)
router.get('/:id', verificarAutenticacion, validacionObtenerReservacion, reservacionController.obtenerReservacion);

router.delete('/:id', verificarAutenticacion, validacionCancelarReservacion, reservacionController.cancelarReservacion);

export default router;
