import { Router } from 'express';
import { CalificacionController } from '../controllers/calificacion.controller';
import { verificarAutenticacion } from '../middleware/autenticacion';
import {
  validacionCrearCalificacion,
  validacionObtenerCalificacion,
  validacionActualizarCalificacion,
  validacionListarCalificaciones,
  validacionCalificacionesTrabajador,
  validacionEstadisticasServicio,
} from '../middleware/validacionCalificacion';

const router = Router();
const calificacionController = new CalificacionController();

// ⚠️ Rutas específicas (ANTES de dinámicas con :id)
router.get(
  '/estadisticas/servicio/:servicioId',
  verificarAutenticacion,
  validacionEstadisticasServicio,
  calificacionController.obtenerEstadisticasServicio
);

router.get(
  '/trabajador/:trabajadorId',
  verificarAutenticacion,
  validacionCalificacionesTrabajador,
  calificacionController.obtenerCalificacionesTrabajador
);

// Rutas generales
router.get(
  '/',
  verificarAutenticacion,
  validacionListarCalificaciones,
  calificacionController.obtenerCalificacionesUsuario
);

router.post(
  '/',
  verificarAutenticacion,
  validacionCrearCalificacion,
  calificacionController.crearCalificacion
);

// Rutas dinámicas (DESPUÉS de específicas)
router.get(
  '/:id',
  verificarAutenticacion,
  validacionObtenerCalificacion,
  calificacionController.obtenerCalificacion
);

router.put(
  '/:id',
  verificarAutenticacion,
  validacionActualizarCalificacion,
  calificacionController.actualizarCalificacion
);

export default router;
